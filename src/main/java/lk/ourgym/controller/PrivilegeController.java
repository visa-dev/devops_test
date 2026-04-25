package lk.ourgym.controller;

import lk.ourgym.model.Privilege;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

/**
 * Handles the Privilege management page.
 * Full CRUD for privileges is not yet implemented.
 */
@RestController
public class PrivilegeController implements CommonController<Privilege> {

    /**
     * Shows the Privilege management page.
     */
    @RequestMapping("/privilege")
    public ModelAndView privilegePage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("privilege.html");
        return mav;
    }

    @Override
    public List<Privilege> getAllData() {
        return List.of();
    }

    @Override
    public String getSaveData(Privilege privilege) {
        return "";
    }

    @Override
    public String getUpdateData(Privilege privilege) {
        return "";
    }

    @Override
    public String getDeleteData(Privilege privilege) {
        return "";
    }
}
