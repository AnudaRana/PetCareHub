package com.petcarehub.cart.service;

import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.entity.OrderCancellation;
import com.petcarehub.cart.enums.OrderStatus;
import com.petcarehub.cart.enums.PaymentStatus;
import com.petcarehub.cart.repository.OrderRepository;
import com.petcarehub.cart.repository.OrderCancellationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderManagementService {

    private final OrderRepository orderRepository;
    private final OrderCancellationRepository cancellationRepository;
    private final OrderEmailService orderEmailService;

    public List<CustomerOrder> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<CustomerOrder> getOrdersByUser(Long userId) {
        return orderRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }

    public CustomerOrder getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
    }

    public OrderCancellation getOrderCancellation(Long orderId) {
        return cancellationRepository.findByOrder_OrderId(orderId).orElse(null);
    }

    @Transactional
    public CustomerOrder cancelOrder(Long orderId, String reason, String roles, Long requestingUserId) {
        CustomerOrder order = getOrderById(orderId);
        
        boolean isStaffOrAdmin = roles != null && (roles.contains("ROLE_ADMIN") || roles.contains("ROLE_STAFF"));
        
        if (!isStaffOrAdmin && requestingUserId != null && !order.getUser().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Unauthorized to cancel this order.");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled.");
        }

        // Restore deducted stock or release reserved stock
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            for (com.petcarehub.cart.entity.OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            }
        } else if (order.getPaymentMethod() != com.petcarehub.cart.enums.PaymentMethod.CARD && order.getOrderStatus() == OrderStatus.PLACED) {
            for (com.petcarehub.cart.entity.OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                int currentReserved = product.getReservedStockQuantity() != null ? product.getReservedStockQuantity() : 0;
                product.setReservedStockQuantity(Math.max(0, currentReserved - item.getQuantity()));
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        OrderCancellation cancellation = new OrderCancellation();
        cancellation.setOrder(order);
        cancellation.setReason(reason);
        cancellation.setCancelledBy(isStaffOrAdmin ? "Staff/Admin" : "Customer");
        
        cancellationRepository.save(cancellation);

        // Send email
        orderEmailService.sendOrderCancellationEmail(order, cancellation);

        return order;
    }

    @Transactional
    public CustomerOrder updateOrderStatus(Long orderId, OrderStatus newStatus) {
        CustomerOrder order = getOrderById(orderId);

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot change status of a cancelled order.");
        }

        order.setOrderStatus(newStatus);
        return orderRepository.save(order);
    }

    @Transactional
    public CustomerOrder verifyPayment(Long orderId) {
        CustomerOrder order = getOrderById(orderId);
        
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return order;
        }

        // Finalize stock deduction for non-card methods
        if (order.getPaymentMethod() != com.petcarehub.cart.enums.PaymentMethod.CARD) {
            for (com.petcarehub.cart.entity.OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                int reserved = product.getReservedStockQuantity() != null ? product.getReservedStockQuantity() : 0;
                int toDeduct = item.getQuantity();
                
                product.setReservedStockQuantity(Math.max(0, reserved - toDeduct));
                product.setStockQuantity(Math.max(0, product.getStockQuantity() - toDeduct));
            }
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        return orderRepository.save(order);
    }

    public byte[] getPaymentReceipt(Long orderId) {
        CustomerOrder order = getOrderById(orderId);
        if (order.getPaymentReceipt() == null) {
            throw new RuntimeException("No receipt found for order ID: " + orderId);
        }
        return order.getPaymentReceipt();
    }
}
