package com.aarambh.leadmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payments",
        indexes = {
                @Index(
                        name = "idx_payment_order_id",
                        columnList = "razorpay_order_id"
                ),
                @Index(
                        name = "idx_payment_payment_id",
                        columnList = "razorpay_payment_id"
                ),
                @Index(
                        name = "idx_payment_email",
                        columnList = "email"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;


    @Column(nullable = false, length = 150)
    private String email;


    @Column(nullable = false, length = 15)
    private String phone;


    @Column(name = "course_name", nullable = false, length = 255)
    private String courseName;


    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;


    @Column(nullable = false, length = 10)
    private String currency;


    @Column(
            name = "razorpay_order_id",
            nullable = false,
            unique = true,
            length = 100
    )
    private String razorpayOrderId;


    @Column(
            name = "razorpay_payment_id",
            unique = true,
            length = 100
    )
    private String razorpayPaymentId;


    @Column(
            name = "razorpay_signature",
            length = 255
    )
    private String razorpaySignature;


    @Column(nullable = false, length = 30)
    private String status;


    @Column(
            name = "payment_method",
            length = 50
    )
    private String paymentMethod;


    @Column(
            name = "receipt_number",
            nullable = false,
            unique = true,
            length = 100
    )
    private String receiptNumber;


    @Column(
            name = "failure_reason",
            columnDefinition = "TEXT"
    )
    private String failureReason;


    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;


    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @Column(name = "paid_at")
    private LocalDateTime paidAt;


    @PrePersist
    public void prePersist() {

        LocalDateTime currentTime = LocalDateTime.now();

        createdAt = currentTime;
        updatedAt = currentTime;

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }

        if (status == null || status.isBlank()) {
            status = "CREATED";
        }
    }


    @PreUpdate
    public void preUpdate() {

        updatedAt = LocalDateTime.now();
    }
}