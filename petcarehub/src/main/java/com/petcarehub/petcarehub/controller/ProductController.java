package com.petcarehub.petcarehub.controller;

import com.petcarehub.petcarehub.entity.Product;
import com.petcarehub.petcarehub.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    public ProductController(ProductRepository productRepository) { this.productRepository = productRepository; }

    @GetMapping("/{productId}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        if (p.getImage() == null || p.getImage().length == 0) return ResponseEntity.notFound().build();

        String ct = (p.getImageContentType() == null || p.getImageContentType().isBlank())
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : p.getImageContentType();

        return ResponseEntity.ok().contentType(MediaType.parseMediaType(ct)).body(p.getImage());
    }
}
