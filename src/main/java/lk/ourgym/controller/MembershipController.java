package lk.ourgym.controller;

import lk.ourgym.model.Membership;
import lk.ourgym.service.MembershipService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

/**
 * Handles membership-related operations and page display.
 */
@Controller
@RequestMapping("/memberships")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    /**
     * Shows the Memberships management page.
     */
    @GetMapping
    public ModelAndView membershipPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("memberships.html");
        return mav;
    }

    /**
     * Returns all memberships as JSON.
     */
    @GetMapping(value = "/alldata", produces = "application/json")
    @ResponseBody
    public List<Membership> getAllMemberships() {
        return membershipService.getAll();
    }

    /**
     * Returns a single membership by ID.
     */
    @GetMapping(value = "/byid/{id}", produces = "application/json")
    @ResponseBody
    public Membership getMembershipById(@PathVariable Long id) {
        return membershipService.getById(id);
    }

    /**
     * Saves a new membership.
     */
    @PostMapping(value = "/save")
    @ResponseBody
    public String saveMembership(@RequestBody Membership membership) {
        try {
            membershipService.save(membership);
            return "OK";
        } catch (Exception e) {
            return "Save Not Completed: " + e.getMessage();
        }
    }

    /**
     * Updates an existing membership.
     */
    @PutMapping(value = "/update")
    @ResponseBody
    public String updateMembership(@RequestBody Membership membership) {
        try {
            Membership result = membershipService.update(membership.getId(), membership);
            if (result != null) {
                return "OK";
            } else {
                return "Update Not Completed: Membership not found";
            }
        } catch (Exception e) {
            return "Update Not Completed: " + e.getMessage();
        }
    }

    /**
     * Deletes a membership.
     */
    @DeleteMapping(value = "/delete")
    @ResponseBody
    public String deleteMembership(@RequestBody Membership membership) {
        try {
            membershipService.delete(membership.getId());
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed: " + e.getMessage();
        }
    }
}
