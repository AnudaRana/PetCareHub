package com.petcarehub.product.service;

import com.petcarehub.product.dto.ProductResponse;
import com.petcarehub.product.entity.Product;
import com.petcarehub.product.repository.ProductRepository;
import com.petcarehub.product.entity.ProductAttribute;
import com.petcarehub.product.repository.ProductAttributeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductAttributeRepository productAttributeRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(p -> mapToDTO(p, false))
                .collect(Collectors.toList());
    }

    public ProductResponse getProductDTOById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToDTO(product, true);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    private ProductResponse mapToDTO(Product product, boolean includeRelated) {
        ProductAttribute attr = productAttributeRepository.findById(product.getProductId()).orElse(null);

        ProductResponse dto = ProductResponse.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .category(attr != null && attr.getCategory() != null ? attr.getCategory() : product.getCategory())
                .imageUrl(product.getImageUrl())
                .brand(attr != null ? attr.getBrand() : null)
                .variants(attr != null ? attr.getVariants() : null)
                .colors(attr != null ? attr.getColors() : null)
                .flavors(attr != null ? attr.getFlavors() : null)
                .build();

        if (includeRelated) {
            List<ProductResponse> related = productRepository.findAll().stream()
                    .filter(p -> p.getName().equalsIgnoreCase(product.getName())
                            && !p.getProductId().equals(product.getProductId()))
                    .filter(p -> {
                        ProductAttribute a = productAttributeRepository.findById(p.getProductId()).orElse(null);
                        return a != null && a.getBrand() != null && a.getBrand().equalsIgnoreCase(dto.getBrand());
                    })
                    .map(p -> mapToDTO(p, false))
                    .collect(Collectors.toList());
            dto.setRelatedVariants(related);
        }

        return dto;
    }

    public List<ProductResponse> searchProducts(String keyword) {
        return productRepository.searchProduct(keyword).stream()
                .map(p -> mapToDTO(p, false))
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategoryContainingIgnoreCase(category).stream()
                .map(p -> mapToDTO(p, false))
                .collect(Collectors.toList());
    }
}
