package lk.ourgym.repository;

import lk.ourgym.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Database access for the User entity.
 * Spring Data JPA automatically provides basic CRUD operations.
 * Custom queries are defined below using JPQL (Java Persistence Query
 * Language).
 */
public interface UserRepository extends JpaRepository<User, Integer> {

    /** Find a user by their email address. */
    @Query("SELECT u FROM User u WHERE u.email = ?1")
    User getByUseremail(String email);

    /** Find a user linked to a specific employee ID. */
    @Query("SELECT u FROM User u WHERE u.employee_id.id = ?1")
    User getByEmployee_id(Integer id);

    /** Returns all users except the main admin account. */
    @Query("SELECT u FROM User u WHERE u.username <> 'admin'")
    List<User> getSelectedColumn();

    /** Find a user by their username (used during login). */
    @Query("SELECT u FROM User u WHERE u.username = ?1")
    User getByUsername(String username);
}
