package lk.ourgym.repository;

import lk.ourgym.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    @Query("SELECT p FROM Payment p WHERE p.deleteddatetime IS NULL")
    List<Payment> getActivePayments();
    
    @Query("SELECT p FROM Payment p WHERE p.deleteddatetime IS NULL AND p.paymentDate BETWEEN :startDate AND :endDate")
    List<Payment> getPaymentsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p FROM Payment p WHERE p.deleteddatetime IS NULL AND p.member.id = :memberId")
    List<Payment> getPaymentsByMember(@Param("memberId") Long memberId);
    
    @Query("SELECT p FROM Payment p WHERE p.deleteddatetime IS NULL AND p.status = :status")
    List<Payment> getPaymentsByStatus(@Param("status") String status);
    
    @Query("SELECT p FROM Payment p WHERE p.deleteddatetime IS NULL AND p.member.id = :memberId ORDER BY p.paymentForMonth DESC")
    List<Payment> getLatestPaymentByMember(@Param("memberId") Long memberId);
    
    @Query("SELECT MAX(p.paymentForMonth) FROM Payment p WHERE p.deleteddatetime IS NULL AND p.member.id = :memberId AND p.status = 'PAID'")
    String getLastPaidMonth(@Param("memberId") Long memberId);
}
