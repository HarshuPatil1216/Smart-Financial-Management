package com.example.myproject;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {
    // Change 'finance_db' to your actual database name in pgAdmin
    private static final String URL = "jdbc:postgresql://localhost:5432/finance";
    private static final String USER = "postgres";
    private static final String PASS = "1216";

    public static Connection getConnection() throws SQLException {
        try {
            // Loading the Driver (Required for some older versions of Java/PostgreSQL)
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return DriverManager.getConnection(URL, USER, PASS);
    }
}