package com.petcarehub.cart.dto;

import java.util.List;

public class CheckoutContextDto {
    public Long userId;
    public String fullName;
    public String email;
    public String contactNumber;
    public List<PetOptionDto> pets;
}
