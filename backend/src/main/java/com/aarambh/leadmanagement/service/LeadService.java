package com.aarambh.leadmanagement.service;

import com.aarambh.leadmanagement.entity.Lead;

import java.util.List;

public interface LeadService {

    Lead saveLead(Lead lead);

    List<Lead> getAllLeads();

    Lead getLeadById(Integer id);

    Lead updateLead(Integer id, Lead lead);

    void deleteLead(Integer id);
}