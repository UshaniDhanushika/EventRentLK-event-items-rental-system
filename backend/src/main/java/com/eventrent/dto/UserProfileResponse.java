package com.eventrent.dto;

import com.eventrent.model.Role;

public class UserProfileResponse {

    private String email;
    private String fullName;
    private String address;
    private String phoneNumber;
    private Role role;
    private String lastSpinDate;
    private Integer lastSpinDiscount;

    public UserProfileResponse() {
    }

    public UserProfileResponse(String email, String fullName, String address, String phoneNumber, Role role, String lastSpinDate, Integer lastSpinDiscount) {
        this.email = email;
        this.fullName = fullName;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.lastSpinDate = lastSpinDate;
        this.lastSpinDiscount = lastSpinDiscount;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getLastSpinDate() {
        return lastSpinDate;
    }

    public void setLastSpinDate(String lastSpinDate) {
        this.lastSpinDate = lastSpinDate;
    }

    public Integer getLastSpinDiscount() {
        return lastSpinDiscount;
    }

    public void setLastSpinDiscount(Integer lastSpinDiscount) {
        this.lastSpinDiscount = lastSpinDiscount;
    }
}
