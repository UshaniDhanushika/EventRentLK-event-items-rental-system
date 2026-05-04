package com.eventrent.service;

import com.eventrent.dto.AdminDashboardDto;
import com.eventrent.dto.MonthlyEarningDto;
import com.eventrent.dto.MostRentedItemDto;
import com.eventrent.model.RentalLine;
import com.eventrent.model.RentalOrder;
import com.eventrent.repository.RentalOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminDashboardService {

    private static final BigDecimal PLACEHOLDER_RATING = new BigDecimal("4.8");

    private final RentalOrderRepository rentalOrderRepository;

    public AdminDashboardService(RentalOrderRepository rentalOrderRepository) {
        this.rentalOrderRepository = rentalOrderRepository;
    }

    public AdminDashboardDto build() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        YearMonth currentMonth = YearMonth.now(zone);
        List<RentalOrder> all = rentalOrderRepository.findAll();

        BigDecimal earningsThisMonth = BigDecimal.ZERO;
        int activeRentalLines = 0;
        Map<String, Integer> rentedQtyByName = new HashMap<>();

        for (RentalOrder order : all) {
            BigDecimal total = order.getTotal() != null ? order.getTotal() : BigDecimal.ZERO;
            Instant created = order.getCreatedAt();
            if (created != null && YearMonth.from(created.atZone(zone)).equals(currentMonth)) {
                earningsThisMonth = earningsThisMonth.add(total);
            }

            List<RentalLine> lines = order.getLines() != null ? order.getLines() : List.of();
            for (RentalLine line : lines) {
                LocalDate start = line.getStartDate();
                LocalDate end = line.getEndDate();
                if (start != null && end != null
                        && !start.isAfter(today)
                        && !end.isBefore(today)) {
                    activeRentalLines++;
                }
                String name = line.getEquipmentName() != null && !line.getEquipmentName().isBlank()
                        ? line.getEquipmentName()
                        : line.getEquipmentId();
                rentedQtyByName.merge(name, line.getQuantity(), Integer::sum);
            }
        }

        List<MonthlyEarningDto> monthly = new ArrayList<>();
        DateTimeFormatter keyFmt = DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 2; i >= 0; i--) {
            YearMonth m = currentMonth.minusMonths(i);
            BigDecimal sum = BigDecimal.ZERO;
            for (RentalOrder order : all) {
                if (order.getCreatedAt() == null) {
                    continue;
                }
                if (YearMonth.from(order.getCreatedAt().atZone(zone)).equals(m)) {
                    sum = sum.add(order.getTotal() != null ? order.getTotal() : BigDecimal.ZERO);
                }
            }
            String label = m.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH);
            monthly.add(new MonthlyEarningDto(m.format(keyFmt), label, sum.setScale(2, RoundingMode.HALF_UP)));
        }

        List<MostRentedItemDto> mostRented = rentedQtyByName.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(8)
                .map(e -> new MostRentedItemDto(e.getKey(), e.getValue()))
                .toList();

        List<MonthlyEarningDto> daily = new ArrayList<>();
        DateTimeFormatter dayKeyFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int d = 1; d <= today.getDayOfMonth(); d++) {
            LocalDate day = currentMonth.atDay(d);
            BigDecimal daySum = BigDecimal.ZERO;
            for (RentalOrder order : all) {
                if (order.getCreatedAt() == null) continue;
                if (order.getCreatedAt().atZone(zone).toLocalDate().equals(day)) {
                    daySum = daySum.add(order.getTotal() != null ? order.getTotal() : BigDecimal.ZERO);
                }
            }
            daily.add(new MonthlyEarningDto(day.format(dayKeyFmt), String.valueOf(d), daySum.setScale(2, RoundingMode.HALF_UP)));
        }

        AdminDashboardDto dto = new AdminDashboardDto();
        dto.setTotalEarningsThisMonth(earningsThisMonth.setScale(2, RoundingMode.HALF_UP));
        dto.setActiveRentals(activeRentalLines);
        dto.setTotalRentals(all.size());
        dto.setAverageRating(PLACEHOLDER_RATING);
        dto.setRatingPlaceholder(true);
        dto.setMonthlyEarnings(monthly);
        dto.setDailyEarnings(daily);
        dto.setMostRentedItems(mostRented);
        return dto;
    }
}
