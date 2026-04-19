package com.eventrent.dto;

import java.math.BigDecimal;

public class MonthlyEarningDto {

    private String monthKey;
    private String label;
    private BigDecimal amount;

    public MonthlyEarningDto() {
    }

    public MonthlyEarningDto(String monthKey, String label, BigDecimal amount) {
        this.monthKey = monthKey;
        this.label = label;
        this.amount = amount;
    }

    public String getMonthKey() {
        return monthKey;
    }

    public void setMonthKey(String monthKey) {
        this.monthKey = monthKey;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
