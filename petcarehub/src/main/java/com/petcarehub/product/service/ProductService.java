package com.petcarehub.product.service;

import com.petcarehub.product.dto.ProductRequest;
import com.petcarehub.product.dto.ProductResponse;
import com.petcarehub.product.entity.Product;
import com.petcarehub.product.repository.ProductRepository;
import com.petcarehub.product.entity.ProductAttribute;
import com.petcarehub.product.repository.ProductAttributeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductAttributeRepository productAttributeRepository;

    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile image) {
        Product product = new Product();
        updateProductFields(product, request);

        if (image != null && !image.isEmpty()) {
            try {
                product.setImage(image.getBytes());
                product.setImageContentType(image.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Could not store product image.", e);
            }
        }

        Product savedProduct = productRepository.save(product);

        ProductAttribute attribute = new ProductAttribute();
        attribute.setProduct(savedProduct);
        updateAttributeFields(attribute, request);
        productAttributeRepository.save(attribute);

        return mapToDTO(savedProduct, false);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile image) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        updateProductFields(product, request);

        if (image != null && !image.isEmpty()) {
            try {
                product.setImage(image.getBytes());
                product.setImageContentType(image.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Could not store product image.", e);
            }
        }

        Product savedProduct = productRepository.save(product);

        ProductAttribute attribute = productAttributeRepository.findById(id)
                .orElse(new ProductAttribute());
        if (attribute.getProduct() == null) {
            attribute.setProduct(savedProduct);
        }
        updateAttributeFields(attribute, request);
        productAttributeRepository.save(attribute);

        return mapToDTO(savedProduct, false);
    }

    private void updateProductFields(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());
    }

    private void updateAttributeFields(ProductAttribute attr, ProductRequest request) {
        attr.setBrand(request.getBrand());
        attr.setVariants(request.getVariants());
        attr.setColors(request.getColors());
        attr.setFlavors(request.getFlavors());
        attr.setCategory(request.getCategory());
    }

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

        String effectiveImageUrl = product.getImageUrl();
        if (product.getImage() != null) {
            effectiveImageUrl = "/api/products/" + product.getProductId() + "/image";
        }

        ProductResponse dto = ProductResponse.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .reservedStockQuantity(
                        product.getReservedStockQuantity() != null ? product.getReservedStockQuantity() : 0)
                .availableStockQuantity(product.getAvailableStockQuantity())
                .category(attr != null && attr.getCategory() != null ? attr.getCategory() : product.getCategory())
                .imageUrl(effectiveImageUrl)
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
        List<Product> products = productRepository.findByCategoryContainingIgnoreCase(category);

        if ("dog".equalsIgnoreCase(category) || "cat".equalsIgnoreCase(category)) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null &&
                            (p.getCategory().toLowerCase().contains("dry") ||
                                    p.getCategory().toLowerCase().contains("wet") ||
                                    p.getCategory().toLowerCase().contains("treats")))
                    .collect(Collectors.toList());
        }

        return products.stream()
                .map(p -> mapToDTO(p, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveProductImage(Long productId, MultipartFile file) {
        Product product = getProductById(productId);
        try {
            product.setImage(file.getBytes());
            product.setImageContentType(file.getContentType());
            productRepository.save(product);
        } catch (IOException e) {
            throw new RuntimeException("Could not store product image.", e);
        }
    }

    public byte[] getProductImage(Long productId) {
        Product product = getProductById(productId);
        if (product.getImage() == null) {
            throw new RuntimeException("No image found for product ID: " + productId);
        }
        return product.getImage();
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productAttributeRepository.deleteById(id);
        productRepository.delete(product);
    }
}
