package com.example.demo.config;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final DiningTableRepository diningTableRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.saveAll(List.of(
                User.builder().name("Admin Bar").username("admin").password("admin123").role(Role.ADMIN).build(),
                User.builder().name("Carlos Mesero").username("mesero1").password("1234").role(Role.WAITER).build(),
                User.builder().name("Ana Caja").username("caja1").password("1234").role(Role.CASHIER).build()
            ));
        }

        if (categoryRepository.count() == 0) {
            Category cervezas = categoryRepository.save(Category.builder().name("Cervezas").active(true).build());
            Category cocteles = categoryRepository.save(Category.builder().name("Coctelería").active(true).build());
            Category snacks = categoryRepository.save(Category.builder().name("Snacks y Alitas").active(true).build());

            productRepository.saveAll(List.of(
                Product.builder().category(cervezas).name("Cerveza Artesanal IPA").price(new BigDecimal("85.00")).stock(50).active(true).build(),
                Product.builder().category(cervezas).name("Cerveza Clara 355ml").price(new BigDecimal("45.00")).stock(100).active(true).build(),
                Product.builder().category(cocteles).name("Mezcalita de Tamarindo").price(new BigDecimal("110.00")).stock(30).active(true).build(),
                Product.builder().category(cocteles).name("Mojito Clásico").price(new BigDecimal("95.00")).stock(40).active(true).build(),
                Product.builder().category(snacks).name("Orden de Alitas BBQ (10 pzas)").price(new BigDecimal("145.00")).stock(25).active(true).build(),
                Product.builder().category(snacks).name("Papas Gajo con Queso").price(new BigDecimal("80.00")).stock(35).active(true).build()
            ));
        }

        if (diningTableRepository.count() == 0) {
            diningTableRepository.saveAll(List.of(
                DiningTable.builder().number(1).name("Mesa 1").status(TableStatus.AVAILABLE).build(),
                DiningTable.builder().number(2).name("Mesa 2").status(TableStatus.AVAILABLE).build(),
                DiningTable.builder().number(3).name("Mesa 3").status(TableStatus.AVAILABLE).build(),
                DiningTable.builder().number(4).name("Barra 1").status(TableStatus.AVAILABLE).build(),
                DiningTable.builder().number(5).name("Terraza 1").status(TableStatus.AVAILABLE).build()
            ));
        }
    }
}
