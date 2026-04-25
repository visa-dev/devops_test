package lk.ourgym.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a user account in the system.
 * Each user is linked to an employee and has one or more roles
 * that determine what they can access.
 */
@Entity
@Table(name = "user")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String username;
    private String password;
    private String email;

    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deleteddatetime;

    /** Whether this account is active (true) or disabled (false). */
    private Boolean status;

    private String note;
    private byte[] user_photo;

    /**
     * The employee this user account belongs to.
     * One employee can have one user account.
     */
    @ManyToOne
    @JoinColumn(name = "employee_id", referencedColumnName = "id")
    private Employee employee_id;

    /**
     * The roles assigned to this user (e.g. Admin, Manager, Trainer).
     * Roles control which pages the user can access.
     */
    @ManyToMany
    @JoinTable(name = "user_has_role", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private List<Role> roles;

    public User(Integer id, String username, String email, Employee employee_id, Boolean status) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.employee_id = employee_id;
        this.status = status;
    }
}
