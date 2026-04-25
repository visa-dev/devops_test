package lk.ourgym.controller;

import lk.ourgym.dto.MemberPaymentStatusDTO;
import lk.ourgym.dto.PaymentSummaryDTO;
import lk.ourgym.service.MemberPaymentStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member-payment-status")
@RequiredArgsConstructor
public class MemberPaymentStatusController {
    
    private final MemberPaymentStatusService paymentStatusService;
    
    @GetMapping("/all")
    public List<MemberPaymentStatusDTO> getAllMembersPaymentStatus() {
        return paymentStatusService.getAllMembersPaymentStatus();
    }
    
    @GetMapping("/member/{memberId}")
    public MemberPaymentStatusDTO getMemberPaymentStatus(@PathVariable Long memberId) {
        return paymentStatusService.getMemberPaymentStatus(memberId);
    }
    
    @GetMapping("/paid")
    public List<MemberPaymentStatusDTO> getPaidMembers() {
        return paymentStatusService.getPaidMembers();
    }
    
    @GetMapping("/not-paid")
    public List<MemberPaymentStatusDTO> getNotPaidMembers() {
        return paymentStatusService.getNotPaidMembers();
    }
    
    @GetMapping("/summary")
    public PaymentSummaryDTO getPaymentSummary() {
        return paymentStatusService.getPaymentSummary();
    }
}
