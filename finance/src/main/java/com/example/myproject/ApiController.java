package com.example.myproject.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    // हे ॲड केल्यामुळे ४०४ एरर जाणार आणि "Backend is Live" मेसेज दिसेल
    @GetMapping("/")
    public String healthCheck() {
        return "FinTrace Backend is running successfully!";
    }
}