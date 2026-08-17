package com.aarambh.leadmanagement.dto;

public class AdminLoginResponse {

    private boolean success;
    private String message;
    private String adminName;
    private String role;

    public AdminLoginResponse() {
    }

    public AdminLoginResponse(boolean success, String message, String adminName, String role) {
        this.success = success;
        this.message = message;
        this.adminName = adminName;
        this.role = role;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}