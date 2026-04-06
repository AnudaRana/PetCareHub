package com.petcarehub.cart.service;

import com.petcarehub.cart.dto.CheckoutContextDto;
import com.petcarehub.cart.dto.CreateOrderRequest;
import com.petcarehub.cart.dto.OrderSummaryDto;
import com.petcarehub.cart.dto.PendingOrderDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CheckoutService {
    CheckoutContextDto getCheckoutContext(Long userId);
    OrderSummaryDto createOrderFromCart(Long userId, CreateOrderRequest request);
    List<PendingOrderDto> getPendingOrders(Long userId);
    OrderSummaryDto getOrder(Long userId, Long orderId);
    OrderSummaryDto submitPayment(Long userId, Long orderId, String paymentMethod, MultipartFile receipt);
    void cancelOrder(Long userId, Long orderId);
}
