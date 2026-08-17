package com.aarambh.leadmanagement.service;

import com.aarambh.leadmanagement.entity.Lead;
import com.aarambh.leadmanagement.entity.Payment;

public interface EmailService {

    void sendLeadEmail(Lead lead);

    void sendPaymentSuccessEmailToCustomer(Payment payment);

    void sendPaymentNotificationToAdmin(Payment payment);
}