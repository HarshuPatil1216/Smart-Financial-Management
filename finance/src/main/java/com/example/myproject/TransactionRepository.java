package com.example.myproject;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // युजरनेमवरून हिस्ट्री मिळवण्यासाठी
    List<Transaction> findByUser_Username(String username);

    // युजर आयडीवरून हिस्ट्री मिळवण्यासाठी (ही मेथड असणे अनिवार्य आहे)
    List<Transaction> findByUser_UserId(Long userId);
}