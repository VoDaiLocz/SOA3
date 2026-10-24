package com.soa.lab3;

import com.soa.lab3.entity.Product;
import com.soa.lab3.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SoaLab3Application {

    public static void main(String[] args) {
        SpringApplication.run(SoaLab3Application.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                productRepository.save(new Product("Laptop Dell", "Dell XPS 13 Core i7", 1200.0, 10));
                productRepository.save(new Product("Chuột Logitech", "Logitech MX Master 3", 99.0, 50));
            }
        };
    }
}
