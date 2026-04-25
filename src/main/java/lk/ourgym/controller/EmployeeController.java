package lk.ourgym.controller;

import lk.ourgym.model.Employee;
import lk.ourgym.model.User;
import lk.ourgym.repository.EmployeeRepository;
import lk.ourgym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Handles all employee-related operations:
 * viewing, saving, updating, and (soft) deleting employees.
 */
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeDao;

    @Autowired
    private UserRepository userDao;

    /**
     * Shows the Employee management page.
     */
    @RequestMapping("/employee")
    public ModelAndView employeePage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("employee.html");
        return mav;
    }

    /**
     * Returns a single employee by their ID (path variable).
     * Example: GET /employee/byid/1
     */
    @GetMapping(value = "employee/byid/{empid}", produces = "application/json")
    public Employee getEmployeeById(@PathVariable Integer empid) {
        return employeeDao.getReferenceById(empid);
    }

    /**
     * Returns a single employee by their ID (query parameter).
     * Example: GET /employee/byid?id=1
     */
    @GetMapping(value = "employee/byid", params = { "id" }, produces = "application/json")
    public Employee getEmployeeByIdQP(@RequestParam("id") Integer empid) {
        return employeeDao.getReferenceById(empid);
    }

    /**
     * Returns all employees.
     */
    @GetMapping(value = "/employee/alldata", produces = "application/json")
    public List<Employee> getEmployeeAllData() {
        return employeeDao.findAll();
    }

    /**
     * Returns employees who do not yet have a user account.
     * Used when creating a new user to show eligible employees.
     */
    @GetMapping(value = "/employee/listwithoutuseraccount", produces = "application/json")
    public List<Employee> getEmployeeListWithoutUserAccount() {
        return employeeDao.getEmployeeListWithoutUserAccount();
    }

    /**
     * Soft-deletes an employee by setting their deleted timestamp.
     * Also deactivates their linked user account if one exists.
     */
    @DeleteMapping(value = "/employee/delete")
    public String deleteEmployee(@RequestBody Employee employee) {

        // Check that the employee exists
        Employee existingEmployee = employeeDao.findById(employee.getId()).orElse(null);
        if (existingEmployee == null) {
            return "Employee not deleted: " + employee.getFirstname() + " " + employee.getLastname() + " not found";
        }

        try {
            // Soft delete: mark the record with a deletion timestamp instead of removing it
            existingEmployee.setDeleteddatetime(LocalDateTime.now());
            employeeDao.save(existingEmployee);

            // Also deactivate the linked user account, if any
            User linkedUser = userDao.getByEmployee_id(existingEmployee.getId());
            if (linkedUser != null) {
                linkedUser.setStatus(false);
                linkedUser.setDeleteddatetime(LocalDateTime.now());
                userDao.save(linkedUser);
            }

            return "OK";
        } catch (Exception e) {
            return "Employee Delete Not Completed: " + e.getMessage();
        }
    }

    /**
     * Saves a new employee to the database.
     * Checks for duplicate NIC, mobile number, and email before saving.
     */
    @PostMapping(value = "/employee/save")
    public String saveEmployee(@RequestBody Employee employee) {

        // Duplicate checks
        if (employeeDao.getByNic(employee.getNic()) != null) {
            return "Save Not Completed! Given NIC Already Exists";
        }
        if (employeeDao.getByMobileno(employee.getMobileno()) != null) {
            return "Save Not Completed! Given Mobile Number Already Exists";
        }
        if (employeeDao.getByEmail(employee.getEmail()) != null) {
            return "Save Not Completed! Given Email Already Exists";
        }

        try {
            employeeDao.save(employee);
            return "OK";
        } catch (Exception e) {
            return "Employee Save Not Completed: " + e.getMessage();
        }
    }

    /**
     * Updates an existing employee record.
     * Checks that the employee exists and the NIC is not already taken by someone
     * else.
     */
    @PutMapping("/employee/update")
    public String updateEmployee(@RequestBody Employee employee) {

        // Check the employee exists
        Employee existingEmployee = employeeDao.findById(employee.getId()).orElse(null);
        if (existingEmployee == null) {
            return "Employee not Updated: " + employee.getFirstname() + " " + employee.getLastname() + " not found";
        }

        // Check the NIC is not used by a different employee
        Employee employeeByNic = employeeDao.getByNic(employee.getNic());
        if (employeeByNic != null && !employeeByNic.equals(existingEmployee)) {
            return "Update Not Completed! Given NIC Already Exists";
        }

        try {
            employee.setUpdateddatetime(LocalDateTime.now());
            employeeDao.save(employee);
            return "OK";
        } catch (Exception e) {
            return "Employee Update Not Completed: " + e.getMessage();
        }
    }
}
