package com.eventrent.controller;

import com.eventrent.dto.CreateRentalRequest;
import com.eventrent.model.RentalOrder;
import com.eventrent.service.RentalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RentalOrder create(@Valid @RequestBody CreateRentalRequest request) {
        return rentalService.create(request);
    }

    @GetMapping
    public List<RentalOrder> list() {
        return rentalService.findAll();
    }

    @GetMapping("/my-rentals")
    public List<RentalOrder> myRentals(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED);
        }
        return rentalService.findByEmail(authentication.getName());
    }
}
