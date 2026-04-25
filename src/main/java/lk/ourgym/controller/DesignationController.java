package lk.ourgym.controller;

import lk.ourgym.model.Designation;
import lk.ourgym.repository.DesignationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Provides read-only access to designation data.
 * Used to populate designation dropdowns in the employee form.
 */
@RestController
public class DesignationController {

    @Autowired
    private DesignationRepository designationDao;

    /**
     * Returns all available designations.
     * Example: GET /designation/alldata
     */
    @GetMapping(value = "/designation/alldata", produces = "application/json")
    public List<Designation> getAllData() {
        return designationDao.findAll();
    }
}
