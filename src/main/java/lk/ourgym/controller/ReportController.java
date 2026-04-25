package lk.ourgym.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

/**
 * Handles report-related operations and page display.
 */
@Controller
public class ReportController {

    /**
     * Shows the Reports page.
     */
    @RequestMapping("/reports")
    public ModelAndView reportPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("reports.html");
        return mav;
    }
}
