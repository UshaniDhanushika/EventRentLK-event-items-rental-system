package com.eventrent.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AdminUserRentalDto {
    private String orderId;
    private String equipmentName;
    private BigDecimal price;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    public AdminUserRentalDto() {}

    public AdminUserRentalDto(String orderId, String equipmentName, BigDecimal price, String status, LocalDate startDate, LocalDate endDate) {
        this.orderId = orderId;
        this.equipmentName = equipmentName;
        this.price = price;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
