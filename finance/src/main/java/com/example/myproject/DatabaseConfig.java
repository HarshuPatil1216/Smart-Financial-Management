package com.example.myproject;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {
    // तुझा दिलेला नवीन Render PostgreSQL URL
    private static final String URL = "jdbc:postgresql://dpg-d7mr2b8g4nts73aqb1t0-a.singapore-postgres.render.com/smart_finance_db_uetf";
    private static final String USER = "harsh_admin";
    private static final String PASS = "l6H27W4RudfAI9JJhuthzwIhViqSkNlG";

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        // SSL मोड ऑन ठेवणे Render साठी गरजेचे असते
        return DriverManager.getConnection(URL + "?sslmode=require", USER, PASS);
    }
}