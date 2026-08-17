package com.aarambh.leadmanagement.service;

import com.aarambh.leadmanagement.entity.Admin;

public interface AdminService {

    Admin login(String email, String password);

    String resetPassword(String email, String newPassword);
}