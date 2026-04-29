package com.petcarehub.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long productId;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private Integer reservedStockQuantity;
    private Integer availableStockQuantity;
    private String category;
    private String imageUrl;
    private String brand;
    private String variants;
    private String colors;
    private String flavors;

    private List<ProductResponse> relatedVariants;
}
