package lk.ourgym.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a privilege (fine-grained permission) in the system.
 * Privileges are used to control specific actions within a role.
 * (Full implementation is not yet complete.)
 */
@Entity
@Table(name = "privilege")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Privilege {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
}
