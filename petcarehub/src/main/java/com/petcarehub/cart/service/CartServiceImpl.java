package com.petcarehub.cart.service;

import com.petcarehub.cart.dto.CartItemDto;
import com.petcarehub.cart.dto.CartResponseDto;
import com.petcarehub.cart.entity.Cart;
import com.petcarehub.product.entity.Product;
import com.petcarehub.cart.repository.CartRepository;
import com.petcarehub.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ShippingPolicy shippingPolicy;

    public CartServiceImpl(CartRepository cartRepository,
                           UserRepository userRepository,
                           ShippingPolicy shippingPolicy) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
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
