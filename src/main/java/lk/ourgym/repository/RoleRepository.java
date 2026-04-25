package lk.ourgym.repository;

import lk.ourgym.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Database access for the Role entity.
 * Spring Data JPA automatically provides basic CRUD operations.
 */
public interface RoleRepository extends JpaRepository<Role, Integer> {

    /**
     * Returns all roles except the Admin role (used in non-admin role dropdowns).
     */
    @Query("SELECT r FROM Role r WHERE r.name <> 'Admin'")
    List<Role> findAllRoleWithoutAdmin();

    /** Returns all roles assigned to a specific user. */
    @Query("SELECT r FROM User u JOIN u.roles r WHERE u.id = ?1")
    List<Role> getRoleByUserId(Integer userid);

    /** Find a role by its name (e.g. "Admin", "Manager"). */
    @Query("SELECT r FROM Role r WHERE r.name = ?1")
    Role findByName(String name);
}
