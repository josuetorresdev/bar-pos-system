package com.example.demo.controller;

import com.example.demo.dto.AddOrderItemRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/open")
    public ResponseEntity<OrderResponse> openTableOrder(
            @RequestParam Long tableId,
            @RequestParam(defaultValue = "2") Long userId) { // Por defecto userId=2 (Carlos Mesero del Seeder)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(orderService.openTableOrder(tableId, userId));
    }

    @GetMapping("/table/{tableId}")
    public ResponseEntity<OrderResponse> getOpenOrderByTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(orderService.getOpenOrderByTable(tableId));
    }

    @PostMapping("/{orderId}/items")
    public ResponseEntity<OrderResponse> addItem(
            @PathVariable Long orderId,
            @Valid @RequestBody AddOrderItemRequest request) {
        return ResponseEntity.ok(orderService.addItemToOrder(orderId, request));
    }

    @PostMapping("/{orderId}/pay")
    public ResponseEntity<OrderResponse> closeAndPay(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.closeAndPayOrder(orderId));
    }
}
