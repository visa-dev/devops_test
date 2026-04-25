package lk.ourgym.controller;

import lk.ourgym.model.Attendance;
import lk.ourgym.model.Member;
import lk.ourgym.service.AttendanceService;
import lk.ourgym.service.MemberService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final MemberService memberService;

    public AttendanceController(AttendanceService attendanceService, MemberService memberService) {
        this.attendanceService = attendanceService;
        this.memberService = memberService;
    }

    @GetMapping
    public ModelAndView attendancePage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("attendance.html");
        return mav;
    }

    @GetMapping(value = "/alldata", produces = "application/json")
    @ResponseBody
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAll();
    }

    @GetMapping(value = "/bydate", produces = "application/json")
    @ResponseBody
    public List<Attendance> getAttendanceByDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return attendanceService.getByDate(localDate);
    }

    @GetMapping(value = "/bydaterange", produces = "application/json")
    @ResponseBody
    public List<Attendance> getAttendanceByDateRange(@RequestParam String startDate, @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return attendanceService.getByDateRange(start, end);
    }

    @GetMapping(value = "/bymember/{memberId}", produces = "application/json")
    @ResponseBody
    public List<Attendance> getAttendanceByMember(@PathVariable Long memberId, 
                                                   @RequestParam String startDate, 
                                                   @RequestParam String endDate) {
        Member member = memberService.getById(memberId);
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return attendanceService.getByMemberAndDateRange(member, start, end);
    }

    @GetMapping(value = "/today/{memberId}", produces = "application/json")
    @ResponseBody
    public Attendance getTodayAttendance(@PathVariable Long memberId) {
        return attendanceService.getTodayAttendanceByMember(memberId);
    }

    @PostMapping(value = "/mark")
    @ResponseBody
    public String markAttendance(@RequestBody Attendance attendance) {
        try {
            attendanceService.markAttendance(attendance);
            return "OK";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @PutMapping(value = "/update")
    @ResponseBody
    public String updateAttendance(@RequestBody Attendance attendance) {
        try {
            Attendance result = attendanceService.update(attendance.getId(), attendance);
            if (result != null) {
                return "OK";
            } else {
                return "Error: Attendance not found";
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @DeleteMapping(value = "/delete/{id}")
    @ResponseBody
    public String deleteAttendance(@PathVariable Long id) {
        try {
            attendanceService.delete(id);
            return "OK";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
