package com.aarambh.leadmanagement.serviceimpl;

import com.aarambh.leadmanagement.dto.CreatePaymentOrderRequest;
import com.aarambh.leadmanagement.dto.PaymentOrderResponse;
import com.aarambh.leadmanagement.dto.PaymentVerificationRequest;
import com.aarambh.leadmanagement.dto.PaymentVerificationResponse;
import com.aarambh.leadmanagement.entity.Payment;
import com.aarambh.leadmanagement.exception.ResourceNotFoundException;
import com.aarambh.leadmanagement.repository.PaymentRepository;
import com.aarambh.leadmanagement.service.EmailService;
import com.aarambh.leadmanagement.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String razorpayCurrency;

    @Value("${razorpay.company.name:Aarambh Luminous Learning}")
    private String companyName;


    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            EmailService emailService
    ) {

        this.paymentRepository =
                paymentRepository;

        this.emailService =
                emailService;
    }


    // =====================================================
    // CREATE RAZORPAY ORDER
    // =====================================================

    @Override
    @Transactional
    public PaymentOrderResponse createPaymentOrder(
            CreatePaymentOrderRequest request
    ) {

        validateRazorpayCredentials();

        try {

            BigDecimal amount =
                    request.getAmount()
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            );

            long amountInPaise =
                    amount
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .longValueExact();

            String receiptNumber =
                    generateReceiptNumber();

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret
                    );

            JSONObject orderRequest =
                    new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    razorpayCurrency
            );

            orderRequest.put(
                    "receipt",
                    receiptNumber
            );

            JSONObject notes =
                    new JSONObject();

            notes.put(
                    "customer_name",
                    request.getFullName()
            );

            notes.put(
                    "customer_email",
                    request.getEmail()
            );

            notes.put(
                    "customer_phone",
                    request.getPhone()
            );

            notes.put(
                    "course_name",
                    request.getCourseName()
            );

            orderRequest.put(
                    "notes",
                    notes
            );

            Order razorpayOrder =
                    razorpayClient
                            .orders
                            .create(orderRequest);

            String razorpayOrderId =
                    razorpayOrder.get("id");

            Payment payment =
                    new Payment();

            payment.setFullName(
                    request
                            .getFullName()
                            .trim()
            );

            payment.setEmail(
                    request
                            .getEmail()
                            .trim()
                            .toLowerCase()
            );

            payment.setPhone(
                    request
                            .getPhone()
                            .trim()
            );

            payment.setCourseName(
                    request
                            .getCourseName()
                            .trim()
            );

            payment.setAmount(amount);

            payment.setCurrency(
                    razorpayCurrency
            );

            payment.setRazorpayOrderId(
                    razorpayOrderId
            );

            payment.setReceiptNumber(
                    receiptNumber
            );

            payment.setStatus(
                    "CREATED"
            );

            Payment savedPayment =
                    paymentRepository.save(payment);

            return new PaymentOrderResponse(
                    savedPayment.getId(),
                    savedPayment.getRazorpayOrderId(),
                    razorpayKeyId,
                    savedPayment.getAmount(),
                    amountInPaise,
                    savedPayment.getCurrency(),
                    companyName,
                    savedPayment.getFullName(),
                    savedPayment.getEmail(),
                    savedPayment.getPhone(),
                    savedPayment.getCourseName(),
                    savedPayment.getStatus(),
                    "Razorpay order created successfully"
            );

        } catch (ArithmeticException exception) {

            throw new IllegalArgumentException(
                    "Invalid payment amount"
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to create Razorpay order: "
                            + exception.getMessage(),
                    exception
            );
        }
    }


    // =====================================================
    // VERIFY RAZORPAY PAYMENT
    // =====================================================

    @Override
    @Transactional
    public PaymentVerificationResponse verifyPayment(
            PaymentVerificationRequest request
    ) {

        validateRazorpayCredentials();

        Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                request.getRazorpayOrderId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment order not found: "
                                                + request.getRazorpayOrderId()
                                )
                        );


        if (
                "PAID".equalsIgnoreCase(
                        payment.getStatus()
                )
        ) {

            return new PaymentVerificationResponse(
                    true,
                    payment.getId(),
                    payment.getRazorpayOrderId(),
                    payment.getRazorpayPaymentId(),
                    payment.getPaymentMethod(),
                    payment.getStatus(),
                    "Payment is already verified"
            );
        }


        try {

            JSONObject verificationData =
                    new JSONObject();

            verificationData.put(
                    "razorpay_order_id",
                    payment.getRazorpayOrderId()
            );

            verificationData.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId()
            );

            verificationData.put(
                    "razorpay_signature",
                    request.getRazorpaySignature()
            );


            boolean signatureValid =
                    Utils.verifyPaymentSignature(
                            verificationData,
                            razorpayKeySecret
                    );


            if (!signatureValid) {

                payment.setStatus(
                        "VERIFICATION_FAILED"
                );

                payment.setFailureReason(
                        "Razorpay payment signature verification failed"
                );

                paymentRepository.save(payment);

                return new PaymentVerificationResponse(
                        false,
                        payment.getId(),
                        payment.getRazorpayOrderId(),
                        request.getRazorpayPaymentId(),
                        null,
                        payment.getStatus(),
                        "Payment verification failed"
                );
            }


            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret
                    );


            com.razorpay.Payment razorpayPayment =
                    razorpayClient
                            .payments
                            .fetch(
                                    request.getRazorpayPaymentId()
                            );


            String paymentMethod =
                    getStringValue(
                            razorpayPayment,
                            "method",
                            "Unknown"
                    );


            String razorpayPaymentStatus =
                    getStringValue(
                            razorpayPayment,
                            "status",
                            "unknown"
                    );


            payment.setRazorpayPaymentId(
                    request.getRazorpayPaymentId()
            );

            payment.setRazorpaySignature(
                    request.getRazorpaySignature()
            );

            payment.setPaymentMethod(
                    paymentMethod
            );


            if (
                    "captured".equalsIgnoreCase(
                            razorpayPaymentStatus
                    )
            ) {

                payment.setStatus(
                        "PAID"
                );

                payment.setPaidAt(
                        LocalDateTime.now()
                );

                payment.setFailureReason(null);

            } else if (
                    "authorized".equalsIgnoreCase(
                            razorpayPaymentStatus
                    )
            ) {

                payment.setStatus(
                        "AUTHORIZED"
                );

                payment.setFailureReason(
                        "Payment is authorized but not captured"
                );

            } else {

                payment.setStatus(
                        razorpayPaymentStatus
                                .toUpperCase()
                );

                payment.setFailureReason(
                        "Razorpay payment status: "
                                + razorpayPaymentStatus
                );
            }


            Payment verifiedPayment =
                    paymentRepository.save(payment);


            // =================================================
            // SEND PAYMENT EMAILS
            // =================================================

            if (
                    "PAID".equalsIgnoreCase(
                            verifiedPayment.getStatus()
                    )
            ) {

                sendPaymentEmails(
                        verifiedPayment
                );
            }


            boolean successfullyPaid =
                    "PAID".equalsIgnoreCase(
                            verifiedPayment.getStatus()
                    );


            return new PaymentVerificationResponse(
                    successfullyPaid,
                    verifiedPayment.getId(),
                    verifiedPayment.getRazorpayOrderId(),
                    verifiedPayment.getRazorpayPaymentId(),
                    verifiedPayment.getPaymentMethod(),
                    verifiedPayment.getStatus(),
                    successfullyPaid
                            ? "Payment verified successfully"
                            : "Payment verified, but current status is "
                            + verifiedPayment.getStatus()
            );


        } catch (Exception exception) {

            payment.setStatus(
                    "VERIFICATION_ERROR"
            );

            payment.setFailureReason(
                    exception.getMessage()
            );

            paymentRepository.save(payment);


            throw new RuntimeException(
                    "Unable to verify Razorpay payment: "
                            + exception.getMessage(),
                    exception
            );
        }
    }


    // =====================================================
    // SEND CUSTOMER AND ADMIN EMAILS
    // =====================================================

    private void sendPaymentEmails(
            Payment verifiedPayment
    ) {

        try {

            emailService
                    .sendPaymentSuccessEmailToCustomer(
                            verifiedPayment
                    );

        } catch (Exception exception) {

            System.err.println(
                    "PAYMENT CUSTOMER EMAIL FAILED: "
                            + exception.getMessage()
            );
        }


        try {

            emailService
                    .sendPaymentNotificationToAdmin(
                            verifiedPayment
                    );

        } catch (Exception exception) {

            System.err.println(
                    "PAYMENT ADMIN EMAIL FAILED: "
                            + exception.getMessage()
            );
        }
    }


    // =====================================================
    // GET ALL PAYMENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {

        return paymentRepository
                .findAllByOrderByCreatedAtDesc();
    }


    // =====================================================
    // GET PAYMENT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentById(
            Long id
    ) {

        return paymentRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found with id: "
                                        + id
                        )
                );
    }


    // =====================================================
    // GET PAYMENT BY ORDER ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(
            String razorpayOrderId
    ) {

        return paymentRepository
                .findByRazorpayOrderId(
                        razorpayOrderId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found with order id: "
                                        + razorpayOrderId
                        )
                );
    }


    // =====================================================
    // GET PAYMENTS BY STATUS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByStatus(
            String status
    ) {

        if (
                status == null ||
                        status.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Payment status is required"
            );
        }

        return paymentRepository
                .findByStatusOrderByCreatedAtDesc(
                        status
                                .trim()
                                .toUpperCase()
                );
    }


    // =====================================================
    // DELETE PAYMENT
    // =====================================================

    @Override
    @Transactional
    public void deletePayment(
            Long id
    ) {

        Payment payment =
                getPaymentById(id);

        paymentRepository.delete(payment);
    }


    // =====================================================
    // GENERATE RECEIPT NUMBER
    // =====================================================

    private String generateReceiptNumber() {

        String randomText =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();

        return "AARAMBH-" + randomText;
    }


    // =====================================================
    // VALIDATE RAZORPAY CREDENTIALS
    // =====================================================

    private void validateRazorpayCredentials() {

        if (
                razorpayKeyId == null ||
                        razorpayKeyId.isBlank() ||
                        razorpayKeyId.startsWith(
                                "REPLACE_WITH"
                        ) ||
                        razorpayKeyId.startsWith(
                                "YOUR_NEW"
                        )
        ) {

            throw new IllegalStateException(
                    "Razorpay Key ID is not configured"
            );
        }


        if (
                razorpayKeySecret == null ||
                        razorpayKeySecret.isBlank() ||
                        razorpayKeySecret.startsWith(
                                "REPLACE_WITH"
                        ) ||
                        razorpayKeySecret.startsWith(
                                "YOUR_NEW"
                        )
        ) {

            throw new IllegalStateException(
                    "Razorpay Key Secret is not configured"
            );
        }
    }


    // =====================================================
    // GET RAZORPAY STRING VALUE
    // =====================================================

    private String getStringValue(
            com.razorpay.Payment razorpayPayment,
            String key,
            String defaultValue
    ) {

        try {

            String value =
                    razorpayPayment.get(key);

            if (
                    value == null ||
                            value.isBlank()
            ) {

                return defaultValue;
            }

            return value;

        } catch (Exception exception) {

            return defaultValue;
        }
    }
}