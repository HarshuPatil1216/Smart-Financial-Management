package com.example.myproject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // रिएक्ट ॲपसाठी परमिशन
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    // १. युजर आयडीनुसार सर्व व्यवहारांची हिस्ट्री मिळवणे
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        try {
            List<Transaction> history = transactionRepository.findByUser_UserId(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error loading history: " + e.getMessage());
        }
    }

    // २. नवीन व्यवहार सेव्ह करणे (Category सह)
    @PostMapping("/add")
    public ResponseEntity<?> addTransaction(@RequestBody Map<String, Object> payload) {
        try {
            // पेलोडमधून डेटा सुरक्षितपणे वाचणे
            Object userIdObj = payload.get("user_id");
            Object amountObj = payload.get("amount");
            String description = (String) payload.get("description");
            String type = (String) payload.get("type");
            String category = (String) payload.get("category"); // नवीन कॅटेगरी फील्ड

            // व्हॅलिडेशन: आयडी आणि अमाउंट असणे गरजेचे आहे
            if (userIdObj == null || amountObj == null) {
                return ResponseEntity.badRequest().body("User ID or Amount is missing!");
            }

            Long userId = Long.valueOf(userIdObj.toString());
            double amount = Double.parseDouble(amountObj.toString());

            // १. डेटाबेसमध्ये युजर अस्तित्वात आहे का ते पाहणे
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isPresent()) {
                // २. नवीन Transaction ऑब्जेक्ट तयार करणे
                Transaction transaction = new Transaction();
                transaction.setDescription(description);
                transaction.setAmount(amount);
                transaction.setType(type);

                // जर फ्रंटएंडकडून कॅटेगरी आली नसेल तर 'General' सेट करणे
                transaction.setCategory(category != null ? category : "General");

                // ३. युजर मॅप करणे
                transaction.setUser(userOpt.get());

                // ४. डेटाबेसमध्ये सेव्ह करणे
                transactionRepository.save(transaction);

                System.out.println("✅ Transaction saved with Category: " + category + " for User: " + userId);
                return ResponseEntity.ok("Transaction saved successfully!");
            } else {
                return ResponseEntity.status(404).body("User not found with ID: " + userId);
            }
        } catch (Exception e) {
            // कन्सोलमध्ये एरर लॉग करणे जेणेकरून डीबगिंग सोपे होईल
            e.printStackTrace();
            return ResponseEntity.status(400).body("Invalid Data Format: " + e.getMessage());
        }
    }
}