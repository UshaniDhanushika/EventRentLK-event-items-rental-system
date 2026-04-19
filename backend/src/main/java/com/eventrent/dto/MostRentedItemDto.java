package com.eventrent.dto;

public class MostRentedItemDto {

    private String equipmentName;
    private int rentalCount;

    public MostRentedItemDto() {
    }

    public MostRentedItemDto(String equipmentName, int rentalCount) {
        this.equipmentName = equipmentName;
        this.rentalCount = rentalCount;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public int getRentalCount() {
        return rentalCount;
    }

    public void setRentalCount(int rentalCount) {
        this.rentalCount = rentalCount;
    }
}
