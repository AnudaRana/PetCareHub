package com.petcarehub.petcarehub.service;

import com.petcarehub.petcarehub.dto.CheckoutContextDto;
import com.petcarehub.petcarehub.dto.CreateOrderRequest;
import com.petcarehub.petcarehub.dto.OrderDetailsDto;

import java.util.List;

public interface OrderService {
    CheckoutContextDto getCheckoutContext(Long userId);
    OrderDetailsDto createOrderFromCart(Long userId, CreateOrderRequest request);
    List<OrderDetailsDto> getPendingOrders(Long userId);
    OrderDetailsDto getOrderForUser(Long userId, Long orderId);
}
