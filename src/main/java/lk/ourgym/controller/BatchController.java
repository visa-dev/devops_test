package lk.ourgym.controller;

import lk.ourgym.model.Batch;
import lk.ourgym.service.BatchService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

/**
 * Handles batch registration operations and page display.
 */
@Controller
@RequestMapping("/batch")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    /**
     * Shows the Batch Registration page.
     */
    @GetMapping
    public ModelAndView batchPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("batch.html");
        return mav;
    }

    /**
     * Returns all batches as JSON.
     */
    @GetMapping(value = "/alldata", produces = "application/json")
    @ResponseBody
    public List<Batch> getAllBatches() {
        return batchService.getAll();
    }

    /**
     * Returns a single batch by ID.
     */
    @GetMapping(value = "/byid/{id}", produces = "application/json")
    @ResponseBody
    public Batch getBatchById(@PathVariable Long id) {
        return batchService.getById(id);
    }

    /**
     * Saves a new batch.
     */
    @PostMapping(value = "/save")
    @ResponseBody
    public String saveBatch(@RequestBody Batch batch) {
        try {
            batchService.save(batch);
            return "OK";
        } catch (Exception e) {
            return "Save Not Completed: " + e.getMessage();
        }
    }

    /**
     * Updates an existing batch.
     */
    @PutMapping(value = "/update")
    @ResponseBody
    public String updateBatch(@RequestBody Batch batch) {
        try {
            Batch result = batchService.update(batch.getId(), batch);
            if (result != null) {
                return "OK";
            } else {
                return "Update Not Completed: Batch not found";
            }
        } catch (Exception e) {
            return "Update Not Completed: " + e.getMessage();
        }
    }

    /**
     * Deletes a batch.
     */
    @DeleteMapping(value = "/delete")
    @ResponseBody
    public String deleteBatch(@RequestBody Batch batch) {
        try {
            batchService.delete(batch.getId());
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed: " + e.getMessage();
        }
    }
}
