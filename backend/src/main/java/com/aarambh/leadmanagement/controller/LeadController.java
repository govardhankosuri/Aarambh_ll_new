package com.aarambh.leadmanagement.controller;

import com.aarambh.leadmanagement.entity.Lead;
import com.aarambh.leadmanagement.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*")
public class LeadController {

    @Autowired
    private LeadService leadService;

    // Save Lead
    @PostMapping
    public ResponseEntity<Lead> saveLead(@Valid @RequestBody Lead lead) {

        Lead savedLead = leadService.saveLead(lead);

        return new ResponseEntity<>(savedLead, HttpStatus.CREATED);
    }

    // Get All Leads
    @GetMapping
    public ResponseEntity<List<Lead>> getAllLeads() {

        return ResponseEntity.ok(leadService.getAllLeads());
    }

    // Get Lead By Id
    @GetMapping("/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable Integer id) {

        return ResponseEntity.ok(leadService.getLeadById(id));
    }

    // Update Lead
    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable Integer id,
                                           @RequestBody Lead lead) {

        return ResponseEntity.ok(leadService.updateLead(id, lead));
    }

    // Delete Lead
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLead(@PathVariable Integer id) {

        leadService.deleteLead(id);

        return ResponseEntity.ok("Lead Deleted Successfully");
    }
}