package com.eventrent.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "system_state")
public class GlobalState {

    @Id
    private String id;
    
    private int spinCount;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getSpinCount() {
        return spinCount;
    }

    public void setSpinCount(int spinCount) {
        this.spinCount = spinCount;
    }
}
