package lk.ourgym.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberPaymentStatusDTO {
    private Long memberId;
    private String memberName;
    private String membershipName;
    private Double monthlyAmount;
    
    // Payment status
    private String lastPaymentMonth;
    private String currentMonth;
    private Boolean isPaidForCurrentMonth;
    
    // Simple status: PAID or NOT_PAID
    private String status;
}
