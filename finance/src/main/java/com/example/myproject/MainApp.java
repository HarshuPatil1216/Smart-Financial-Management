package com.example.myproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MainApp {
    public static void main(String[] args) {
        // येथे 'MainApplication.class' ऐवजी 'MainApp.class' असायला हवे
        SpringApplication.run(MainApp.class, args);

        System.out.println("--------------------------------------");
        System.out.println("FinTrace Backend Started Successfully!");
        System.out.println("--------------------------------------");
    }
}