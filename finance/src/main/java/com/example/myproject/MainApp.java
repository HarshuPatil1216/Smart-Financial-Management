package com.example.myproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;
import java.util.Collections;

@SpringBootApplication
public class MainApp {

    public static void main(String[] args) {
        SpringApplication.run(MainApp.class, args);

        System.out.println("--------------------------------------");
        System.out.println("FinTrace Backend Started Successfully!");
        System.out.println("--------------------------------------");
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // १. 'setAllowedOrigins' ऐवजी 'setAllowedOriginPatterns' वापरा
        // यामुळे credentials true असतानाही कोणतीही Error येत नाही
        config.setAllowedOriginPatterns(Collections.singletonList("*"));

        // २. सर्व मेथड्सना परवानगी (GET, POST, इ.)
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // ३. सर्व हेडर्सना परवानगी
        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"));

        // ४. क्रेडेंशियल्सना (Cookies/Auth) परवानगी द्या
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}