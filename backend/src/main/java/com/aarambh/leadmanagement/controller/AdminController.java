package com.aarambh.leadmanagement.controller;

import com.aarambh.leadmanagement.dto.AdminLoginRequest;
import com.aarambh.leadmanagement.dto.AdminLoginResponse;
import com.aarambh.leadmanagement.dto.ResetPasswordRequest;
import com.aarambh.leadmanagement.entity.Admin;
import com.aarambh.leadmanagement.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(
            @Valid @RequestBody AdminLoginRequest request) {

        Admin admin = adminService.login(
                request.getEmail(),
                request.getPassword());

        if (admin != null) {

            return ResponseEntity.ok(
                    new AdminLoginResponse(
                            true,
                            "Login Successful",
                            admin.getName(),
                            admin.getRole()
                    )
            );
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(
                        new AdminLoginResponse(
                                false,
                                "Invalid Email or Password",
                                null,
                                null
                        )
                );


    }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        String message = adminService.resetPassword(
                request.getEmail(),
                request.getNewPassword());

        if(message.equals("Password Reset Successfully")){
            return ResponseEntity.ok(message);
        }

        return ResponseEntity.badRequest().body(message);
    }
}