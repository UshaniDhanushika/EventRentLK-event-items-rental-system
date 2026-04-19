package com.eventrent.repository;

import com.eventrent.model.Equipment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EquipmentRepository extends MongoRepository<Equipment, String> {

    List<Equipment> findByCategoryIgnoreCase(String category);
}
