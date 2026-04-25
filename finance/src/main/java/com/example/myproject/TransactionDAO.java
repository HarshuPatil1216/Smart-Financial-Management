package com.example.myproject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class TransactionDAO {

    @Autowired
    private TransactionRepository repository;

    /**
     * युजरनेमच्या आधारे सर्व ट्रान्झॅक्शन मिळवणे.
     * येथे आपण 'findByUser_Username' ही रिपॉझिटरीमधील नवीन मेथड वापरली आहे.
     */
    public List<Transaction> getTransactionsByUsername(String username) {
        // जुने नाव 'findByUserUsername' बदलून 'findByUser_Username' केले आहे
        return repository.findByUser_Username(username);
    }

    /**
     * नवीन ट्रान्झॅक्शन डेटाबेसमध्ये सेव्ह करणे.
     */
    public void saveTransaction(Transaction transaction) {
        repository.save(transaction);
    }
}