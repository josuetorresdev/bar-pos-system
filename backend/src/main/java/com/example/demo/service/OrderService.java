package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final DiningTableRepository tableRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse openTableOrder(Long tableId, Long userId) {
        DiningTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));

        if (table.getStatus() == TableStatus.OCCUPIED) {
            throw new RuntimeException("La mesa ya tiene una cuenta abierta");
        }

        User waiter = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        table.setStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);

        Order order = Order.builder()
            .diningTable(table)
            .user(waiter)
            .status(OrderStatus.OPEN)
            .total(BigDecimal.ZERO)
            .build();

        return mapToResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOpenOrderByTable(Long tableId) {
        Order order = orderRepository.findByDiningTableIdAndStatus(tableId, OrderStatus.OPEN)
            .orElseThrow(() -> new RuntimeException("No hay cuenta abierta para esta mesa"));
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse addItemToOrder(Long orderId, AddOrderItemRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new RuntimeException("No se pueden agregar productos a una orden cerrada");
        }

        Product product = productRepository.findById(request.productId())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!product.getActive() || product.getStock() < request.quantity()) {
            throw new RuntimeException("Stock insuficiente para: " + product.getName());
        }

        // Descontar inventario
        product.setStock(product.getStock() - request.quantity());
        productRepository.save(product);

        // Calcular subtotal
        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(request.quantity()));

        OrderItem item = OrderItem.builder()
            .order(order)
            .product(product)
            .quantity(request.quantity())
            .unitPrice(product.getPrice())
            .subtotal(subtotal)
            .notes(request.notes())
            .build();

        order.getItems().add(item);
        recalculateTotal(order);

        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse closeAndPayOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new RuntimeException("La orden ya fue cerrada o cancelada");
        }

        order.setStatus(OrderStatus.PAID);
        order.setClosedAt(LocalDateTime.now());

        DiningTable table = order.getDiningTable();
        table.setStatus(TableStatus.AVAILABLE);
        tableRepository.save(table);

        return mapToResponse(orderRepository.save(order));
    }

    private void recalculateTotal(Order order) {
        BigDecimal total = order.getItems().stream()
            .map(OrderItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotal(total);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
            .map(item -> new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal(),
                item.getNotes()
            ))
            .toList();

        return new OrderResponse(
            order.getId(),
            order.getDiningTable().getId(),
            order.getDiningTable().getName(),
            order.getUser().getName(),
            order.getStatus(),
            order.getTotal(),
            order.getCreatedAt(),
            order.getClosedAt(),
            itemResponses
        );
    }
}
