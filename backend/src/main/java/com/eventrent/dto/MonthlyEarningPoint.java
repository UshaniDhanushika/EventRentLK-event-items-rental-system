package com.eventrent.dto;

import java.math.BigDecimal;

public class MonthlyEarningPoint {

    private String label;
    private BigDecimal total;

    public MonthlyEarningPoint() {
    }

    public MonthlyEarningPoint(String label, BigDecimal total) {
        this.label = label;
        this.total = total;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
