package com.petcarehub.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "reserved_stock_quantity", nullable = false)
    private Integer reservedStockQuantity = 0;

    public Integer getAvailableStockQuantity() {
        return stockQuantity - (reservedStockQuantity != null ? reservedStockQuantity : 0);
    }


    @Column
    private String imageUrl;

    @Column(name = "image_content_type")
    private String imageContentType;

    @Lob
    @Column(name = "image", columnDefinition = "LONGBLOB")
    private byte[] image;

    @Column
    private String category;

    // Explicit getters (Lombok backup)
    public Long getProductId() { return productId; }
}
