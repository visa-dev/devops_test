package lk.ourgym.controller;

import lk.ourgym.model.Class;
import lk.ourgym.service.ClassService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

/**
 * Handles class-related operations and page display.
 */
@Controller
@RequestMapping("/classes")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    /**
     * Shows the Classes management page.
     */
    @GetMapping
    public ModelAndView classPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("classes.html");
        return mav;
    }

    /**
     * Returns all classes as JSON.
     */
    @GetMapping(value = "/alldata", produces = "application/json")
    @ResponseBody
    public List<Class> getAllClasses() {
        return classService.getAll();
    }

    /**
     * Returns a single class by ID.
     */
    @GetMapping(value = "/byid/{id}", produces = "application/json")
    @ResponseBody
    public Class getClassById(@PathVariable Long id) {
        return classService.getById(id);
    }

    /**
     * Saves a new class.
     */
    @PostMapping(value = "/save")
    @ResponseBody
    public String saveClass(@RequestBody Class classEntity) {
        try {
            classService.save(classEntity);
            return "OK";
        } catch (Exception e) {
            return "Save Not Completed: " + e.getMessage();
        }
    }

    /**
     * Updates an existing class.
     */
    @PutMapping(value = "/update")
    @ResponseBody
    public String updateClass(@RequestBody Class classEntity) {
        try {
            Class result = classService.update(classEntity.getId(), classEntity);
            if (result != null) {
                return "OK";
            } else {
                return "Update Not Completed: Class not found";
            }
        } catch (Exception e) {
            return "Update Not Completed: " + e.getMessage();
        }
    }

    /**
     * Deletes a class.
     */
    @DeleteMapping(value = "/delete")
    @ResponseBody
    public String deleteClass(@RequestBody Class classEntity) {
        try {
            classService.delete(classEntity.getId());
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed: " + e.getMessage();
        }
    }
}
