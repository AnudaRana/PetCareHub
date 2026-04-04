package com.petcarehub.petcarehub.service;

import com.petcarehub.petcarehub.dto.*;
import com.petcarehub.petcarehub.entity.Cart;
import com.petcarehub.petcarehub.entity.OrderItem;
import com.petcarehub.petcarehub.entity.Pet;
import com.petcarehub.petcarehub.entity.Product;
import com.petcarehub.petcarehub.entity.ProductOrder;
import com.petcarehub.petcarehub.entity.User;
import com.petcarehub.petcarehub.enums.OrderStatus;
import com.petcarehub.petcarehub.enums.PaymentStatus;
import com.petcarehub.petcarehub.repository.CartRepository;
import com.petcarehub.petcarehub.repository.OrderItemRepository;
import com.petcarehub.petcarehub.repository.PetRepository;
import com.petcarehub.petcarehub.repository.ProductOrderRepository;
import com.petcarehub.petcarehub.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final String DEFAULT_PICKUP_LOCATION = "Main clinic pickup counter";
    private static final DateTimeFormatter ORDER_NUMBER_DATE = DateTimeFormatter.BASIC_ISO_DATE;

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final CartRepository cartRepository;
    private final ProductOrderRepository productOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ShippingPolicy shippingPolicy;

    public OrderServiceImpl(UserRepository userRepository,
                            PetRepository petRepository,
                            CartRepository cartRepository,
                            ProductOrderRepository productOrderRepository,
                            OrderItemRepository orderItemRepository,
                            ShippingPolicy shippingPolicy) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.cartRepository = cartRepository;
        this.productOrderRepository = productOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.shippingPolicy = shippingPolicy;
    }

    @Override
    @Transactional(readOnly = true)
    public CheckoutContextDto getCheckoutContext(Long userId) {
        User owner = getUser(userId);

        CheckoutContextDto dto = new CheckoutContextDto();
        dto.fullName = buildFullName(owner);
        dto.email = owner.getEmail();
        dto.contactNumber = owner.getMobileNumber();
        dto.pickupLocation = DEFAULT_PICKUP_LOCATION;
        dto.pets = petRepository.findByOwner_UserIdOrderByNameAsc(userId)
                .stream()
                .map(this::toPetOptionDto)
                .toList();
        return dto;
    }

    @Override
    public OrderDetailsDto createOrderFromCart(Long userId, CreateOrderRequest request) {
        User owner = getUser(userId);
        Pet pet = petRepository.findByPetIdAndOwner_UserId(request.getPetId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Selected pet does not belong to the logged-in owner"));

        List<Cart> cartRows = cartRepository.findByUser_UserId(userId);
        if (cartRows.isEmpty()) {
            throw new IllegalStateException("Your cart is empty. Add products before continuing to payment.");
        }

        Map<Long, OrderItemDraft> itemDraftMap = buildOrderItemDrafts(cartRows);
        List<OrderItemDraft> itemDrafts = new ArrayList<>(itemDraftMap.values());

        BigDecimal subTotal = itemDrafts.stream()
                .map(OrderItemDraft::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pickupFee = shippingPolicy.calculate(subTotal);
        BigDecimal totalAmount = subTotal.add(pickupFee);
        int totalQuantity = itemDrafts.stream().mapToInt(OrderItemDraft::quantity).sum();

        ProductOrder order = new ProductOrder();
        order.setOwner(owner);
        order.setPet(pet);
        order.setContactName(request.getFullName().trim());
        order.setContactEmail(request.getEmail().trim());
        order.setContactNumber(request.getContactNumber().trim());
        order.setPickupDate(request.getPickupDate());
        order.setPickupTime(request.getPickupTime());
        order.setPickupLocation(resolvePickupLocation(request.getPickupLocation()));
        order.setNotes(trimToNull(request.getNotes()));
        order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setItemCount(totalQuantity);
        order.setSubTotal(subTotal);
        order.setPickupFee(pickupFee);
        order.setTotalAmount(totalAmount);
        order.setOrderNumber("TMP-" + UUID.randomUUID());

        ProductOrder savedOrder = productOrderRepository.save(order);
        savedOrder.setOrderNumber(generateOrderNumber(savedOrder));
        ProductOrder finalizedOrder = productOrderRepository.save(savedOrder);

        List<OrderItem> orderItems = itemDrafts.stream()
                .map(draft -> toOrderItem(finalizedOrder, draft))
                .toList();
        orderItemRepository.saveAll(orderItems);

        cartRepository.deleteByUser_UserId(userId);

        return mapOrder(finalizedOrder, orderItems);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDetailsDto> getPendingOrders(Long userId) {
        getUser(userId);
        return productOrderRepository.findByOwner_UserIdAndPaymentStatusOrderByCreatedAtDesc(userId, PaymentStatus.PENDING)
                .stream()
                .map(order -> mapOrder(order, orderItemRepository.findByOrder_OrderId(order.getOrderId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailsDto getOrderForUser(Long userId, Long orderId) {
        ProductOrder order = productOrderRepository.findByOrderIdAndOwner_UserId(orderId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        List<OrderItem> orderItems = orderItemRepository.findByOrder_OrderId(orderId);
        return mapOrder(order, orderItems);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }

    private PetOptionDto toPetOptionDto(Pet pet) {
        PetOptionDto dto = new PetOptionDto();
        dto.petId = pet.getPetId();
        dto.name = pet.getName();
        dto.species = pet.getSpecies();
        dto.breed = pet.getBreed();
        dto.displayName = pet.getBreed() == null || pet.getBreed().isBlank()
                ? "%s (%s)".formatted(pet.getName(), pet.getSpecies())
                : "%s (%s • %s)".formatted(pet.getName(), pet.getSpecies(), pet.getBreed());
        return dto;
    }

    private Map<Long, OrderItemDraft> buildOrderItemDrafts(List<Cart> cartRows) {
        Map<Long, OrderItemDraft> itemDraftMap = new LinkedHashMap<>();
        for (Cart cartRow : cartRows) {
            Product product = cartRow.getProduct();
            itemDraftMap.compute(product.getProductId(), (productId, existing) -> {
                if (existing == null) {
                    return new OrderItemDraft(
                            product.getProductId(),
                            product.getName(),
                            product.getPrice(),
                            cartRow.getQuantity()
                    );
                }
                return existing.withAdditionalQuantity(cartRow.getQuantity());
            });
        }
        return itemDraftMap;
    }

    private OrderItem toOrderItem(ProductOrder order, OrderItemDraft draft) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProductId(draft.productId());
        orderItem.setProductName(draft.productName());
        orderItem.setUnitPrice(draft.unitPrice());
        orderItem.setQuantity(draft.quantity());
        orderItem.setLineTotal(draft.lineTotal());
        return orderItem;
    }

    private OrderDetailsDto mapOrder(ProductOrder order, List<OrderItem> orderItems) {
        OrderDetailsDto dto = new OrderDetailsDto();
        dto.orderId = order.getOrderId();
        dto.orderNumber = order.getOrderNumber();
        dto.contactName = order.getContactName();
        dto.contactEmail = order.getContactEmail();
        dto.contactNumber = order.getContactNumber();
        dto.petId = order.getPet().getPetId();
        dto.petName = order.getPet().getName();
        dto.petSpecies = order.getPet().getSpecies();
        dto.pickupDate = order.getPickupDate();
        dto.pickupTime = order.getPickupTime();
        dto.pickupLocation = order.getPickupLocation();
        dto.notes = order.getNotes();
        dto.orderStatus = order.getOrderStatus().name();
        dto.paymentStatus = order.getPaymentStatus().name();
        dto.itemCount = order.getItemCount();
        dto.subTotal = order.getSubTotal();
        dto.pickupFee = order.getPickupFee();
        dto.totalAmount = order.getTotalAmount();
        dto.createdAt = order.getCreatedAt();
        dto.updatedAt = order.getUpdatedAt();
        dto.items = orderItems.stream().map(this::mapOrderItem).toList();
        return dto;
    }

    private OrderItemSummaryDto mapOrderItem(OrderItem orderItem) {
        OrderItemSummaryDto dto = new OrderItemSummaryDto();
        dto.productId = orderItem.getProductId();
        dto.productName = orderItem.getProductName();
        dto.unitPrice = orderItem.getUnitPrice();
        dto.quantity = orderItem.getQuantity();
        dto.lineTotal = orderItem.getLineTotal();
        return dto;
    }

    private String buildFullName(User owner) {
        String fullName = ((owner.getFirstName() == null ? "" : owner.getFirstName()) + " "
                + (owner.getLastName() == null ? "" : owner.getLastName())).trim();
        return fullName.isBlank() ? owner.getEmail() : fullName;
    }

    private String resolvePickupLocation(String requestedPickupLocation) {
        return requestedPickupLocation == null || requestedPickupLocation.isBlank()
                ? DEFAULT_PICKUP_LOCATION
                : requestedPickupLocation.trim();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String generateOrderNumber(ProductOrder order) {
        return "ORD-%s-%05d".formatted(order.getCreatedAt().format(ORDER_NUMBER_DATE), order.getOrderId());
    }

    private record OrderItemDraft(Long productId, String productName, BigDecimal unitPrice, Integer quantity) {
        private OrderItemDraft withAdditionalQuantity(Integer additionalQuantity) {
            return new OrderItemDraft(productId, productName, unitPrice, quantity + additionalQuantity);
        }

        private BigDecimal lineTotal() {
            return unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}
