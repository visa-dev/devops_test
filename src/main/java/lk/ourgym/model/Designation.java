package lk.ourgym.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an employee designation (e.g. Manager, Trainer, Receptionist).
 * Used to categorize employees by their job role.
 */
@Entity
@Table(name = "designation")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Designation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
}
