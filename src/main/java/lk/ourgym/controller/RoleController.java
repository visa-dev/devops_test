package lk.ourgym.controller;

import lk.ourgym.model.Role;
import lk.ourgym.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Provides read-only access to role data.
 * Used by the frontend to populate role selection dropdowns.
 */
@RestController
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    /**
     * Returns all roles (used for dropdowns and role management).
     */
    @GetMapping(value = "/role/alldatawithoutadmin", produces = "application/json")
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    /**
     * Returns all roles assigned to a specific user.
     * Example: GET /role/byuser/3
     */
    @GetMapping(value = "/role/byuser/{userid}", produces = "application/json")
    public List<Role> getRoleByUserId(@PathVariable(name = "userid") Integer userid) {
        return roleRepository.getRoleByUserId(userid);
    }
}
