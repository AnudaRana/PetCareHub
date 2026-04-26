package com.petcarehub.order.service;

import com.petcarehub.order.dto.OrderDTO;
import java.util.List;

public interface OrderService {
    List<OrderDTO> getOrdersByOwnerId(Long ownerId);
    List<OrderDTO> getAllOrders();
    List<OrderDTO> getPendingOrders();
    OrderDTO getOrderById(Long orderId);
    OrderDTO updateOrderStatus(Long orderId, String status);
    OrderDTO cancelOrder(Long orderId);
    
    // Test endpoint utility
    void generateDummyOrders();

    boolean hasPurchasedProduct(Long userId, Long productId);
}
