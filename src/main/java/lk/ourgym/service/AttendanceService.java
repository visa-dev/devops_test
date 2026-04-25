package lk.ourgym.service;

import lk.ourgym.model.Attendance;
import lk.ourgym.model.Member;
import lk.ourgym.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    
    public List<Attendance> getAll() {
        return attendanceRepository.findByDate(LocalDate.now());
    }
    
    public List<Attendance> getByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }
    
    public List<Attendance> getByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByDateRange(startDate, endDate);
    }
    
    public List<Attendance> getByMemberAndDateRange(Member member, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByMemberAndDateRange(member, startDate, endDate);
    }
    
    public Attendance getById(Long id) {
        return attendanceRepository.findById(id).orElse(null);
    }
    
    public Attendance getTodayAttendanceByMember(Long memberId) {
        return attendanceRepository.findByMemberAndDate(memberId, LocalDate.now());
    }
    
    public Attendance markAttendance(Attendance attendance) {
        attendance.setAddeddatetime(LocalDateTime.now());
        attendance.setUpdateddatetime(LocalDateTime.now());
        
        // Check if already marked today
        Attendance existing = attendanceRepository.findByMemberAndDate(
            attendance.getMember().getId(), 
            attendance.getDate() != null ? attendance.getDate() : LocalDate.now()
        );
        
        if (existing != null) {
            // Update existing
            existing.setCheckOutTime(attendance.getCheckOutTime());
            existing.setStatus(attendance.getStatus());
            existing.setNotes(attendance.getNotes());
            existing.setUpdateddatetime(LocalDateTime.now());
            return attendanceRepository.save(existing);
        }
        
        // Set default date if not provided
        if (attendance.getDate() == null) {
            attendance.setDate(LocalDate.now());
        }
        
        // Set default check-in time if not provided
        if (attendance.getCheckInTime() == null) {
            attendance.setCheckInTime(LocalTime.now());
        }
        
        // Auto-calculate status based on time
        if (attendance.getStatus() == null) {
            LocalTime lateTime = LocalTime.of(9, 0); // 9 AM threshold
            if (attendance.getCheckInTime().isAfter(lateTime)) {
                attendance.setStatus("LATE");
            } else {
                attendance.setStatus("PRESENT");
            }
        }
        
        return attendanceRepository.save(attendance);
    }
    
    public Attendance update(Long id, Attendance attendance) {
        Attendance existing = getById(id);
        if (existing != null) {
            existing.setCheckInTime(attendance.getCheckInTime());
            existing.setCheckOutTime(attendance.getCheckOutTime());
            existing.setStatus(attendance.getStatus());
            existing.setNotes(attendance.getNotes());
            existing.setUpdateddatetime(LocalDateTime.now());
            return attendanceRepository.save(existing);
        }
        return null;
    }
    
    public void delete(Long id) {
        attendanceRepository.deleteById(id);
    }
    
    public Long getPresentCountByMember(Member member) {
        return attendanceRepository.countPresentDaysByMember(member);
    }
}
