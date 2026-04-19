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
        } catch (Exception e) {
            System.err.println("Email failed: " + e.getMessage());
        }
    }

    public RentalOrder create(CreateRentalRequest request) {
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
        return rentalOrderRepository.save(order);
    }

    public List<RentalOrder> findByEmail(String email) {
        return rentalOrderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    public List<RentalOrder> findAll() {
        return rentalOrderRepository.findAll();
    }
}
