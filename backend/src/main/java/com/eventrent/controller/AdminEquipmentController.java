package com.eventrent.controller;

import com.eventrent.model.Equipment;
import com.eventrent.service.EquipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/equipment")
public class AdminEquipmentController {

    private final EquipmentService equipmentService;

    public AdminEquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public List<Equipment> listAll(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        if (startDate != null && endDate != null) {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            return equipmentService.findByCategory(null, start, end);
        }
        return equipmentService.findAll();
    }

    @PostMapping
    public Equipment create(@RequestBody Equipment body) {
        body.setId(null);
        // If totalStock isn't provided, initialize it to quantityAvailable
        if (body.getTotalStock() <= 0) {
            body.setTotalStock(body.getQuantityAvailable());
        }
        return equipmentService.save(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipment> update(@PathVariable String id, @RequestBody Equipment body) {
        return equipmentService.findById(id)
                .map(existing -> {
                    body.setId(id);
                    // Ensure totalStock is at least as much as quantityAvailable if not set
                    if (body.getTotalStock() <= 0) {
                        body.setTotalStock(body.getQuantityAvailable());
                    }
                    return ResponseEntity.ok(equipmentService.save(body));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (equipmentService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        equipmentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
