package com.eventrent.dto;

import java.math.BigDecimal;

public class CategoryStatDto {
    private String category;
    private BigDecimal revenue;
    private int quantity;

    public CategoryStatDto(String category, BigDecimal revenue, int quantity) {
        this.category = category;
        this.revenue = revenue;
        this.quantity = quantity;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
