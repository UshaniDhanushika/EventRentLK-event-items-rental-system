package com.eventrent.repository;

import com.eventrent.model.GlobalState;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalStateRepository extends MongoRepository<GlobalState, String> {
}
