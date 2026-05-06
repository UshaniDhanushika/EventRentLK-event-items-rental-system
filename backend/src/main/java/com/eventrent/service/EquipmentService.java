package com.eventrent.service;

import com.eventrent.model.Equipment;
import com.eventrent.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    private com.eventrent.service.RentalService rentalService;

    @org.springframework.beans.factory.annotation.Autowired
    public void setRentalService(com.eventrent.service.RentalService rentalService) {
        this.rentalService = rentalService;
    }

    public List<Equipment> findByCategory(String category, java.time.LocalDate start, java.time.LocalDate end) {
        List<Equipment> items;
        if (category == null || category.isBlank()) {
            items = findAll();
        } else {
            items = equipmentRepository.findByCategoryIgnoreCase(category.trim());
        }

        if (start != null && end != null && rentalService != null) {
            for (Equipment item : items) {
                int available = rentalService.getAvailableQuantity(item.getId(), start, end);
                item.setQuantityAvailable(available);
                
                int missing = rentalService.getMissingStockCount(item.getId(), available);
                item.setMissingStockCount(missing);
                
                if (missing > 0) {
                    item.setNextAvailableDate(rentalService.getNextAvailableDate(item.getId(), start));
                }
            }
        }
        return items;
    }

    public List<Equipment> findByCategory(String category) {
        return findByCategory(category, null, null);
    }

    public Optional<Equipment> findById(String id) {
        return equipmentRepository.findById(id);
    }

    public Equipment save(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public void deleteById(String id) {
        equipmentRepository.deleteById(id);
    }
}
