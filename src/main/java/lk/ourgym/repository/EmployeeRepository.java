package lk.ourgym.repository;

import lk.ourgym.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Database access for the Employee entity.
 * Spring Data JPA automatically provides basic CRUD operations.
 * Custom queries are defined below using JPQL (Java Persistence Query
 * Language).
 */
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    /** Find an employee by their NIC number (used to check for duplicates). */
    @Query("SELECT e FROM Employee e WHERE e.nic = ?1")
    Employee getByNic(String nic);

    /** Find an employee by their mobile number (used to check for duplicates). */
    @Query("SELECT e FROM Employee e WHERE e.mobileno = ?1")
    Employee getByMobileno(String mobileno);

    /** Find an employee by their email address (used to check for duplicates). */
    @Query("SELECT e FROM Employee e WHERE e.email = ?1")
    Employee getByEmail(String email);

    /** Returns all active (non-deleted) employees with selected fields only. */
    @Query("SELECT new Employee(e.id, e.firstname, e.lastname, e.nic, e.mobileno, e.dob, e.email, e.designation_id, e.trainertype_id) FROM Employee e WHERE e.deleteddatetime IS NULL")
    List<Employee> getSelectedColumn();

    /** Returns employees who do not yet have a user account linked to them. */
    @Query("SELECT e FROM Employee e WHERE e.id NOT IN (SELECT u.employee_id.id FROM User u WHERE u.employee_id IS NOT NULL)")
    List<Employee> getEmployeeListWithoutUserAccount();
}
