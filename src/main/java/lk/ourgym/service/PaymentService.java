package lk.ourgym.service;

import lk.ourgym.model.Payment;
import lk.ourgym.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    
    public List<Payment> getAll() {
        return paymentRepository.getActivePayments();
    }
    
    public Payment getById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }
    
    public Payment save(Payment payment) {
        if (payment.getId() == null) {
            payment.setAddeddatetime(LocalDateTime.now());
            if (payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDateTime.now());
            }
        }
        payment.setUpdateddatetime(LocalDateTime.now());
        return paymentRepository.save(payment);
    }
    
    public Payment update(Long id, Payment payment) {
        Payment existing = getById(id);
        if (existing != null) {
            existing.setAmount(payment.getAmount());
            existing.setPaymentType(payment.getPaymentType());
            existing.setPaymentMethod(payment.getPaymentMethod());
            existing.setStatus(payment.getStatus());
            existing.setDescription(payment.getDescription());
            existing.setMember(payment.getMember());
            existing.setMembership(payment.getMembership());
            existing.setPaymentForMonth(payment.getPaymentForMonth());
            existing.setUpdateddatetime(LocalDateTime.now());
            return paymentRepository.save(existing);
        }
        return null;
    }
    
    public void delete(Long id) {
        Payment payment = getById(id);
        if (payment != null) {
            payment.setDeleteddatetime(LocalDateTime.now());
            paymentRepository.save(payment);
        }
    }
    
    public List<Payment> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.getPaymentsByDateRange(startDate, endDate);
    }
    
    public List<Payment> getPaymentsByMember(Long memberId) {
        return paymentRepository.getPaymentsByMember(memberId);
    }
    
    public List<Payment> getPaymentsByStatus(String status) {
        return paymentRepository.getPaymentsByStatus(status);
    }
}
