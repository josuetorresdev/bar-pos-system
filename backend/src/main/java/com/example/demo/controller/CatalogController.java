package com.example.demo.controller;

import com.example.demo.model.Category;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public record ProductSummary(Long id, Long categoryId, String categoryName, String name, BigDecimal price, Integer stock) {}

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getActiveCategories() {
        return ResponseEntity.ok(categoryRepository.findByActiveTrue());
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductSummary>> getActiveProducts(@RequestParam(required = false) Long categoryId) {
        var products = (categoryId != null)
            ? productRepository.findByCategoryIdAndActiveTrue(categoryId)
            : productRepository.findByActiveTrue();

        var response = products.stream()
            .map(p -> new ProductSummary(
                p.getId(),
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getName(),
                p.getPrice(),
                p.getStock()
            ))
            .toList();

        return ResponseEntity.ok(response);
    }
}
