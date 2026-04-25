package lk.ourgym.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a trainer type (e.g. Fitness Trainer, Yoga Trainer).
 * Used to further categorize employees who are trainers.
 */
@Entity
@Table(name = "trainertype")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrainerType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
}
