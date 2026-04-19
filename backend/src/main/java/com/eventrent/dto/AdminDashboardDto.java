package com.eventrent.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AdminDashboardDto {

    private BigDecimal totalEarningsThisMonth;
    private int activeRentals;
    private long totalRentals;
    private BigDecimal averageRating;
    private boolean ratingPlaceholder;
    private List<MonthlyEarningDto> monthlyEarnings = new ArrayList<>();
    private List<MostRentedItemDto> mostRentedItems = new ArrayList<>();

    public BigDecimal getTotalEarningsThisMonth() {
        return totalEarningsThisMonth;
    }

    public void setTotalEarningsThisMonth(BigDecimal totalEarningsThisMonth) {
        this.totalEarningsThisMonth = totalEarningsThisMonth;
    }

    public int getActiveRentals() {
        return activeRentals;
    }

    public void setActiveRentals(int activeRentals) {
        this.activeRentals = activeRentals;
    }

    public long getTotalRentals() {
        return totalRentals;
    }

    public void setTotalRentals(long totalRentals) {
        this.totalRentals = totalRentals;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public boolean isRatingPlaceholder() {
        return ratingPlaceholder;
    }

    public void setRatingPlaceholder(boolean ratingPlaceholder) {
        this.ratingPlaceholder = ratingPlaceholder;
    }

    public List<MonthlyEarningDto> getMonthlyEarnings() {
        return monthlyEarnings;
    }

    public void setMonthlyEarnings(List<MonthlyEarningDto> monthlyEarnings) {
        this.monthlyEarnings = monthlyEarnings;
    }

    public List<MostRentedItemDto> getMostRentedItems() {
        return mostRentedItems;
    }

    public void setMostRentedItems(List<MostRentedItemDto> mostRentedItems) {
        this.mostRentedItems = mostRentedItems;
    }
}
