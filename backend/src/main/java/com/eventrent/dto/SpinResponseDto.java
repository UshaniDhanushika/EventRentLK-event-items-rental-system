package com.eventrent.dto;

public class SpinResponseDto {
    private int segmentIndex;
    private int discountPercent;

    public SpinResponseDto(int segmentIndex, int discountPercent) {
        this.segmentIndex = segmentIndex;
        this.discountPercent = discountPercent;
    }

    public int getSegmentIndex() {
        return segmentIndex;
    }

    public void setSegmentIndex(int segmentIndex) {
        this.segmentIndex = segmentIndex;
    }

    public int getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(int discountPercent) {
        this.discountPercent = discountPercent;
    }
}
