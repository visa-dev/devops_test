package lk.ourgym.controller;

import lk.ourgym.model.TrainerType;
import lk.ourgym.repository.TrainerTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Provides read-only access to trainer type data.
 * Used to populate trainer type dropdowns in the UI.
 */
@RestController
public class TrainerTypeController {

    @Autowired
    private TrainerTypeRepository trainerTypeDao;

    /**
     * Returns all trainer types.
     * Example: GET /trainertype/alldata
     */
    @GetMapping(value = "/trainertype/alldata", produces = "application/json")
    public List<TrainerType> getAllData() {
        return trainerTypeDao.findAll();
    }
}
