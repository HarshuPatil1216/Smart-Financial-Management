package com.example.myproject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    // URL: GET https://.../api/history/{userId}
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        try {
            List<Transaction> history = transactionRepository.findByUser_UserId(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // URL: POST https://.../api/add
    @PostMapping("/add")
    public ResponseEntity<?> addTransaction(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("user_id").toString());
            double amount = Double.parseDouble(payload.get("amount").toString());
            String description = (String) payload.get("description");
            String type = (String) payload.get("type");
            String category = (String) payload.get("category");

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                Transaction transaction = new Transaction();
                transaction.setDescription(description);
                transaction.setAmount(amount);
                transaction.setType(type);
                transaction.setCategory(category != null ? category : "General");
                transaction.setUser(userOpt.get());

                transactionRepository.save(transaction);
                return ResponseEntity.ok("Transaction saved successfully!");
            }
            return ResponseEntity.status(404).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    // URL: DELETE https://.../api/transactions/{id}
    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        try {
            transactionRepository.deleteById(id);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Delete failed");
        }
    }
}