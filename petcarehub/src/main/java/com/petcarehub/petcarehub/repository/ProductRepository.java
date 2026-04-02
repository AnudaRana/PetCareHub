package com.petcarehub.petcarehub.repository;

import com.petcarehub.petcarehub.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {}
