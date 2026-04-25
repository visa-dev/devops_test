package lk.ourgym.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents an employee in the gym.
 * Each employee can be linked to a designation and a trainer type.
 */
@Entity
@Table(name = "employee")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Employee {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private String firstname;
  private String lastname;
  private String nic;
  private String gender;
  private String mobileno;
  private String email;
  private LocalDate dob;

  private LocalDateTime addeddatetime;
  private LocalDateTime updateddatetime;
  private LocalDateTime deleteddatetime;

  /**
   * The job designation of this employee (e.g. Trainer, Manager).
   * Many employees can share the same designation.
   */
  @ManyToOne
  @JoinColumn(name = "designation_id", referencedColumnName = "id")
  private Designation designation_id;

  /**
   * The trainer type of this employee (only applicable for trainers).
   */
  @ManyToOne
  @JoinColumn(name = "trainertype_id", referencedColumnName = "id")
  private TrainerType trainertype_id;

  public Employee(Integer id, String firstname, String lastname, String nic, String mobileno,
      LocalDate dob, String email, Designation designation_id, TrainerType trainertype_id) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.nic = nic;
    this.mobileno = mobileno;
    this.dob = dob;
    this.email = email;
    this.designation_id = designation_id;
    this.trainertype_id = trainertype_id;
  }
}
