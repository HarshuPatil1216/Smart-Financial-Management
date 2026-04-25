package com.example.myproject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FinanceService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * युजरनेमवरून सर्व ट्रान्झॅक्शनची हिस्ट्री मिळवण्यासाठी.
     * येथे आपण 'findByUser_Username' वापरले आहे कारण Transaction आणि User मध्ये
     * ManyToOne रिलेशन्स आहेत.
     */
    public List<Transaction> getTransactionHistory(String username) {
        return transactionRepository.findByUser_Username(username);
    }

    /**
     * नवीन ट्रान्झॅक्शन सेव्ह करण्यासाठी.
     */
    public void saveTransaction(String username, Transaction transaction) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            transaction.setUser(user);
            transactionRepository.save(transaction);
        }
    }

    /**
     * युजरचे एकूण बॅलन्स कॅल्क्युलेट करण्यासाठी (ऐच्छिक).
     */
    public double calculateTotalBalance(String username) {
        List<Transaction> transactions = transactionRepository.findByUser_Username(username);
        double balance = 0;
        for (Transaction t : transactions) {
            if ("Income".equalsIgnoreCase(t.getType())) {
                balance += t.getAmount();
            } else {
                balance -= t.getAmount();
            }
        }
        return balance;
    }
}