package com.eventrent.controller;

import com.eventrent.model.Equipment;
import com.eventrent.service.EquipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final com.eventrent.service.RentalService rentalService;

    public EquipmentController(EquipmentService equipmentService, com.eventrent.service.RentalService rentalService) {
        this.equipmentService = equipmentService;
        this.rentalService = rentalService;
    }

    @GetMapping
    public List<Equipment> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        java.time.LocalDate start = (startDate != null) ? java.time.LocalDate.parse(startDate) : null;
        java.time.LocalDate end = (endDate != null) ? java.time.LocalDate.parse(endDate) : null;
        
        return equipmentService.findByCategory(category, start, end);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> get(@PathVariable String id) {
        return equipmentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/availability")
    public int checkAvailability(
            @PathVariable String id,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        java.time.LocalDate start = java.time.LocalDate.parse(startDate);
        java.time.LocalDate end = java.time.LocalDate.parse(endDate);
        return rentalService.getAvailableQuantity(id, start, end);
    }
}
