package com.eventrent.service;

import com.eventrent.dto.CreateRentalRequest;
import com.eventrent.model.Equipment;
import com.eventrent.model.RentalLine;
import com.eventrent.model.RentalOrder;
import com.eventrent.repository.EquipmentRepository;
import com.eventrent.repository.RentalOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class RentalService {

    private final RentalOrderRepository rentalOrderRepository;
    private final EquipmentRepository equipmentRepository;
    private final EmailService emailService;

    public RentalService(RentalOrderRepository rentalOrderRepository, EquipmentRepository equipmentRepository, EmailService emailService) {
        this.rentalOrderRepository = rentalOrderRepository;
        this.equipmentRepository = equipmentRepository;
        this.emailService = emailService;
    }

    public void confirmOrder(String orderId) {
        RentalOrder order = rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        
        order.setStatus("CONFIRMED");
        rentalOrderRepository.save(order);
        
        try {
            emailService.sendConfirmationEmail(order);
            System.out.println(">>> EMAIL SENT SUCCESSFULLY TO: " + order.getCustomerEmail());
        } catch (Exception e) {
            System.err.println(">>> EMAIL ERROR: Failed to send to " + order.getCustomerEmail());
            e.printStackTrace(); // This will show the exact reason in your terminal
        }
    }

    public void returnOrder(String orderId) {
        RentalOrder order = rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        
        // Only return items if the order hasn't been returned already
        if ("RETURNED".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order already returned");
        }

        order.setStatus("RETURNED");
        rentalOrderRepository.save(order);

        // Put items back into stock
        for (com.eventrent.model.RentalLine line : order.getLines()) {
            equipmentRepository.findById(line.getEquipmentId()).ifPresent(eq -> {
                int restoredQty = eq.getQuantityAvailable() + line.getQuantity();
                
                // If totalStock was never set (is 0), initialize it now
                if (eq.getTotalStock() < restoredQty) {
                    eq.setTotalStock(restoredQty);
                }
                
                eq.setQuantityAvailable(restoredQty);
                equipmentRepository.save(eq);
            });
        }

        try {
            emailService.sendReturnEmail(order);
            System.out.println(">>> RETURN EMAIL SENT SUCCESSFULLY TO: " + order.getCustomerEmail());
        } catch (Exception e) {
            System.err.println(">>> RETURN EMAIL ERROR: Failed to send to " + order.getCustomerEmail());
            e.printStackTrace();
        }
    }

    public RentalOrder create(CreateRentalRequest request) {
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        
        // Safety check: Dates cannot be in the past
        for (com.eventrent.dto.CreateRentalLine line : request.getLines()) {
            if (line.getStartDate() != null && line.getStartDate().isBefore(today)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rental start date cannot be in the past");
            }
            if (line.getEndDate() != null && line.getEndDate().isBefore(line.getStartDate())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date cannot be before start date");
            }
        }

        List<RentalLine> resolved = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (RentalLine line : request.getLines()) {
            Equipment equipment = equipmentRepository.findById(line.getEquipmentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Unknown equipment: " + line.getEquipmentId()));

            LocalDate start = line.getStartDate();
            LocalDate end = line.getEndDate();
            if (start == null || end == null || end.isBefore(start)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid rental dates");
            }
            int qty = line.getQuantity();
            if (qty < 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
            }
            if (qty > equipment.getQuantityAvailable()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock for " + equipment.getName());
            }

            long days = ChronoUnit.DAYS.between(start, end) + 1;
            if (days < 1) days = 1;
            BigDecimal rate = equipment.getDailyRate();
            BigDecimal lineTotal = rate.multiply(BigDecimal.valueOf(days)).multiply(BigDecimal.valueOf(qty));

            RentalLine stored = new RentalLine();
            stored.setEquipmentId(equipment.getId());
            stored.setEquipmentName(equipment.getName());
            stored.setQuantity(qty);
            stored.setStartDate(start);
            stored.setEndDate(end);
            stored.setDailyRate(rate);
            stored.setRentalDays((int) days);
            stored.setLineTotal(lineTotal);
            resolved.add(stored);
            total = total.add(lineTotal);
        }

        RentalOrder order = new RentalOrder();
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerEmail(request.getCustomerEmail().trim());
        order.setCustomerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone().trim() : null);
        order.setNotes(request.getNotes());
        order.setLines(resolved);
        order.setTotal(total);
        order.setAdvancePayment(total.multiply(new BigDecimal("0.60")).setScale(2, RoundingMode.HALF_UP));
        if (!resolved.isEmpty()) {
            order.setStartDate(resolved.get(0).getStartDate());
            order.setEndDate(resolved.get(0).getEndDate());
        }
        order.setStatus("PENDING_RENTAL");
        order.setCreatedAt(Instant.now());
        RentalOrder savedOrder = rentalOrderRepository.save(order);

        // Update equipment stock
        for (RentalLine line : resolved) {
            equipmentRepository.findById(line.getEquipmentId()).ifPresent(eq -> {
                int newQty = eq.getQuantityAvailable() - line.getQuantity();
                eq.setQuantityAvailable(Math.max(0, newQty));
                equipmentRepository.save(eq);
            });
        }

        return savedOrder;
    }

    public List<RentalOrder> findByEmail(String email) {
        return rentalOrderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    public List<RentalOrder> findAll() {
        return rentalOrderRepository.findAll();
    }
}
