package com.example.demo.dto;

import com.example.demo.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Long id,
    Long tableId,
    String tableName,
    String waiterName,
    OrderStatus status,
    BigDecimal total,
    LocalDateTime createdAt,
    LocalDateTime closedAt,
    List<OrderItemResponse> items
) {}
