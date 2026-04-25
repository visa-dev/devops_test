package lk.ourgym.controller;

import lk.ourgym.model.Member;
import lk.ourgym.service.MemberService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

@Controller
@RequestMapping("/members")
public class MemberController {

    private final MemberService service;

    public MemberController(MemberService service) {
        this.service = service;
    }

    /**
     * Shows the Members management page.
     */
    @GetMapping
    public ModelAndView getMembersPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("members.html");
        return mav;
    }

    /**
     * Returns all members as JSON.
     */
    @GetMapping(value = "/alldata", produces = "application/json")
    @ResponseBody
    public List<Member> getAllMembers() {
        return service.getAll();
    }

    /**
     * Returns a single member by ID.
     */
    @GetMapping(value = "/byid/{id}", produces = "application/json")
    @ResponseBody
    public Member getMemberById(@PathVariable Long id) {
        return service.getById(id);
    }

    /**
     * Saves a new member.
     */
    @PostMapping(value = "/save")
    @ResponseBody
    public String saveMember(@RequestBody Member member) {
        try {
            service.save(member);
            return "OK";
        } catch (Exception e) {
            return "Save Not Completed: " + e.getMessage();
        }
    }

    /**
     * Updates an existing member.
     */
    @PutMapping(value = "/update")
    @ResponseBody
    public String updateMember(@RequestBody Member member) {
        try {
            Member result = service.update(member.getId(), member);
            if (result != null) {
                return "OK";
            } else {
                return "Update Not Completed: Member not found";
            }
        } catch (Exception e) {
            return "Update Not Completed: " + e.getMessage();
        }
    }

    /**
     * Deletes a member.
     */
    @DeleteMapping(value = "/delete")
    @ResponseBody
    public String deleteMember(@RequestBody Member member) {
        try {
            service.delete(member.getId());
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed: " + e.getMessage();
        }
    }
}