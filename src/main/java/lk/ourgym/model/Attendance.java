package lk.ourgym.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    
    @ManyToOne
    @JoinColumn(name = "marked_by")
    private User markedBy;
    
    private String notes;
    private String status; // PRESENT, ABSENT, LATE
    
    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
}
