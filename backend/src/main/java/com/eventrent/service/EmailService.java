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

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void sendHtmlEmail(String to, String subject, String bodyHtml) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true);
            
            mailSender.send(message);
        } catch (jakarta.mail.MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private String getHtmlLayout(String title, String content) {
        return "<!DOCTYPE html>" +
               "<html><head><style>" +
               "body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a0233; margin: 0; padding: 0; background-color: #f8f4ff; }" +
               ".container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(86, 11, 173, 0.1); }" +
               ".header { background: #560BAD; padding: 30px; text-align: center; color: #ffffff; }" +
               ".header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }" +
               ".content { padding: 40px; }" +
               ".footer { background: #f0ebf7; padding: 20px; text-align: center; font-size: 12px; color: #6b5a7e; }" +
               ".order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }" +
               ".order-table th { text-align: left; padding: 10px; border-bottom: 2px solid #560BAD; }" +
               ".order-table td { padding: 10px; border-bottom: 1px solid #e6def0; }" +
               ".button { display: inline-block; padding: 12px 25px; background: #560BAD; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }" +
               ".gold { color: #FFD700; }" +
               "</style></head><body>" +
               "<div class='container'>" +
               "  <div class='header'><h1>EventRent<span class='gold'>LK</span></h1></div>" +
               "  <div class='content'>" +
               "    <h2>" + title + "</h2>" +
               "    " + content + "" +
               "  </div>" +
               "  <div class='footer'>© " + java.time.Year.now().getValue() + " EventRentLK — Premium Event Rentals in Sri Lanka<br>Celeberate more, spend less!</div>" +
               "</div>" +
               "</body></html>";
    }

    public void sendConfirmationEmail(RentalOrder order) {
        String content = String.format(
            "<p>Dear <strong>%s</strong>,</p>" +
            "<p>Great news! Your rental request has been <strong>CONFIRMED</strong>.</p>" +
            "<table class='order-table'>" +
            "  <tr><th>Details</th><th>Value</th></tr>" +
            "  <tr><td>Event Dates</td><td>%s to %s</td></tr>" +
            "  <tr><td>Total Amount</td><td><strong>$%.2f</strong></td></tr>" +
            "  <tr><td>Advance Payment (60%%)</td><td style='color:#560BAD'><strong>$%.2f</strong></td></tr>" +
            "</table>" +
            "<p>Please proceed with the advance payment to secure your equipment. Our team will contact you shortly for pickup/delivery details.</p>" +
            "<a href='%s' class='button'>View My Rentals</a>",
            order.getCustomerName(),
            order.getStartDate(),
            order.getEndDate(),
            order.getTotal(),
            order.getAdvancePayment(),
            frontendUrl
        );

        sendHtmlEmail(order.getCustomerEmail(), "Rental Confirmed - EventRentLK", getHtmlLayout("Your Order is Confirmed!", content));
    }

    public void sendReturnEmail(RentalOrder order) {
        String content = String.format(
            "<p>Dear <strong>%s</strong>,</p>" +
            "<p>We have successfully received the items for Order <strong>#%s</strong>.</p>" +
            "<p>Your rental is now marked as <strong>COMPLETED</strong>. We hope everything was perfect for your event!</p>" +
            "<p>Thank you for choosing EventRentLK. We would love to serve you again for your next celebration.</p>" +
            "<a href='%s' class='button'>Rent More Items</a>",
            order.getCustomerName(),
            order.getId().substring(order.getId().length() - 6),
            frontendUrl
        );

        sendHtmlEmail(order.getCustomerEmail(), "Return Received - EventRentLK", getHtmlLayout("Items Returned Successfully!", content));
    }
}
