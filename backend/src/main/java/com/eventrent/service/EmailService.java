package com.eventrent.service;

import com.eventrent.model.RentalOrder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendConfirmationEmail(RentalOrder order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(order.getCustomerEmail());
        message.setSubject("Rental Confirmation - EventRentLK");

        String content = String.format(
            "Dear %s,\n\n" +
            "Your rental request has been CONFIRMED!\n\n" +
            "Order Details:\n" +
            "- Total Amount: $%.2f\n" +
            "- 60%% Advance Payment Required: $%.2f\n" +
            "- Event Dates: %s to %s\n\n" +
            "Please proceed with the advance payment to secure your equipment.\n\n" +
            "Thank you for choosing EventRentLK!",
            order.getCustomerName(),
            order.getTotal(),
            order.getAdvancePayment(),
            order.getStartDate(),
            order.getEndDate()
        );

        message.setText(content);
        mailSender.send(message);
    }

    public void sendReturnEmail(RentalOrder order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(order.getCustomerEmail());
        message.setSubject("Items Returned Successfully - EventRentLK");

        String content = String.format(
            "Dear %s,\n\n" +
            "This is to confirm that we have successfully received the rented items for Order #%s.\n\n" +
            "Your rental status is now COMPLETED. We hope you had a wonderful event!\n\n" +
            "Thank you for choosing EventRentLK, and we look forward to serving you again.",
            order.getCustomerName(),
            order.getId()
        );

        message.setText(content);
        mailSender.send(message);
    }
}
