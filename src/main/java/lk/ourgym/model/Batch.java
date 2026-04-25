package lk.ourgym.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private String schedule;
    private Integer maxCapacity;
    private Boolean status;
    
    @ManyToOne
    @JoinColumn(name = "trainer_type_id")
    private TrainerType trainerType;
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deleteddatetime;
}
