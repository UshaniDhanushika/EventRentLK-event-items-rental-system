package com.eventrent.repository;

import com.eventrent.model.RentalOrder;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RentalOrderRepository extends MongoRepository<RentalOrder, String> {
    List<RentalOrder> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String email);
}
