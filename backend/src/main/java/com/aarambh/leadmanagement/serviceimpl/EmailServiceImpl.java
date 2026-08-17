package com.aarambh.leadmanagement.serviceimpl;

import com.aarambh.leadmanagement.entity.Lead;
import com.aarambh.leadmanagement.entity.Payment;
import com.aarambh.leadmanagement.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${app.mail.admin-to}")
    private String adminEmail;

    @Value("${app.mail.company-name:Aarambh Luminous Learning}")
    private String companyName;


    public EmailServiceImpl(
            JavaMailSender mailSender
    ) {
        this.mailSender = mailSender;
    }


    // ==================================================
    // NEW LEAD EMAIL TO ADMIN
    // ==================================================

    @Override
    public void sendLeadEmail(
            Lead lead
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);

        message.setTo(adminEmail);

        message.setSubject(
                "New Lead Received - " + companyName
        );

        message.setText(
                "A new enquiry has been submitted.\n\n" +

                        "Lead ID: " +
                        safeValue(lead.getId()) + "\n\n" +

                        "Full Name: " +
                        safeValue(lead.getFullName()) + "\n" +

                        "Phone: " +
                        safeValue(lead.getPhone()) + "\n" +

                        "Email: " +
                        safeValue(lead.getEmail()) + "\n" +

                        "City: " +
                        safeValue(lead.getCity()) + "\n" +

                        "College / Institution: " +
                        safeValue(lead.getCollege()) + "\n" +

                        "Course / Degree: " +
                        safeValue(lead.getCourse()) + "\n" +

                        "Year of Study: " +
                        safeValue(lead.getYearOfStudy()) + "\n" +

                        "Area of Interest: " +
                        safeValue(lead.getInterest()) + "\n" +

                        "Research Experience: " +
                        safeValue(lead.getResearchExperience()) + "\n" +

                        "Service Interested In: " +
                        safeValue(lead.getService()) + "\n" +

                        "Message: " +
                        safeValue(lead.getMessage()) + "\n" +

                        "Source: " +
                        safeValue(lead.getSource()) + "\n" +

                        "Submitted At: " +
                        formatDateTime(lead.getCreatedAt()) + "\n\n" +

                        "Regards,\n" +
                        companyName
        );

        mailSender.send(message);

        System.out.println(
                "LEAD EMAIL SENT SUCCESSFULLY TO ADMIN"
        );
    }


    // ==================================================
    // PAYMENT SUCCESS EMAIL TO CUSTOMER
    // ==================================================

    @Override
    public void sendPaymentSuccessEmailToCustomer(
            Payment payment
    ) {

        if (
                payment.getEmail() == null ||
                        payment.getEmail().isBlank()
        ) {

            System.err.println(
                    "CUSTOMER PAYMENT EMAIL NOT SENT: EMAIL IS EMPTY"
            );

            return;
        }

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);

        message.setTo(payment.getEmail());

        message.setSubject(
                "Payment Successful - " + companyName
        );

        message.setText(
                "Dear " +
                        safeValue(payment.getFullName()) +
                        ",\n\n" +

                        "Your payment has been received and verified successfully.\n\n" +

                        "Payment Details\n" +
                        "---------------------------------\n" +

                        "Course: " +
                        safeValue(payment.getCourseName()) + "\n" +

                        "Amount: " +
                        formatAmount(payment.getAmount()) + "\n" +

                        "Currency: " +
                        safeValue(payment.getCurrency()) + "\n" +

                        "Payment Status: " +
                        safeValue(payment.getStatus()) + "\n" +

                        "Payment Method: " +
                        safeValue(payment.getPaymentMethod()) + "\n" +

                        "Razorpay Order ID: " +
                        safeValue(payment.getRazorpayOrderId()) + "\n" +

                        "Razorpay Payment ID: " +
                        safeValue(payment.getRazorpayPaymentId()) + "\n" +

                        "Receipt Number: " +
                        safeValue(payment.getReceiptNumber()) + "\n" +

                        "Payment Date: " +
                        formatDateTime(payment.getPaidAt()) + "\n" +

                        "---------------------------------\n\n" +

                        "Thank you for choosing " +
                        companyName +
                        ".\n\n" +

                        "Regards,\n" +
                        companyName
        );

        mailSender.send(message);

        System.out.println(
                "PAYMENT SUCCESS EMAIL SENT TO CUSTOMER"
        );
    }


    // ==================================================
    // NEW PAYMENT NOTIFICATION TO ADMIN
    // ==================================================

    @Override
    public void sendPaymentNotificationToAdmin(
            Payment payment
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);

        message.setTo(adminEmail);

        message.setSubject(
                "New Payment Received - " + companyName
        );

        message.setText(
                "A new verified payment has been received.\n\n" +

                        "Payment Record ID: " +
                        safeValue(payment.getId()) + "\n" +

                        "Student Name: " +
                        safeValue(payment.getFullName()) + "\n" +

                        "Email: " +
                        safeValue(payment.getEmail()) + "\n" +

                        "Phone: " +
                        safeValue(payment.getPhone()) + "\n" +

                        "Course: " +
                        safeValue(payment.getCourseName()) + "\n" +

                        "Amount: " +
                        formatAmount(payment.getAmount()) + "\n" +

                        "Status: " +
                        safeValue(payment.getStatus()) + "\n" +

                        "Payment Method: " +
                        safeValue(payment.getPaymentMethod()) + "\n" +

                        "Order ID: " +
                        safeValue(payment.getRazorpayOrderId()) + "\n" +

                        "Payment ID: " +
                        safeValue(payment.getRazorpayPaymentId()) + "\n" +

                        "Receipt Number: " +
                        safeValue(payment.getReceiptNumber()) + "\n" +

                        "Payment Date: " +
                        formatDateTime(payment.getPaidAt()) + "\n\n" +

                        "Regards,\n" +
                        companyName
        );

        mailSender.send(message);

        System.out.println(
                "PAYMENT NOTIFICATION EMAIL SENT TO ADMIN"
        );
    }


    // ==================================================
    // HELPER METHODS
    // ==================================================

    private String safeValue(
            Object value
    ) {

        if (value == null) {
            return "Not Available";
        }

        String stringValue =
                String.valueOf(value).trim();

        if (stringValue.isEmpty()) {
            return "Not Available";
        }

        return stringValue;
    }


    private String formatAmount(
            BigDecimal amount
    ) {

        if (amount == null) {
            return "₹0.00";
        }

        return "₹" +
                amount.setScale(
                        2,
                        java.math.RoundingMode.HALF_UP
                );
    }


    private String formatDateTime(
            LocalDateTime dateTime
    ) {

        if (dateTime == null) {
            return "Not Available";
        }

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern(
                        "dd-MM-yyyy hh:mm a"
                );

        return dateTime.format(formatter);
    }
}