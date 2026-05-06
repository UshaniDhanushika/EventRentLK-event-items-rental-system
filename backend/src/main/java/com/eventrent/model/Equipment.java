package com.eventrent.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(collection = "equipment")
public class Equipment {

    @Id
    private String id;
    private String name;
    private String description;
    private String category;
    private BigDecimal dailyRate;
    private int totalStock;
    private int quantityAvailable;
    private String imageUrl;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getDailyRate() {
        return dailyRate;
    }

    public void setDailyRate(BigDecimal dailyRate) {
        this.dailyRate = dailyRate;
    }

    public int getTotalStock() {
        return totalStock;
    }

    public void setTotalStock(int totalStock) {
        this.totalStock = totalStock;
    }

    public int getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(int quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @org.springframework.data.annotation.Transient
    private java.time.LocalDate nextAvailableDate;

    public java.time.LocalDate getNextAvailableDate() {
        return nextAvailableDate;
    }

    public void setNextAvailableDate(java.time.LocalDate nextAvailableDate) {
        this.nextAvailableDate = nextAvailableDate;
    }

    @org.springframework.data.annotation.Transient
    private int missingStockCount;

    public int getMissingStockCount() {
        return missingStockCount;
    }

    public void setMissingStockCount(int missingStockCount) {
        this.missingStockCount = missingStockCount;
    }
}
