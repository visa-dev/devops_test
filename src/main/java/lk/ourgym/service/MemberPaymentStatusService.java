package lk.ourgym.service;

import lk.ourgym.dto.MemberPaymentStatusDTO;
import lk.ourgym.dto.PaymentSummaryDTO;
import lk.ourgym.model.Member;
import lk.ourgym.repository.MemberRepository;
import lk.ourgym.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberPaymentStatusService {
    
    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    
    public List<MemberPaymentStatusDTO> getAllMembersPaymentStatus() {
        List<Member> activeMembers = memberRepository.findAllActiveMembers();
        List<MemberPaymentStatusDTO> statusList = new ArrayList<>();
        
        for (Member member : activeMembers) {
            MemberPaymentStatusDTO status = calculateMemberPaymentStatus(member);
            if (status != null) {
                statusList.add(status);
            }
        }
        
        return statusList;
    }
    
    public MemberPaymentStatusDTO getMemberPaymentStatus(Long memberId) {
        Member member = memberRepository.findById(memberId).orElse(null);
        if (member == null) return null;
        return calculateMemberPaymentStatus(member);
    }
    
    private MemberPaymentStatusDTO calculateMemberPaymentStatus(Member member) {
        if (member.getMembership() == null) return null;
        
        MemberPaymentStatusDTO dto = new MemberPaymentStatusDTO();
        dto.setMemberId(member.getId());
        dto.setMemberName(member.getName());
        dto.setMembershipName(member.getMembership().getName());
        dto.setMonthlyAmount(member.getMembership().getPrice());
        
        YearMonth currentYM = YearMonth.now();
        dto.setCurrentMonth(currentYM.toString());
        
        String lastPaidMonth = paymentRepository.getLastPaidMonth(member.getId());
        dto.setLastPaymentMonth(lastPaidMonth);
        
        boolean isPaidForCurrentMonth = lastPaidMonth != null && lastPaidMonth.equals(currentYM.toString());
        dto.setIsPaidForCurrentMonth(isPaidForCurrentMonth);
        
        // Simple status: PAID or NOT_PAID
        if (isPaidForCurrentMonth) {
            dto.setStatus("PAID");
        } else {
            dto.setStatus("NOT_PAID");
        }
        
        return dto;
    }
    
    public List<MemberPaymentStatusDTO> getPaidMembers() {
        return getAllMembersPaymentStatus().stream()
            .filter(s -> "PAID".equals(s.getStatus()))
            .collect(Collectors.toList());
    }
    
    public List<MemberPaymentStatusDTO> getNotPaidMembers() {
        return getAllMembersPaymentStatus().stream()
            .filter(s -> "NOT_PAID".equals(s.getStatus()))
            .collect(Collectors.toList());
    }
    
    public PaymentSummaryDTO getPaymentSummary() {
        List<MemberPaymentStatusDTO> allStatus = getAllMembersPaymentStatus();
        
        PaymentSummaryDTO summary = new PaymentSummaryDTO();
        summary.setTotalMembers((long) allStatus.size());
        summary.setPaidCount(allStatus.stream().filter(s -> "PAID".equals(s.getStatus())).count());
        summary.setNotPaidCount(allStatus.stream().filter(s -> "NOT_PAID".equals(s.getStatus())).count());
        
        return summary;
    }
}
