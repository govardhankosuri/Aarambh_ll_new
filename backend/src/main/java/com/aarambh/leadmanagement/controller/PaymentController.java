package com.aarambh.leadmanagement.controller;

import com.aarambh.leadmanagement.dto.CreatePaymentOrderRequest;
import com.aarambh.leadmanagement.dto.PaymentOrderResponse;
import com.aarambh.leadmanagement.dto.PaymentVerificationRequest;
import com.aarambh.leadmanagement.dto.PaymentVerificationResponse;
import com.aarambh.leadmanagement.entity.Payment;
import com.aarambh.leadmanagement.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    // Create Razorpay Order
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request
    ) {

        PaymentOrderResponse response =
                paymentService.createPaymentOrder(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    // Verify Razorpay Payment
    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request
    ) {

        PaymentVerificationResponse response =
                paymentService.verifyPayment(request);

        if (response.isVerified()) {

            return ResponseEntity.ok(response);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // Admin - Get All Payments
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    // Admin - Get Payment By Database ID
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }

    // Admin - Get Payment By Razorpay Order ID
    @GetMapping("/order/{razorpayOrderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(
            @PathVariable String razorpayOrderId
    ) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrderId(
                        razorpayOrderId
                )
        );
    }

    // Admin - Filter Payments By Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payment>> getPaymentsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByStatus(status)
        );
    }

    // Admin - Delete Payment Record
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePayment(
            @PathVariable Long id
    ) {

        paymentService.deletePayment(id);

        return ResponseEntity.ok(
                "Payment record deleted successfully"
        );
    }
}