package com.eventrent.controller;

import com.eventrent.dto.AdminDashboardDto;
import com.eventrent.dto.AdminUserRentalDto;
import com.eventrent.dto.AdminUserSummaryDto;
import com.eventrent.model.RentalOrder;
import com.eventrent.model.RentalLine;
import com.eventrent.model.UserAccount;
import com.eventrent.repository.EquipmentRepository;
import com.eventrent.repository.RentalOrderRepository;
import com.eventrent.repository.UserAccountRepository;
import com.eventrent.service.AdminDashboardService;
import com.eventrent.service.RentalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EquipmentRepository equipmentRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final UserAccountRepository userAccountRepository;
    private final AdminDashboardService adminDashboardService;
    private final RentalService rentalService;

    public AdminController(
            EquipmentRepository equipmentRepository,
            RentalOrderRepository rentalOrderRepository,
            UserAccountRepository userAccountRepository,
            AdminDashboardService adminDashboardService,
            RentalService rentalService
    ) {
        this.equipmentRepository = equipmentRepository;
        this.rentalOrderRepository = rentalOrderRepository;
        this.userAccountRepository = userAccountRepository;
        this.adminDashboardService = adminDashboardService;
        this.rentalService = rentalService;
    }

    @PostMapping("/rentals/{orderId}/confirm")
    public void confirmRental(@PathVariable String orderId) {
        rentalService.confirmOrder(orderId);
    }

    @PostMapping("/rentals/{orderId}/return")
    public void returnRental(@PathVariable String orderId) {
        rentalService.returnOrder(orderId);
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return Map.of(
                "equipmentCount", equipmentRepository.count(),
                "rentalOrderCount", rentalOrderRepository.count()
        );
    }

    @GetMapping("/dashboard")
    public AdminDashboardDto dashboard() {
        return adminDashboardService.build();
    }

    @GetMapping("/users")
    public List<AdminUserSummaryDto> users() {
        List<UserAccount> userList = userAccountRepository.findAll();
        List<RentalOrder> allOrders = rentalOrderRepository.findAll();

        return userList.stream()
                .filter(u -> u.getRole() == null || !u.getRole().name().equalsIgnoreCase("ADMIN"))
                .map(u -> toUserSummary(u, allOrders))
                .toList();
    }

    private AdminUserSummaryDto toUserSummary(UserAccount u, List<RentalOrder> allOrders) {
        List<AdminUserRentalDto> rentals = allOrders.stream()
                .filter(o -> o != null && u.getEmail() != null && u.getEmail().equalsIgnoreCase(o.getCustomerEmail()))
                .flatMap(o -> {
                    List<RentalLine> lines = o.getLines();
                    if (lines == null) return java.util.stream.Stream.empty();
                    return lines.stream().map(line -> new AdminUserRentalDto(
                            o.getId(),
                            line.getEquipmentName(),
                            line.getLineTotal(),
                            o.getStatus() != null ? o.getStatus() : "SUBMITTED_COMPLETE",
                            line.getStartDate(),
                            line.getEndDate()
                    ));
                })
                .toList();

        return new AdminUserSummaryDto(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getAddress(),
                u.getPhoneNumber(),
                u.getRole() != null ? u.getRole().name() : null,
                rentals,
                u.getCreatedAt()
        );
    }
}
