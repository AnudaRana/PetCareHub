package com.petcarehub.order.service;

import com.petcarehub.order.dto.OrderDTO;
import com.petcarehub.order.dto.OrderItemDTO;
import com.petcarehub.order.entity.Order;
import com.petcarehub.order.entity.OrderItem;
import com.petcarehub.order.entity.OrderStatus;
import com.petcarehub.order.repository.ViewOrderItemRepository;
import com.petcarehub.order.repository.ViewOrderRepository;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.repository.PetRepository;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import com.petcarehub.product.entity.Product;
import com.petcarehub.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private ViewOrderRepository viewOrderRepository;

    @Autowired
    private ViewOrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByOwnerId(Long ownerId) {
        return viewOrderRepository.findByUser_UserIdOrderByCreatedAtDesc(ownerId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return viewOrderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getPendingOrders() {
        return viewOrderRepository.findByOrderStatusOrderByCreatedAtAsc(OrderStatus.PENDING)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = viewOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = viewOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setOrderStatus(newStatus);
            Order updatedOrder = viewOrderRepository.save(order);
            return mapToDTO(updatedOrder);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    @Override
    @Transactional
    public OrderDTO cancelOrder(Long orderId) {
        return updateOrderStatus(orderId, "CANCELLED");
    }

    @Override
    @Transactional
    public void generateDummyOrders() {
        List<User> users = userRepository.findAll();
        List<Pet> pets = petRepository.findAll();
        List<Product> products = productRepository.findAll();

        if (users.isEmpty() || pets.isEmpty() || products.isEmpty()) {
            throw new RuntimeException("Ensure database has at least one User, Pet, and Product to generate dummy orders.");
        }

        User dummyUser = users.get(0);
        Pet dummyPet = pets.get(0);

        for (int i = 1; i <= 3; i++) {
            Order order = Order.builder()
                    .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .user(dummyUser)
                    .pet(dummyPet)
                    .ownerFullName(dummyUser.getFirstName() + " " + dummyUser.getLastName())
                    .ownerEmail(dummyUser.getEmail())
                    .contactNumber(dummyUser.getMobileNumber() != null ? dummyUser.getMobileNumber() : "1234567890")
                    .pickupDate(LocalDate.now().plusDays(i))
                    .additionalNotes("Dummy order note " + i)
                    .pickupFee(BigDecimal.ZERO)
                    .orderStatus(i == 1 ? OrderStatus.PENDING : (i == 2 ? OrderStatus.READY : OrderStatus.COMPLETED))
                    .paymentStatus("PAID")
                    .paymentMethod("CREDIT_CARD")
                    .build();

            BigDecimal subTotal = BigDecimal.ZERO;

            for (int k = 0; k < Math.min(2, products.size()); k++) {
                Product product = products.get(k);
                int qty = i * (k + 1);
                BigDecimal price = product.getPrice();
                BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(qty));
                
                OrderItem item = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .productName(product.getName())
                        .productPrice(price)
                        .quantity(qty)
                        .lineTotal(lineTotal)
                        .build();
                
                order.getOrderItems().add(item);
                subTotal = subTotal.add(lineTotal);
            }

            order.setSubTotal(subTotal);
            order.setTotal(subTotal.add(order.getPickupFee()));

            viewOrderRepository.save(order);
        }
    }

    private OrderDTO mapToDTO(Order order) {
        return OrderDTO.builder()
                .orderId(order.getOrderId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getUserId() : null)
                .petId(order.getPet() != null ? order.getPet().getPetId() : null)
                .ownerFullName(order.getOwnerFullName())
                .ownerEmail(order.getOwnerEmail())
                .contactNumber(order.getContactNumber())
                .pickupDate(order.getPickupDate())
                .additionalNotes(order.getAdditionalNotes())
                .subTotal(order.getSubTotal())
                .pickupFee(order.getPickupFee())
                .total(order.getTotal())
                .orderStatus(order.getOrderStatus().name())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(order.getOrderItems().stream().map(item -> OrderItemDTO.builder()
                        .orderItemId(item.getOrderItemId())
                        .productId(item.getProduct() != null ? item.getProduct().getProductId() : null)
                        .productName(item.getProductName())
                        .productPrice(item.getProductPrice())
                        .quantity(item.getQuantity())
                        .lineTotal(item.getLineTotal())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    @Override
    public boolean hasPurchasedProduct(Long userId, Long productId) {
        return orderItemRepository.hasPurchasedProduct(userId, productId);
    }
}
