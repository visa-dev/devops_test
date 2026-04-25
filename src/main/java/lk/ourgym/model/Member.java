package lk.ourgym.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String nic;
    private String mobileno;
    private String email;
    private String address;
    private Boolean status;
    
    @ManyToOne
    @JoinColumn(name = "membership_id")
    private Membership membership;
    
    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deleteddatetime;
}