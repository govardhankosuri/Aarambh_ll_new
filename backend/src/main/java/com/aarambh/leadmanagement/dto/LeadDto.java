package com.aarambh.leadmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LeadDto {

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;

    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank
    private String city;

    @NotBlank
    private String college;

    @NotBlank
    private String course;

    @NotBlank
    private String yearOfStudy;

    @NotBlank
    private String interest;

    @NotBlank
    private String researchExperience;

    @NotBlank
    private String service;

    private String message;
}