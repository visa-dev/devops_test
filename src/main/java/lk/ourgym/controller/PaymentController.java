package lk.ourgym.controller;

import lk.ourgym.model.Payment;
import lk.ourgym.service.PaymentService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Handles payment-related operations and page display.
 */
@Controller
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Shows the Payments management page.
     */
    @GetMapping
    public ModelAndView paymentPage() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("payments.html");
        return mav;
    }

    /**
     * Returns all payments as JSON.
     */
    @GetMapping(value = "/alldata", produces = "application/json")
    @ResponseBody
    public List<Payment> getAllPayments() {
        return paymentService.getAll();
    }

    /**
     * Returns a single payment by ID.
     */
    @GetMapping(value = "/byid/{id}", produces = "application/json")
    @ResponseBody
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentService.getById(id);
    }

    /**
     * Saves a new payment.
     */
    @PostMapping(value = "/save")
    @ResponseBody
    public String savePayment(@RequestBody Payment payment) {
        try {
            paymentService.save(payment);
            return "OK";
        } catch (Exception e) {
            return "Save Not Completed: " + e.getMessage();
        }
    }

    /**
     * Updates an existing payment.
     */
    @PutMapping(value = "/update")
    @ResponseBody
    public String updatePayment(@RequestBody Payment payment) {
        try {
            Payment result = paymentService.update(payment.getId(), payment);
            if (result != null) {
                return "OK";
            } else {
                return "Update Not Completed: Payment not found";
            }
        } catch (Exception e) {
            return "Update Not Completed: " + e.getMessage();
        }
    }

    /**
     * Deletes a payment.
     */
    @DeleteMapping(value = "/delete")
    @ResponseBody
    public String deletePayment(@RequestBody Payment payment) {
        try {
            paymentService.delete(payment.getId());
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed: " + e.getMessage();
        }
    }

    /**
     * Gets payments by date range.
     */
    @GetMapping(value = "/bydaterange", produces = "application/json")
    @ResponseBody
    public List<Payment> getPaymentsByDateRange(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            return paymentService.getPaymentsByDateRange(start, end);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Gets payments by member.
     */
    @GetMapping(value = "/bymember/{memberId}", produces = "application/json")
    @ResponseBody
    public List<Payment> getPaymentsByMember(@PathVariable Long memberId) {
        return paymentService.getPaymentsByMember(memberId);
    }

    /**
     * Gets payments by status.
     */
    @GetMapping(value = "/bystatus/{status}", produces = "application/json")
    @ResponseBody
    public List<Payment> getPaymentsByStatus(@PathVariable String status) {
        return paymentService.getPaymentsByStatus(status);
    }
}
