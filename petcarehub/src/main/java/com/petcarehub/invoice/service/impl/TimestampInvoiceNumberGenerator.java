package com.petcarehub.invoice.service.impl;

import com.petcarehub.invoice.service.InvoiceNumberGenerator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class TimestampInvoiceNumberGenerator implements InvoiceNumberGenerator {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private int sequence = 0;
    private LocalDate lastDate = LocalDate.now();
    
    @Override
    public synchronized String generate() {
        LocalDate today = LocalDate.now();
        
        // Reset sequence if it's a new day
        if (!today.equals(lastDate)) {
            sequence = 0;
            lastDate = today;
        }
        
        sequence++;
        String datePart = today.format(DATE_FORMATTER);
        String sequencePart = String.format("%04d", sequence);
        
        return "INV-" + datePart + "-" + sequencePart;
    }
}
