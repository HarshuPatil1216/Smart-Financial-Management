package com.example.myproject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")

public class UserController {

    @Autowired
    private UserRepository userRepository;

    // URL: POST https://.../api/users/register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User newUser) {
        try {
            if (userRepository.findByUsername(newUser.getUsername()) != null) {
                return ResponseEntity.badRequest().body("Username already exists!");
            }
            if (newUser.getBudgetLimit() == null) {
                newUser.setBudgetLimit(5000.0);
            }
            userRepository.save(newUser);
            return ResponseEntity.ok("Registration successful!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // URL: POST https://.../api/users/login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        User user = userRepository.findByUsername(credentials.get("username"));
        if (user != null && user.getPassword().equals(credentials.get("password"))) {
            return ResponseEntity.ok(user); // पूर्ण युजर ऑब्जेक्ट पाठवतो ज्यामध्ये userId आहे
        }
        return ResponseEntity.status(401).body("Invalid credentials!");
    }

    // URL: POST https://.../api/users/update-budget
    @PostMapping("/update-budget")
    public ResponseEntity<?> updateBudget(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("user_id").toString());
            Double newLimit = Double.valueOf(payload.get("budget_limit").toString());

            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                user.setBudgetLimit(newLimit);
                userRepository.save(user);
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(404).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating budget");
        }
    }
}