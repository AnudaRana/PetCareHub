// File: src/test/java/com/petcarehub/petcarehub/service/PetServiceImplTest.java
package com.petcarehub.petcarehub.service;

import com.petcarehub.pet.dto.PetRequestDTO;
import com.petcarehub.pet.dto.PetResponseDTO;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.user.entity.User;
import com.petcarehub.pet.entity.PetGender;
import com.petcarehub.exception.PetNotFoundException;
import com.petcarehub.exception.UnauthorizedAccessException;
import com.petcarehub.pet.repository.PetRepository;
import com.petcarehub.user.repository.UserRepository;
import com.petcarehub.pet.service.impl.PetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceImplTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PetServiceImpl petService;

    private User owner;
    private Pet pet;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(petService, "uploadDir", "uploads/pets");

        owner = new User();
        owner.setUserId(1L);
        owner.setFirstName("Sarah");
        owner.setLastName("Johnson");
        owner.setEmail("sarah@example.com");

        pet = new Pet();
        pet.setPetId(10L);
        pet.setName("Buddy");
        pet.setSpecies("Dog");
        pet.setBreed("Golden Retriever");
        pet.setGender(PetGender.MALE);
        pet.setDateOfBirth(LocalDate.of(2021, 3, 15));
        pet.setWeight(28.5);
        pet.setOwner(owner);
        pet.setCreatedAt(LocalDateTime.now());
    }

    // ── registerPet ────────────────────────────────────────────

    @Test
    void registerPet_ShouldSavePetAndReturnDTO() {
        PetRequestDTO dto = new PetRequestDTO();
        dto.setName("Buddy");
        dto.setSpecies("Dog");
        dto.setBreed("Golden Retriever");
        dto.setGender(PetGender.MALE);
        dto.setDateOfBirth(LocalDate.of(2021, 3, 15));
        dto.setWeight(28.5);

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(petRepository.save(any(Pet.class))).thenAnswer(inv -> {
            Pet p = inv.getArgument(0);
            p.setPetId(10L);
            p.setCreatedAt(LocalDateTime.now());
            return p;
        });

        PetResponseDTO result = petService.registerPet(1L, dto, null);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Buddy");
        assertThat(result.getSpecies()).isEqualTo("Dog");
        assertThat(result.getOwnerId()).isEqualTo(1L);
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void registerPet_ShouldThrow_WhenUserNotFound() {
        PetRequestDTO dto = new PetRequestDTO();
        dto.setName("Buddy");
        dto.setSpecies("Dog");
        dto.setDateOfBirth(LocalDate.now());

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> petService.registerPet(99L, dto, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    // ── getPetsByOwner ──────────────────────────────────────────

    @Test
    void getPetsByOwner_ShouldReturnListOfPets() {
        when(petRepository.findByOwner_UserId(1L)).thenReturn(List.of(pet));

        List<PetResponseDTO> result = petService.getPetsByOwner(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Buddy");
    }

    @Test
    void getPetsByOwner_ShouldReturnEmptyList_WhenNoPets() {
        when(petRepository.findByOwner_UserId(1L)).thenReturn(List.of());

        List<PetResponseDTO> result = petService.getPetsByOwner(1L);

        assertThat(result).isEmpty();
    }

    // ── getPetById ──────────────────────────────────────────────

    @Test
    void getPetById_ShouldReturnPet_WhenOwnerMatches() {
        when(petRepository.findById(10L)).thenReturn(Optional.of(pet));

        PetResponseDTO result = petService.getPetById(10L, 1L);

        assertThat(result.getPetId()).isEqualTo(10L);
        assertThat(result.getName()).isEqualTo("Buddy");
    }

    @Test
    void getPetById_ShouldThrowUnauthorized_WhenOwnerMismatches() {
        when(petRepository.findById(10L)).thenReturn(Optional.of(pet));

        assertThatThrownBy(() -> petService.getPetById(10L, 99L))
                .isInstanceOf(UnauthorizedAccessException.class);
    }

    @Test
    void getPetById_ShouldThrowNotFound_WhenPetDoesNotExist() {
        when(petRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> petService.getPetById(999L, 1L))
                .isInstanceOf(PetNotFoundException.class);
    }

    // ── searchPets ──────────────────────────────────────────────

    @Test
    void searchPets_ShouldReturnMatchingPets() {
        when(petRepository.findByOwner_UserIdAndNameContainingIgnoreCase(1L, "bud"))
                .thenReturn(List.of(pet));

        List<PetResponseDTO> result = petService.searchPets(1L, "bud");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Buddy");
    }

    @Test
    void searchPets_ShouldReturnEmpty_WhenNoMatch() {
        when(petRepository.findByOwner_UserIdAndNameContainingIgnoreCase(1L, "xyz"))
                .thenReturn(List.of());

        List<PetResponseDTO> result = petService.searchPets(1L, "xyz");

        assertThat(result).isEmpty();
    }

    // ── updatePet ──────────────────────────────────────────────

    @Test
    void updatePet_ShouldUpdateAndReturnDTO_WhenValid() {
        PetRequestDTO updateDto = new PetRequestDTO();
        updateDto.setName("Buddy Updated");
        updateDto.setSpecies("Dog");
        updateDto.setBreed("Golden Retriever");
        updateDto.setGender(PetGender.MALE);
        updateDto.setDateOfBirth(LocalDate.of(2021, 3, 15));
        updateDto.setWeight(30.0);

        when(petRepository.findById(10L)).thenReturn(Optional.of(pet));
        when(petRepository.save(any(Pet.class))).thenReturn(pet);

        PetResponseDTO result = petService.updatePet(10L, 1L, updateDto, null);

        assertThat(result.getName()).isEqualTo("Buddy Updated");
        assertThat(result.getWeight()).isEqualTo(30.0);
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void updatePet_ShouldThrowUnauthorized_WhenOwnerMismatches() {
        PetRequestDTO updateDto = new PetRequestDTO();
        when(petRepository.findById(10L)).thenReturn(Optional.of(pet));

        assertThatThrownBy(() -> petService.updatePet(10L, 99L, updateDto, null))
                .isInstanceOf(UnauthorizedAccessException.class);
    }

    @Test
    void updatePet_ShouldThrowNotFound_WhenPetDoesNotExist() {
        PetRequestDTO updateDto = new PetRequestDTO();
        when(petRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> petService.updatePet(999L, 1L, updateDto, null))
                .isInstanceOf(PetNotFoundException.class);
    }
}
