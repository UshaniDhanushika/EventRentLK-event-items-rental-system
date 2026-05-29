package com.eventrent.controller;

import com.eventrent.dto.SpinResponseDto;
import com.eventrent.model.GlobalState;
import com.eventrent.model.UserAccount;
import com.eventrent.repository.GlobalStateRepository;
import com.eventrent.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/spin")
public class SpinController {

    private final UserAccountRepository users;
    private final GlobalStateRepository globalStateRepository;
    private final Random random = new Random();

    // Prizes matching the visual segments in order (0, 45, 90...)
    // 0: 20%, 1: 0% (NO LUCK), 2: 10%, 3: 5%, 4: 15%, 5: 0% (TRY AGAIN), 6: 10%, 7: 5%
    private static final int[] WINNING_INDICES = {0, 2, 3, 4, 6, 7};
    private static final int[] LOSING_INDICES = {1, 5};
    private static final int[] PRIZES = {20, 0, 10, 5, 15, 0, 10, 5};

    public SpinController(UserAccountRepository users, GlobalStateRepository globalStateRepository) {
        this.users = users;
        this.globalStateRepository = globalStateRepository;
    }

    @PostMapping
    public SpinResponseDto spin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to spin the wheel");
        }

        UserAccount user = users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String today = LocalDate.now().toString();

        if (today.equals(user.getLastSpinDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already spun the wheel today.");
        }

        // Get or create global state
        List<GlobalState> states = globalStateRepository.findAll();
        GlobalState state;
        if (states.isEmpty()) {
            state = new GlobalState();
            state.setSpinCount(0);
            state = globalStateRepository.save(state);
        } else {
            state = states.get(0);
        }

        // Increment spin count
        state.setSpinCount(state.getSpinCount() + 1);
        globalStateRepository.save(state);

        boolean isWinner = (state.getSpinCount() % 10 == 0);
        int segmentIndex;

        if (isWinner) {
            segmentIndex = WINNING_INDICES[random.nextInt(WINNING_INDICES.length)];
        } else {
            segmentIndex = LOSING_INDICES[random.nextInt(LOSING_INDICES.length)];
        }

        int discountPercent = PRIZES[segmentIndex];

        // Update user state
        user.setLastSpinDate(today);
        user.setLastSpinDiscount(discountPercent);
        users.save(user);

        return new SpinResponseDto(segmentIndex, discountPercent);
    }
}
