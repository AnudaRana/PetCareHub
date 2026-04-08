package com.petcarehub.invoice.service.impl;

import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.entity.OrderItem;
import com.petcarehub.cart.enums.OrderStatus;
import com.petcarehub.cart.repository.OrderRepository;
import com.petcarehub.invoice.dto.CreateInvoiceRequest;
import com.petcarehub.invoice.dto.InvoiceResponse;
import com.petcarehub.invoice.entity.Invoice;
import com.petcarehub.invoice.entity.InvoiceItem;
import com.petcarehub.invoice.entity.InvoicePaymentStatus;
import com.petcarehub.invoice.exception.InvoiceAlreadyExistsException;
import com.petcarehub.invoice.exception.InvoiceGenerationException;
import com.petcarehub.invoice.exception.OrderNotBillableException;
import com.petcarehub.invoice.mapper.InvoiceMapper;
import com.petcarehub.invoice.repository.InvoiceRepository;
import com.petcarehub.invoice.service.InvoiceCalculator;
import com.petcarehub.invoice.service.InvoiceNumberGenerator;
import com.petcarehub.invoice.service.InvoiceService;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceServiceImpl implements InvoiceService {
    
    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final InvoiceCalculator invoiceCalculator;
    private final InvoiceNumberGenerator invoiceNumberGenerator;
    
    public InvoiceServiceImpl(InvoiceRepository invoiceRepository,
                              OrderRepository orderRepository,
                              UserRepository userRepository,
                              InvoiceCalculator invoiceCalculator,
                              InvoiceNumberGenerator invoiceNumberGenerator) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.invoiceCalculator = invoiceCalculator;
        this.invoiceNumberGenerator = invoiceNumberGenerator;
    }
    
    @Override
    @Transactional
    public InvoiceResponse generateInvoiceForOrder(Long orderId, Long staffUserId, CreateInvoiceRequest request) {
        // 1. Load order with order items
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));
        
        // 2. Validate order is in PLACED status
        if (order.getOrderStatus() != OrderStatus.PLACED) {
            throw new OrderNotBillableException("Order is not in PLACED status. Current status: " + order.getOrderStatus());
        }
        
        // 3. Validate invoice does not already exist
        if (invoiceRepository.existsByOrder_OrderId(orderId)) {
            throw new InvoiceAlreadyExistsException("Invoice already exists for order: " + order.getOrderNumber());
        }
        
        // 4. Validate order has items
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new OrderNotBillableException("Order has no items to invoice");
        }
        
        // 5. Validate payment method exists
        if (order.getPaymentMethod() == null) {
            throw new OrderNotBillableException("Order does not have a payment method");
        }
        
        // 6. Load staff user
        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new EntityNotFoundException("Staff user not found: " + staffUserId));
        
        // 7. Calculate totals from order items
        BigDecimal itemsTotal = order.getItems().stream()
                .map(OrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal subtotal = invoiceCalculator.calculateSubtotal(itemsTotal, order.getPickupFee());
        BigDecimal tax = invoiceCalculator.calculateTax(subtotal);
        BigDecimal discount = invoiceCalculator.calculateDiscount(subtotal);
        BigDecimal total = invoiceCalculator.calculateTotal(subtotal, tax, discount);
        
        // 8. Generate invoice number
        String invoiceNumber = invoiceNumberGenerator.generate();
        
        // 9. Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setOrder(order);
        invoice.setOwner(order.getUser());
        invoice.setPet(order.getPet());
        invoice.setGeneratedByStaff(staff);
        invoice.setPaymentMethod(order.getPaymentMethod().name());
        invoice.setPaymentStatus(InvoicePaymentStatus.PENDING);
        invoice.setPaymentReference(request != null ? request.paymentReference : null);
        invoice.setSubtotalAmount(subtotal);
        invoice.setDiscountAmount(discount);
        invoice.setTaxAmount(tax);
        invoice.setTotalAmount(total);
        invoice.setNotes(request != null ? request.notes : null);
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setUpdatedAt(LocalDateTime.now());
        
        // 10. Copy order items into invoice items (snapshot)
        for (OrderItem orderItem : order.getItems()) {
            InvoiceItem invoiceItem = new InvoiceItem();
            invoiceItem.setProductId(orderItem.getProduct().getProductId());
            invoiceItem.setProductName(orderItem.getProductName());
            invoiceItem.setUnitPrice(orderItem.getProductPrice());
            invoiceItem.setQuantity(orderItem.getQuantity());
            invoiceItem.setLineTotal(orderItem.getLineTotal());
            invoice.addItem(invoiceItem);
        }
        
        // 11. Save invoice + invoice items
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        // 12. Return response
        return InvoiceMapper.toResponse(savedInvoice);
    }
    
    @Override
    public InvoiceResponse getInvoiceById(Long invoiceId) {
        Invoice invoice = invoiceRepository.findByInvoiceIdWithItems(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + invoiceId));
        return InvoiceMapper.toResponse(invoice);
    }
    
    @Override
    public List<InvoiceResponse> getAllInvoices() {
        List<Invoice> invoices = invoiceRepository.findAllWithItems();
        return invoices.stream()
                .map(InvoiceMapper::toResponse)
                .collect(Collectors.toList());
    }
}
