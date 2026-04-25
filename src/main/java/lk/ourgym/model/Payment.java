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
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Double amount;
    private String paymentType;
    private String paymentMethod;
    private String status;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;
    
    @ManyToOne
    @JoinColumn(name = "membership_id")
    private Membership membership;
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    private LocalDateTime paymentDate;
    private String paymentForMonth; // Format: YYYY-MM
    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deleteddatetime;
}
