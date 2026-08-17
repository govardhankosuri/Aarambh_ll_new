package com.aarambh.leadmanagement.service;

import com.aarambh.leadmanagement.dto.CreatePaymentOrderRequest;
import com.aarambh.leadmanagement.dto.PaymentOrderResponse;
import com.aarambh.leadmanagement.dto.PaymentVerificationRequest;
import com.aarambh.leadmanagement.dto.PaymentVerificationResponse;
import com.aarambh.leadmanagement.entity.Payment;

import java.util.List;

public interface PaymentService {

    PaymentOrderResponse createPaymentOrder(
            CreatePaymentOrderRequest request
    );

    PaymentVerificationResponse verifyPayment(
            PaymentVerificationRequest request
    );

    List<Payment> getAllPayments();

    Payment getPaymentById(Long id);

    Payment getPaymentByOrderId(String razorpayOrderId);

    List<Payment> getPaymentsByStatus(String status);

    void deletePayment(Long id);
}