package com.eventrent.config;

import com.eventrent.model.Equipment;
import com.eventrent.model.Role;
import com.eventrent.model.UserAccount;
import com.eventrent.repository.EquipmentRepository;
import com.eventrent.repository.UserAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedAdminUser(UserAccountRepository users, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@eventrent.local";
            if (users.existsByEmailIgnoreCase(adminEmail)) {
                return;
            }
            UserAccount admin = new UserAccount();
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("admin12345"));
            admin.setFullName("Admin");
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(Instant.now());
            users.save(admin);
        };
    }

    @Bean
    CommandLineRunner seedEquipment(EquipmentRepository repo) {
        return args -> {
            if (repo.count() > 0) {
                return;
            }
            repo.save(item("PA System (small)", "Speakers, mixer, 2 wireless mics — up to 80 guests.",
                    "Audio", new BigDecimal("125.00"), 4,
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"));
            repo.save(item("LED Uplighting (set of 8)", "RGB LED pars with wireless control.",
                    "Lighting", new BigDecimal("45.00"), 10,
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"));
            repo.save(item("6ft Folding Tables", "Commercial grade, seats 6–8.",
                    "Furniture", new BigDecimal("12.00"), 40,
                    "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800"));
            repo.save(item("Chiavari Chairs (gold)", "Elegant event seating.",
                    "Furniture", new BigDecimal("8.50"), 120,
                    "https://images.unsplash.com/photo-1519167758481-83f29da4541c?w=800"));
            repo.save(item("10x10 Canopy Tent", "White top, weighted legs available.",
                    "Outdoor", new BigDecimal("95.00"), 6,
                    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800"));
            repo.save(item("Projector + 120\" Screen", "HDMI, includes extension cords.",
                    "AV", new BigDecimal("85.00"), 5,
                    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800"));
        };
    }

    private static Equipment item(String name, String description, String category,
            BigDecimal dailyRate, int qty, String imageUrl) {
        Equipment e = new Equipment();
        e.setName(name);
        e.setDescription(description);
        e.setCategory(category);
        e.setDailyRate(dailyRate);
        e.setQuantityAvailable(qty);
        e.setImageUrl(imageUrl);
        return e;
    }
}
