package com.petcarehub.cart.service;

import com.petcarehub.cart.dto.CartItemDto;
import com.petcarehub.cart.dto.CartResponseDto;
import com.petcarehub.cart.entity.Cart;
import com.petcarehub.cart.repository.CartRepository;
import com.petcarehub.product.entity.Product;
import com.petcarehub.product.repository.ProductRepository;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ShippingPolicy shippingPolicy;

    public CartServiceImpl(CartRepository cartRepository,
                           UserRepository userRepository,
                           ProductRepository productRepository,
                           ShippingPolicy shippingPolicy) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.shippingPolicy = shippingPolicy;
    }

    @Override
    public CartResponseDto getCart(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found: " + userId);
        }

        List<Cart> rows = cartRepository.findByUser_UserId(userId);
        Map<Long, Integer> qtyMap = new LinkedHashMap<>();
        Map<Long, Product> productMap = new LinkedHashMap<>();

        for (Cart row : rows) {
            Long pid = row.getProduct().getProductId();
            qtyMap.put(pid, qtyMap.getOrDefault(pid, 0) + row.getQuantity());
            productMap.putIfAbsent(pid, row.getProduct());
        }

        List<CartItemDto> items = new ArrayList<>();
        for (Long pid : qtyMap.keySet()) {
            Product p = productMap.get(pid);
            CartItemDto dto = new CartItemDto();
            dto.productId = p.getProductId();
            dto.name = p.getName();
            dto.price = p.getPrice();
            dto.quantity = qtyMap.get(pid);
            dto.imageUrl = p.getImageUrl();
            items.add(dto);
        }

        BigDecimal subTotal = items.stream()
                .map(CartItemDto::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = shippingPolicy.calculate(subTotal);

        CartResponseDto res = new CartResponseDto();
        res.items = items;
        res.subTotal = subTotal;
        res.shipping = shipping;
        res.total = subTotal.add(shipping);
        return res;
    }

    @Override
    public CartResponseDto addItem(Long userId, Long productId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new ResponseStatusException(BAD_REQUEST, "Quantity must be at least 1");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + productId));

        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "This product is currently out of stock");
        }

        List<Cart> existing = cartRepository.findByUser_UserIdAndProduct_ProductId(userId, productId);
        if (!existing.isEmpty()) {
            Cart cartRow = existing.get(0);
            cartRow.setQuantity(cartRow.getQuantity() + quantity);
            cartRepository.save(cartRow);
            for (int i = 1; i < existing.size(); i++) {
                cartRepository.delete(existing.get(i));
            }
        } else {
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setProduct(product);
            cart.setQuantity(quantity);
            cartRepository.save(cart);
        }

        return getCart(userId);
    }

    @Override
    public CartResponseDto updateQuantity(Long userId, Long productId, Integer quantity) {
        List<Cart> existing = cartRepository.findByUser_UserIdAndProduct_ProductId(userId, productId);
        if (existing.isEmpty()) {
            throw new EntityNotFoundException("Cart item not found");
        }

        Cart keep = existing.get(0);
        keep.setQuantity(quantity);
        cartRepository.save(keep);

        for (int i = 1; i < existing.size(); i++) {
            cartRepository.delete(existing.get(i));
        }
        return getCart(userId);
    }

    @Override
    public CartResponseDto removeItem(Long userId, Long productId) {
        cartRepository.deleteByUser_UserIdAndProduct_ProductId(userId, productId);
        return getCart(userId);
    }
}
