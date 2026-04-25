package lk.ourgym.controller;

import lk.ourgym.model.User;
import lk.ourgym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Handles all user account operations:
 * viewing, saving, updating, and deleting user accounts.
 */
@RestController
public class UserController implements CommonController<User> {

    @Autowired
    private UserRepository userDao;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    /**
     * Shows the User management page.
     */
    @RequestMapping(value = "user", method = RequestMethod.GET)
    public ModelAndView getUserPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("user.html");
        return mav;
    }

    /**
     * Returns a single user by their ID.
     * Example: GET /user/byid/1
     */
    @GetMapping(value = "/user/byid/{id}", produces = "application/json")
    public User getRoleByUserId(@PathVariable(name = "id") Integer id) {
        return userDao.findById(id).orElse(null);
    }

    /**
     * Returns all users except the admin account.
     */
    @GetMapping(value = "/user/alldata", produces = "application/json")
    @Override
    public List<User> getAllData() {
        return userDao.getSelectedColumn();
    }

    /**
     * Saves a new user account.
     * Checks for duplicate email and employee before saving.
     * The password is hashed with BCrypt before storage.
     */
    @PostMapping(value = "/user/save")
    @Override
    public String getSaveData(@RequestBody User user) {

        // Check if the email is already taken
        if (userDao.getByUseremail(user.getEmail()) != null) {
            return "Save Not Completed! User email already exists";
        }

        // Check if the employee already has a user account
        if (userDao.getByEmployee_id(user.getEmployee_id().getId()) != null) {
            return "Save Not Completed! Employee already has a user account";
        }

        try {
            user.setAddeddatetime(LocalDateTime.now());

            // Hash the password before saving — never store plain-text passwords
            if (user.getPassword() != null) {
                user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            }

            userDao.save(user);
            return "OK";
        } catch (Exception e) {
            return "User Save Not Completed: " + e.getMessage();
        }
    }

    /**
     * Updates an existing user account.
     * Only updates the password if a new one is provided.
     */
    @PutMapping(value = "/user/update")
    @Override
    public String getUpdateData(@RequestBody User user) {

        // Check the user exists
        User existingUser = userDao.findById(user.getId()).orElse(null);
        if (existingUser == null) {
            return "Update Not Completed! User not found";
        }

        // Check the email is not already used by another user
        User userByEmail = userDao.getByUseremail(user.getEmail());
        if (userByEmail != null && !userByEmail.getId().equals(user.getId())) {
            return "Update Not Completed! Email already exists";
        }

        try {
            existingUser.setUsername(user.getUsername());
            existingUser.setEmail(user.getEmail());
            existingUser.setEmployee_id(user.getEmployee_id());
            existingUser.setRoles(user.getRoles());
            existingUser.setStatus(user.getStatus());

            // Only update the password if a new one was provided
            // We also check if it's different from the current hash to prevent re-hashing
            if (user.getPassword() != null && !user.getPassword().isEmpty()
                    && !user.getPassword().equals(existingUser.getPassword())) {
                existingUser.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            }

            // If re-activated, clear the deleted timestamp
            if (user.getStatus()) {
                existingUser.setDeleteddatetime(null);
            }

            existingUser.setUpdateddatetime(LocalDateTime.now());
            userDao.save(existingUser);
            return "OK";
        } catch (Exception e) {
            return "User Update Not Completed: " + e.getMessage();
        }
    }

    /**
     * Permanently deletes a user account from the database.
     */
    @DeleteMapping(value = "/user/delete")
    @Override
    public String getDeleteData(@RequestBody User user) {

        // Check the user exists before deleting
        User existingUser = userDao.findById(user.getId()).orElse(null);
        if (existingUser == null) {
            return "User not deleted: User Not Found";
        }

        try {
            userDao.deleteById(user.getId());
            return "OK";
        } catch (Exception e) {
            return "User Delete Not Completed (Constraint Violation): " + e.getMessage();
        }
    }
}
