package com.petcarehub.invoice.repository;

import com.petcarehub.invoice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    Optional<Invoice> findByOrder_OrderId(Long orderId);
    
    boolean existsByOrder_OrderId(Long orderId);
    
    @Query("SELECT i FROM Invoice i LEFT JOIN FETCH i.items ORDER BY i.createdAt DESC")
    List<Invoice> findAllWithItems();
    
    @Query("SELECT i FROM Invoice i LEFT JOIN FETCH i.items WHERE i.invoiceId = :invoiceId")
    Optional<Invoice> findByInvoiceIdWithItems(@Param("invoiceId") Long invoiceId);
}
