package lk.ourgym.repository;

import lk.ourgym.model.Attendance;
import lk.ourgym.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    @Query("SELECT a FROM Attendance a WHERE a.date = :date ORDER BY a.checkInTime DESC")
    List<Attendance> findByDate(@Param("date") LocalDate date);
    
    @Query("SELECT a FROM Attendance a WHERE a.member = :member AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date DESC")
    List<Attendance> findByMemberAndDateRange(@Param("member") Member member, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.date BETWEEN :startDate AND :endDate ORDER BY a.date DESC, a.checkInTime DESC")
    List<Attendance> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.member.id = :memberId AND a.date = :date")
    Attendance findByMemberAndDate(@Param("memberId") Long memberId, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.member = :member AND a.status = 'PRESENT'")
    Long countPresentDaysByMember(@Param("member") Member member);
}
