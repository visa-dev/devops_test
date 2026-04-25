package lk.ourgym.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentSummaryDTO {
    private Long totalMembers;
    private Long paidCount;
    private Long notPaidCount;
}
