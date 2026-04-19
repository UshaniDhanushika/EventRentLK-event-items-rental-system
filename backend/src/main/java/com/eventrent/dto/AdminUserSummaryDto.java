package com.eventrent.dto;

import java.time.Instant;

public class AdminUserSummaryDto {

    private String id;
    private String email;
    private String fullName;
    private String address;
    private String phoneNumber;
    private String role;
    private java.util.List<AdminUserRentalDto> rentals;
    private Instant createdAt;

    public AdminUserSummaryDto() {
    }

    public AdminUserSummaryDto(String id, String email, String fullName, String address, String phoneNumber, String role, java.util.List<AdminUserRentalDto> rentals, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.rentals = rentals;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public java.util.List<AdminUserRentalDto> getRentals() {
        return rentals;
    }

    public void setRentals(java.util.List<AdminUserRentalDto> rentals) {
        this.rentals = rentals;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
