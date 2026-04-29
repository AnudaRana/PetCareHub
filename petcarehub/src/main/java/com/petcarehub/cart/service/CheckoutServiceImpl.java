package com.petcarehub.cart.service;

import com.petcarehub.cart.dto.CheckoutContextDto;
import com.petcarehub.cart.dto.CreateOrderRequest;
import com.petcarehub.cart.dto.OrderItemSummaryDto;
import com.petcarehub.cart.dto.OrderSummaryDto;
import com.petcarehub.cart.dto.PendingOrderDto;
import com.petcarehub.cart.dto.PetOptionDto;
import com.petcarehub.cart.entity.Cart;
import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.entity.OrderItem;
import com.petcarehub.cart.enums.OrderStatus;
import com.petcarehub.cart.enums.PaymentMethod;
import com.petcarehub.cart.enums.PaymentStatus;
import com.petcarehub.cart.repository.CartRepository;
import com.petcarehub.cart.repository.OrderRepository;
import com.petcarehub.cart.repository.OrderCancellationRepository;
import com.petcarehub.cart.entity.OrderCancellation;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.repository.PetRepository;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@Transactional
public class CheckoutServiceImpl implements CheckoutService {
    private static final String BANK_NAME = "Nations Trust Bank";
    private static final String BANK_ACCOUNT_NAME = "N T WARNAKULA";
    private static final String BANK_ACCOUNT_NUMBER = "200060151902";
    private static final String BANK_BRANCH = "UNION PLACE";

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final OrderCancellationRepository orderCancellationRepository;
    private final ShippingPolicy shippingPolicy;

    public CheckoutServiceImpl(UserRepository userRepository,
                               PetRepository petRepository,
                               CartRepository cartRepository,
                               OrderRepository orderRepository,
                               OrderCancellationRepository orderCancellationRepository,
                               ShippingPolicy shippingPolicy) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.orderCancellationRepository = orderCancellationRepository;
        this.shippingPolicy = shippingPolicy;
    }

    @Override
    public CheckoutContextDto getCheckoutContext(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        CheckoutContextDto dto = new CheckoutContextDto();
        dto.userId = user.getUserId();
        dto.fullName = buildFullName(user);
        dto.email = user.getEmail();
        dto.contactNumber = user.getMobileNumber();
        dto.pets = petRepository.findByOwner_UserId(userId)
                .stream()
                .sorted(Comparator.comparing(pet -> pet.getName() == null ? "" : pet.getName().toLowerCase(Locale.ROOT)))
                .map(this::toPetOption)
                .toList();
        return dto;
    }

    @Override
    public OrderSummaryDto createOrderFromCart(Long userId, CreateOrderRequest request) {
        validateCreateOrderRequest(request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Pet pet = null;
        if (request.petId != null) {
            pet = petRepository.findByOwner_UserId(userId)
                    .stream()
                    .filter(ownerPet -> ownerPet.getPetId().equals(request.petId))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Selected pet does not belong to the logged-in owner"));
        }

        List<Cart> cartItems = cartRepository.findByUser_UserId(userId);
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Cart is empty. Add products before continuing.");
        }

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setPet(pet);
        order.setOwnerFullName(request.fullName.trim());
        order.setOwnerEmail(request.email.trim());
        order.setContactNumber(request.contactNumber.trim());
        order.setPickupDate(request.pickupDate);
        order.setAdditionalNotes(blankToNull(request.additionalNotes));
        order.setOrderStatus(OrderStatus.AWAITING_PAYMENT);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        BigDecimal subTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (Cart cartItem : cartItems) {
            com.petcarehub.product.entity.Product product = cartItem.getProduct();
            if (cartItem.getQuantity() > product.getAvailableStockQuantity()) {
                throw new ResponseStatusException(BAD_REQUEST, "Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());

            BigDecimal lineTotal = cartItem.getProduct().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            orderItem.setLineTotal(lineTotal);
            subTotal = subTotal.add(lineTotal);
            orderItems.add(orderItem);
        }

        BigDecimal pickupFee = shippingPolicy.calculate(subTotal);
        order.setSubTotal(subTotal);
        order.setPickupFee(pickupFee);
        order.setTotal(subTotal.add(pickupFee));

        CustomerOrder saved = orderRepository.save(order);
        saved.setOrderNumber(String.format("ORD-%06d", saved.getOrderId()));

        for (OrderItem item : orderItems) {
            saved.addItem(item);
        }

        CustomerOrder persisted = orderRepository.save(saved);
        cartRepository.deleteByUser_UserId(userId);
        return toOrderSummary(persisted);
    }

    @Override
    public List<PendingOrderDto> getPendingOrders(Long userId) {
        return orderRepository.findByUser_UserIdAndOrderStatusOrderByCreatedAtDesc(userId, OrderStatus.AWAITING_PAYMENT)
                .stream()
                .map(order -> {
                    PendingOrderDto dto = new PendingOrderDto();
                    dto.orderId = order.getOrderId();
                    dto.orderNumber = order.getOrderNumber();
                    dto.petName = order.getPet() != null ? order.getPet().getName() : null;
                    dto.pickupDate = order.getPickupDate();
                    dto.total = order.getTotal();
                    dto.orderStatus = order.getOrderStatus().name();
                    dto.paymentStatus = order.getPaymentStatus().name();
                    dto.createdAt = order.getCreatedAt();
                    return dto;
                })
                .toList();
    }

    @Override
    public OrderSummaryDto getOrder(Long userId, Long orderId) {
        CustomerOrder order = orderRepository.findByOrderIdAndUser_UserId(orderId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));
        return toOrderSummary(order);
    }

    @Override
    public OrderSummaryDto submitPayment(Long userId, Long orderId, String paymentMethodValue, MultipartFile receipt) {
        if (paymentMethodValue == null || paymentMethodValue.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Please select a payment method");
        }

        PaymentMethod paymentMethod;
        try {
            paymentMethod = PaymentMethod.valueOf(paymentMethodValue.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Unsupported payment method selected");
        }

        CustomerOrder order = orderRepository.findByOrderIdAndUser_UserId(orderId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        if (order.getOrderStatus() == OrderStatus.PLACED) {
            throw new ResponseStatusException(BAD_REQUEST, "This order has already been placed");
        }

        order.setPaymentMethod(paymentMethod);
        order.setUpdatedAt(LocalDateTime.now());

        if (paymentMethod == PaymentMethod.CARD) {
            order.setPaymentStatus(PaymentStatus.PENDING);
            order.setBankName(null);
            order.setBankAccountName(null);
            order.setBankAccountNumber(null);
            order.setBankBranch(null);
            order.setPaymentReceipt(null);
            order.setPaymentReceiptFileName(null);
            order.setPaymentReceiptContentType(null);
        }

        if (paymentMethod == PaymentMethod.CASH_ON_PICKUP) {
            order.setPaymentStatus(PaymentStatus.PAY_ON_PICKUP);
            order.setBankName(null);
            order.setBankAccountName(null);
            order.setBankAccountNumber(null);
            order.setBankBranch(null);
            order.setPaymentReceipt(null);
            order.setPaymentReceiptFileName(null);
            order.setPaymentReceiptContentType(null);
        }

        if (paymentMethod == PaymentMethod.BANK_DEPOSIT) {
            if (receipt == null || receipt.isEmpty()) {
                throw new ResponseStatusException(BAD_REQUEST, "Please upload the bank deposit receipt");
            }

            order.setBankName(BANK_NAME);
            order.setBankAccountName(BANK_ACCOUNT_NAME);
            order.setBankAccountNumber(BANK_ACCOUNT_NUMBER);
            order.setBankBranch(BANK_BRANCH);
            order.setPaymentStatus(PaymentStatus.RECEIPT_SUBMITTED);
            order.setPaymentReceiptFileName(receipt.getOriginalFilename());
            order.setPaymentReceiptContentType(receipt.getContentType());

            try {
                order.setPaymentReceipt(receipt.getBytes());
            } catch (IOException ex) {
                throw new ResponseStatusException(BAD_REQUEST, "Failed to read the uploaded receipt");
            }
        }

        if (paymentMethod != PaymentMethod.CARD) {
            // Validate available stock before reserving
            for (OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                if (item.getQuantity() > product.getAvailableStockQuantity()) {
                    throw new ResponseStatusException(BAD_REQUEST, "Insufficient stock for product: " + product.getName());
                }
            }

            // Temporarily reserve stock
            for (OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                product.setReservedStockQuantity(
                    (product.getReservedStockQuantity() != null ? product.getReservedStockQuantity() : 0) + item.getQuantity()
                );
            }

            order.setOrderStatus(OrderStatus.PLACED);
            order.setPlacedAt(LocalDateTime.now());
        }
        CustomerOrder saved = orderRepository.save(order);
        return toOrderSummary(saved);
    }

    @Override
    public void cancelOrder(Long userId, Long orderId) {
        CustomerOrder order = orderRepository.findByOrderIdAndUser_UserId(orderId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(BAD_REQUEST, "Order is already cancelled.");
        }

        // Restore deducted stock or release reserved stock
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            for (OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            }
        } else if (order.getPaymentMethod() != PaymentMethod.CARD && order.getOrderStatus() == OrderStatus.PLACED) {
            for (OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                int currentReserved = product.getReservedStockQuantity() != null ? product.getReservedStockQuantity() : 0;
                product.setReservedStockQuantity(Math.max(0, currentReserved - item.getQuantity()));
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        OrderCancellation cancellation = new OrderCancellation();
        cancellation.setOrder(order);
        cancellation.setReason("Cancelled by user");
        cancellation.setCancelledBy(order.getOwnerEmail() != null ? order.getOwnerEmail() : "Owner");
        orderCancellationRepository.save(cancellation);
    }

    private void validateCreateOrderRequest(CreateOrderRequest request) {
        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Order details are required");
        }
        if (request.fullName == null || request.fullName.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Full name is required");
        }
        if (request.email == null || request.email.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Email is required");
        }
        if (request.contactNumber == null || request.contactNumber.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Contact number is required");
        }
        // Pet is now optional according to DB schema
        // if (request.petId == null) {
        //    throw new ResponseStatusException(BAD_REQUEST, "Please select a pet");
        // }
        if (request.pickupDate == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Pickup date is required");
        }
    }

    private PetOptionDto toPetOption(Pet pet) {
        PetOptionDto dto = new PetOptionDto();
        dto.petId = pet.getPetId();
        dto.name = pet.getName();
        dto.species = pet.getSpecies();
        dto.breed = pet.getBreed();
        dto.displayName = pet.getBreed() == null || pet.getBreed().isBlank()
                ? String.format("%s (%s)", pet.getName(), pet.getSpecies())
                : String.format("%s (%s - %s)", pet.getName(), pet.getSpecies(), pet.getBreed());
        return dto;
    }

    private OrderSummaryDto toOrderSummary(CustomerOrder order) {
        OrderSummaryDto dto = new OrderSummaryDto();
        dto.orderId = order.getOrderId();
        dto.orderNumber = order.getOrderNumber();
        dto.ownerFullName = order.getOwnerFullName();
        dto.ownerEmail = order.getOwnerEmail();
        dto.contactNumber = order.getContactNumber();
        if (order.getPet() != null) {
            dto.petId = order.getPet().getPetId();
            dto.petName = order.getPet().getName();
            dto.petSpecies = order.getPet().getSpecies();
        }
        dto.pickupDate = order.getPickupDate();
        dto.additionalNotes = order.getAdditionalNotes();
        dto.subTotal = order.getSubTotal();
        dto.pickupFee = order.getPickupFee();
        dto.total = order.getTotal();
        dto.orderStatus = order.getOrderStatus().name();
        dto.paymentStatus = order.getPaymentStatus().name();
        dto.paymentMethod = order.getPaymentMethod() == null ? null : order.getPaymentMethod().name();
        dto.bankName = order.getBankName();
        dto.bankAccountName = order.getBankAccountName();
        dto.bankAccountNumber = order.getBankAccountNumber();
        dto.bankBranch = order.getBankBranch();
        dto.hasReceipt = order.getPaymentReceipt() != null && order.getPaymentReceipt().length > 0;
        dto.paymentPending = order.getOrderStatus() == OrderStatus.AWAITING_PAYMENT;
        dto.createdAt = order.getCreatedAt();
        dto.placedAt = order.getPlacedAt();
        dto.items = order.getItems().stream().map(item -> {
            OrderItemSummaryDto itemDto = new OrderItemSummaryDto();
            itemDto.productId = item.getProduct().getProductId();
            itemDto.productName = item.getProductName();
            itemDto.unitPrice = item.getProductPrice();
            itemDto.quantity = item.getQuantity();
            itemDto.lineTotal = item.getLineTotal();
            itemDto.imageUrl = item.getProduct().getImageUrl();
            return itemDto;
        }).toList();
        return dto;
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String lastName = user.getLastName() == null ? "" : user.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isBlank() ? user.getEmail() : fullName;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
