package com.aarambh.leadmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {

    private Long paymentRecordId;

    private String razorpayOrderId;

    private String razorpayKeyId;

    private BigDecimal amount;

    private Long amountInPaise;

    private String currency;

    private String companyName;

    private String fullName;

    private String email;

    private String phone;

    private String courseName;

    private String status;

    private String message;
}