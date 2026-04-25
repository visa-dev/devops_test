package lk.ourgym.controller;

import lk.ourgym.model.Designation;
import lk.ourgym.model.Role;
import lk.ourgym.model.TrainerType;
import lk.ourgym.model.User;
import lk.ourgym.repository.DesignationRepository;
import lk.ourgym.repository.RoleRepository;
import lk.ourgym.repository.TrainerTypeRepository;
import lk.ourgym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Handles login, logout, dashboard, and system initialization.
 */
@Controller
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DesignationRepository designationRepository;

    @Autowired
    private TrainerTypeRepository trainerTypeRepository;

    @Autowired
    private lk.ourgym.repository.EmployeeRepository employeeRepository;

    @Autowired
    private lk.ourgym.repository.MemberRepository memberRepository;

    @Autowired
    private lk.ourgym.repository.MembershipRepository membershipRepository;

    @Autowired
    private lk.ourgym.repository.ClassRepository classRepository;

    @Autowired
    private lk.ourgym.repository.BatchRepository batchRepository;

    @Autowired
    private lk.ourgym.service.MemberPaymentStatusService paymentStatusService;

    /**
     * Shows the login page.
     */
    @RequestMapping("/login")
    public ModelAndView loginPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("login.html");
        return mav;
    }

    /**
     * Shows the dashboard page with summary statistics.
     */
    @RequestMapping("/dashboard")
    public ModelAndView dashboardPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("dashboard.html");

        // Get the currently logged-in user's name and role
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            mav.addObject("loggedusername", username);
            
            // Get user role
            User user = userRepository.getByUsername(username);
            if (user != null && user.getRoles() != null && !user.getRoles().isEmpty()) {
                mav.addObject("userRole", user.getRoles().get(0).getName());
            }
        }

        // Pass gym-related counts to display on the dashboard
        mav.addObject("totalMembers", memberRepository.countActiveMembers());
        mav.addObject("totalMemberships", membershipRepository.count());
        mav.addObject("totalEmployees", employeeRepository.count());
        mav.addObject("activeClasses", classRepository.count());
        mav.addObject("activeBatches", batchRepository.count());
        
        // Payment status summary
        var paymentSummary = paymentStatusService.getPaymentSummary();
        mav.addObject("paidCount", paymentSummary.getPaidCount());
        mav.addObject("notPaidCount", paymentSummary.getNotPaidCount());

        return mav;
    }

    /**
     * Shows the access-denied error page.
     */
    @RequestMapping("/errorpage")
    public ModelAndView errorPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("error.html");
        return mav;
    }

    /**
     * One-time setup endpoint. Seeds all required lookup data and creates the admin
     * user.
     * Visit http://localhost:8080/createadmin to initialize the system on a new
     * database.
     *
     * Admin credentials: username=admin, password=12345
     */
    @RequestMapping("/createadmin")
    public ModelAndView createAdmin() {

        // --- Seed Roles ---
        String[] roleNames = { "Admin", "Trainer", "Receptionist" };
        for (String roleName : roleNames) {
            if (roleRepository.findByName(roleName) == null) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
        }

        // --- Seed Designations ---
        String[] designationNames = { "Trainer", "Receptionist" };
        for (String designationName : designationNames) {
            if (designationRepository.findByName(designationName) == null) {
                Designation designation = new Designation();
                designation.setName(designationName);
                designationRepository.save(designation);
            }
        }

        // --- Seed Trainer Types ---
        String[] trainerTypes = { "Fitness Trainer", "Yoga Trainer", "Aerobics Trainer", "Swimming Trainer" };
        for (String typeName : trainerTypes) {
            if (trainerTypeRepository.findByName(typeName) == null) {
                TrainerType trainerType = new TrainerType();
                trainerType.setName(typeName);
                trainerTypeRepository.save(trainerType);
            }
        }

        // --- Create or Sync Admin User ---
        User adminUser = userRepository.getByUsername("admin");
        if (adminUser == null) {
            adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("ourgym@gmail.com");
            adminUser.setAddeddatetime(LocalDateTime.now());
        }

        // Always ensure the admin account is active with the correct password
        adminUser.setStatus(Boolean.TRUE);
        adminUser.setPassword(bCryptPasswordEncoder.encode("12345"));

        // Assign the Admin role to the admin user
        List<Role> roleList = new ArrayList<>();
        roleList.add(roleRepository.findByName("Admin"));
        adminUser.setRoles(roleList);

        userRepository.save(adminUser);

        // Redirect back to the login page after setup
        return new ModelAndView("redirect:/login");
    }
}
