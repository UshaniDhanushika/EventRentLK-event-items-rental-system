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

    public List<Equipment> findByCategory(String category) {
        if (category == null || category.isBlank()) {
            return findAll();
        }
        return equipmentRepository.findByCategoryIgnoreCase(category.trim());
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
