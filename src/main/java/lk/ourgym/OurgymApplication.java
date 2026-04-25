package lk.ourgym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

/**
 * Entry point of the Spring Boot application.
 * The @SpringBootApplication annotation enables auto-configuration,
 * component scanning, and configuration support.
 */
@SpringBootApplication
@RestController
public class OurgymApplication {

    public static void main(String[] args) {
        SpringApplication.run(OurgymApplication.class, args);
    }

    /**
     * Simple health check endpoint.
     * Visit http://localhost:8080/ to confirm the server is running.
     */
    @RequestMapping("/")
    public String index() {
        return "Our Gym Application is Running!";
    }

    /**
     * Test page for verifying Thymeleaf templates work.
     * Visit http://localhost:8080/test
     */
    @RequestMapping("/test")
    public ModelAndView testPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("test.html");
        return mav;
    }
}
