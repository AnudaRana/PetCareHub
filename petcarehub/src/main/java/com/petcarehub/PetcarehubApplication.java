package com.petcarehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = {
        "com.petcarehub.petcarehub",
        "com.petcarehub.medicalRecords"
})
public class PetcarehubApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetcarehubApplication.class, args);
    }

}