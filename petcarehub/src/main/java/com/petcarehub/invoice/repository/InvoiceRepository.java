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
    
    // Owner billing: Find invoice by order ID and owner ID (security check)
    @Query("SELECT i FROM Invoice i LEFT JOIN FETCH i.items WHERE i.order.orderId = :orderId AND i.owner.userId = :ownerId")
    Optional<Invoice> findByOrderIdAndOwnerId(@Param("orderId") Long orderId, @Param("ownerId") Long ownerId);
    
    // Owner billing: Find all invoices for a specific owner
    @Query("SELECT i FROM Invoice i LEFT JOIN FETCH i.items WHERE i.owner.userId = :ownerId ORDER BY i.createdAt DESC")
    List<Invoice> findAllByOwnerId(@Param("ownerId") Long ownerId);
    
    // Owner billing: Find invoice by invoice ID and owner ID (security check)
    @Query("SELECT i FROM Invoice i LEFT JOIN FETCH i.items WHERE i.invoiceId = :invoiceId AND i.owner.userId = :ownerId")
    Optional<Invoice> findByInvoiceIdAndOwnerId(@Param("invoiceId") Long invoiceId, @Param("ownerId") Long ownerId);
}
