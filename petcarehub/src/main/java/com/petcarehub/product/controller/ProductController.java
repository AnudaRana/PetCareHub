package com.petcarehub.product.controller;

import com.petcarehub.product.dto.ProductRequest;
import com.petcarehub.product.dto.ProductResponse;
import com.petcarehub.product.entity.Product;
import com.petcarehub.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(
            @ModelAttribute ProductRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return new ResponseEntity<>(productService.createProduct(request, image), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable("id") Long id,
            @ModelAttribute ProductRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return new ResponseEntity<>(productService.updateProduct(id, request, image), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable("id") Long id) {
        try {
            return new ResponseEntity<>(productService.getProductDTOById(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProduct(@RequestParam("keyword") String keyword) {
        System.out.println("Searching for: " + keyword);
        return new ResponseEntity<>(productService.searchProducts(keyword), HttpStatus.OK);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponse>> getByCategory(@PathVariable("category") String category) {
        System.out.println("Filtering by category: " + category);
        return new ResponseEntity<>(productService.getProductsByCategory(category), HttpStatus.OK);
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadImage(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
        productService.saveProductImage(id, file);
        return ResponseEntity.ok("Image uploaded successfully");
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getProductImage(@PathVariable("id") Long id) {
        Product product = productService.getProductById(id);
        byte[] image = productService.getProductImage(id);
        
        String contentType = product.getImageContentType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "image/jpeg";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(image);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
