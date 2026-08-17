package com.aarambh.leadmanagement.serviceimpl;

import com.aarambh.leadmanagement.entity.Lead;
import com.aarambh.leadmanagement.exception.ResourceNotFoundException;
import com.aarambh.leadmanagement.repository.LeadRepository;
import com.aarambh.leadmanagement.service.EmailService;
import com.aarambh.leadmanagement.service.LeadService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeadServiceImpl implements LeadService {

    private final LeadRepository leadRepository;
    private final EmailService emailService;

    public LeadServiceImpl(
            LeadRepository leadRepository,
            EmailService emailService
    ) {

        this.leadRepository =
                leadRepository;

        this.emailService =
                emailService;
    }


    @Override
    public Lead saveLead(Lead lead) {

        Lead savedLead =
                leadRepository.save(lead);

        try {

            emailService.sendLeadEmail(
                    savedLead
            );

        } catch (Exception exception) {

            System.err.println(
                    "Lead saved successfully, but email could not be sent: "
                            + exception.getMessage()
            );
        }

        return savedLead;
    }


    @Override
    public List<Lead> getAllLeads() {

        return leadRepository.findAll();
    }


    @Override
    public Lead getLeadById(
            Integer id
    ) {

        return leadRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Lead not found with id: "
                                        + id
                        )
                );
    }


    @Override
    public Lead updateLead(
            Integer id,
            Lead lead
    ) {

        Lead existingLead =
                getLeadById(id);

        existingLead.setFullName(
                lead.getFullName()
        );

        existingLead.setPhone(
                lead.getPhone()
        );

        existingLead.setEmail(
                lead.getEmail()
        );

        existingLead.setCity(
                lead.getCity()
        );

        existingLead.setCollege(
                lead.getCollege()
        );

        existingLead.setCourse(
                lead.getCourse()
        );

        existingLead.setYearOfStudy(
                lead.getYearOfStudy()
        );

        existingLead.setInterest(
                lead.getInterest()
        );

        existingLead.setResearchExperience(
                lead.getResearchExperience()
        );

        existingLead.setService(
                lead.getService()
        );

        existingLead.setMessage(
                lead.getMessage()
        );

        if (
                lead.getSource() != null &&
                        !lead.getSource().isBlank()
        ) {

            existingLead.setSource(
                    lead.getSource()
            );
        }

        return leadRepository.save(
                existingLead
        );
    }


    @Override
    public void deleteLead(
            Integer id
    ) {

        Lead lead =
                getLeadById(id);

        leadRepository.delete(lead);
    }
}