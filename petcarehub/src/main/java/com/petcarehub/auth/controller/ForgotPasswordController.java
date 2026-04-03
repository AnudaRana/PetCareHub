package com.petcarehub.auth.controller;

import com.petcarehub.auth.dto.ChangePassword;
import com.petcarehub.auth.dto.MailBody;
import com.petcarehub.auth.entity.ForgotPassword;
import com.petcarehub.auth.repository.ForgotPasswordRepository;
import com.petcarehub.appointment.service.AppointmentEmailService;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Date;
import java.util.Objects;
import java.util.Random;

@RestController
@RequestMapping("/api/forgotPassword")
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final AppointmentEmailService emailService;
    private final ForgotPasswordRepository forgotPasswordRepository;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordController(UserRepository userRepository,
                                    AppointmentEmailService emailService,
                                    ForgotPasswordRepository forgotPasswordRepository,
                                    PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.forgotPasswordRepository = forgotPasswordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/verifyMail/{email}")
    @Transactional
    public ResponseEntity<String> verifyMail(@PathVariable String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("Please provide a valid email"));

        int otp = otpGenerator();


        ForgotPassword fp = forgotPasswordRepository.findByUser(user)
                .orElseGet(() -> new ForgotPassword());


        fp.setOtp(otp);
        fp.setExpirationTime(new Date(System.currentTimeMillis() + 300 * 1000));
        fp.setUser(user);

        forgotPasswordRepository.save(fp);


        MailBody mailBody = MailBody.builder()
                .to(email)
                .text("Use this OTP to reset your password: " + otp)
                .subject("OTP for Forgot Password Request")
                .build();
        emailService.sendSimpleMessage(mailBody);

        return ResponseEntity.ok("OTP has been sent");
    }

    @PostMapping("/verifyingOtp/{otp}/{email}")
    @Transactional
    public ResponseEntity<String> verifyOtp(@PathVariable Integer otp, @PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Please provide a valid email"));

        ForgotPassword fp = forgotPasswordRepository.findByOtpAndUser(otp, user)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid OTP"));

        if (fp.getExpirationTime().before(Date.from(Instant.now()))) {
            // Clean up expired OTP
            user.setForgotPassword(null);
            userRepository.save(user);
            forgotPasswordRepository.delete(fp);

            return new ResponseEntity<>("OTP has expired", HttpStatus.EXPECTATION_FAILED);
        }

        return ResponseEntity.ok("OTP verified!");
    }

    @PostMapping("/changePassword/{email}")
    @Transactional
    public ResponseEntity<String> changePasswordHandler(@RequestBody ChangePassword changePassword, @PathVariable String email) {

        if (!Objects.equals(changePassword.password(), changePassword.repeatPassword())) {
            return new ResponseEntity<>("Passwords do not match", HttpStatus.EXPECTATION_FAILED);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // FIX: Actually set the encoded password to the user object before saving
        String encodedPassword = passwordEncoder.encode(changePassword.password());
        user.setPassword(encodedPassword);

        userRepository.save(user);

        forgotPasswordRepository.findByUser(user).ifPresent(forgotPasswordRepository::delete);

        return ResponseEntity.ok("Password has been changed");
    }

    private Integer otpGenerator() {
        Random random = new Random();
        return random.nextInt(100000, 999999);
    }
}