package com.aarambh.leadmanagement.serviceimpl;

import com.aarambh.leadmanagement.entity.Admin;
import com.aarambh.leadmanagement.repository.AdminRepository;
import com.aarambh.leadmanagement.service.AdminService;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;

    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public Admin login(String email, String password) {

        return adminRepository.findByEmail(email)
                .filter(admin -> admin.getPassword().equals(password))
                .orElse(null);
    }
    @Override
    public String resetPassword(String email, String newPassword) {

        Admin admin = adminRepository.findByEmail(email).orElse(null);

        if (admin == null) {
            return "Email not found";
        }

        admin.setPassword(newPassword);

        adminRepository.save(admin);

        return "Password Reset Successfully";
    }
}