package com.petcarehub.config;

import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.entity.PetGender;
import com.petcarehub.pet.repository.PetRepository;
import com.petcarehub.user.entity.Role;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
@Profile({ "dev", "test" })
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final com.petcarehub.product.repository.ProductRepository productRepository;
    private final com.petcarehub.product.repository.ProductAttributeRepository productAttributeRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL}")
    private String aEmail;

    @Value("${ADMIN_PASSWORD}")
    private String aPassword;


    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // ── Admin / Vet seed (existing logic) ────────────────────────────────
        seedAdminUser();

        // ── Additional seed users ─────────────────────────────────────────────
        User owner_1 = seedUser(
                "Amaya", "Gunasekara",
                "amayaswgunasekara4@gmail.com",
                "ag@1119",
                "0750343267", "Kosgama",
                Set.of(Role.ROLE_OWNER)
        );

        User owner_2 = seedUser(
                "Kumari", "Gunasekara",
                "kumaritharupama@gmail.com",
                "kg@1113",
                "0779172952", "Kosgama",
                Set.of(Role.ROLE_OWNER)
        );

        seedUser(
                "Sanjeewani", "Perera",
                "sanjeewani42074@gmail.com",
                "sanP@829",
                "0773203829", "Suduwella",
                Set.of(Role.ROLE_VET)
        );

        seedUser(
                "Piyumi", "Yashodhara",
                "cocobuddy1216@gmail.com",
                "py@1216",
                "0713508108", "Athurugiriya",
                Set.of(Role.ROLE_STAFF)
        );

        seedUser(
                "Vindya", "Wijerathna",
                "vindyawijerathna1@gmail.com",
                "vw@0401",
                "0778922525", "Polgahawela",
                Set.of(Role.ROLE_ADMIN)
        );



        // ── Product Store seed ────────────────────────────────────────────────
        seedStoreCatalog();
    }

    private void seedStoreCatalog() {
        // DOG DRY
        seedStoreProduct("Pedigree Adult Meat & Rice", "Pedigree", 2100, "Balanced adult dog food with meat and rice for digestion and overall health", "dog dry", "1kg", "dd_pg_mar_a.png");
        seedStoreProduct("Pedigree Adult Chicken & Vegetables", "Pedigree", 2100, "Chicken-based dry food with vegetables for adult dogs", "dog dry", "1kg", "dd_pg_crv_a.png");
        seedStoreProduct("Pedigree Puppy Chicken & Milk", "Pedigree", 2100, "Puppy formula with chicken and milk for growth and immunity", "dog dry", "1kg", "dd_pg_cm_p.png");
        seedStoreProduct("Lets Bite Active Adult Dog Food", "Lets Bite", 8500, "High-energy adult dog food for active dogs", "dog dry", "12kg", "dd_lb_cel_a.png");
        seedStoreProduct("Lets Bite Active Puppy Food", "Lets Bite", 9000, "Puppy food designed for growth and energy", "dog dry", "12kg", "dd_lb_cel_p.png");
        seedStoreProduct("Drools Chicken & Egg Puppy Food", "Drools", 7500, "Protein-rich puppy food with chicken and egg", "dog dry", "12kg", "dd_d_ce_p.png");
        seedStoreProduct("Drools Chicken & Egg Adult Dog Food", "Drools", 7000, "Complete adult dog food with high protein content", "dog dry", "12kg", "dd_d_ce_a.png");
        seedStoreProduct("Royal Canin Renal Dog", "Royal Canin", 12000, "Veterinary diet for dogs with kidney issues", "dog dry", "2kg", "dd_rc_rf_a.png");

        // DOG WET
        seedStoreProduct("Black Hawk Adult Wet Chicken", "Black Hawk", 1000, "Premium wet dog food made with real chicken", "dog wet", "400g", "dw_bh_c_a.png");
        seedStoreProduct("Pedigree Chicken & Liver Pouch", "Pedigree", 300, "Soft wet food with chicken and liver", "dog wet", "80g", "dw_pg_clv_p.png");
        seedStoreProduct("Pedigree Chicken Pouch", "Pedigree", 300, "Chicken flavored wet food pouch for dogs", "dog wet", "80g", "dw_pg_cl_a.png");
        seedStoreProduct("Black Hawk Adult Wet Beef", "Black Hawk", 1000, "Wet dog food with beef, high in protein", "dog wet", "400g", "dw_bh_b_a.png");

        // CAT DRY
        seedStoreProduct("Lets Bite Adult Cat Food", "Lets Bite", 900, "Dry cat food for adult cats", "cat dry", "400g", "cd_lb_sem_a.png");
        seedStoreProduct("Lets Bite Kitten Food", "Lets Bite", 900, "Nutritional kitten dry food", "cat dry", "400g", "cd_lb_sem_k.png");
        seedStoreProduct("Lets Bite Persian Cat Food", "Lets Bite", 900, "Special formula for Persian cats", "cat dry", "400g", "cd_lb_of_a.png");
        seedStoreProduct("Me-O Mackerel Cat Food", "Me-O", 1800, "Mackerel flavored balanced cat food", "cat dry", "1kg", "cd_mo_m_a.png");
        seedStoreProduct("Me-O Tuna Cat Food", "Me-O", 900, "Tuna flavored dry food for cats", "cat dry", "450g", "cd_mo_t_a.png");
        seedStoreProduct("Drools Kitten Ocean Fish", "Drools", 1000, "Ocean fish based kitten food", "cat dry", "400g", "cd_d_of_k.png");

        // CAT WET
        seedStoreProduct("Whiskas Tuna", "Whiskas", 350, "Wet cat food with tuna", "cat wet", "85g", "cw_w_t_a.png"); // Using known correct names
        seedStoreProduct("Whiskas Mackerel & Salmon", "Whiskas", 350, "Wet cat food with fish flavors", "cat wet", "85g", "cw_w_ms_a.png");
        seedStoreProduct("Whiskas Mackerel", "Whiskas", 3500, "Wet food with Mackerel", "cat wet", "85g", "cw_w_m_a.png");

        // TREATS
        seedStoreProduct("Seepet Knotted Bone", "Seepet", 1000, "Chew bones for dental health", "dog treats", "Standard", "dt_s_dbk6.png");
        seedStoreProduct("Seepet Cut Twists", "Seepet", 700, "Twisted chew treats", "dog treats", "100g", "dt_s_dbct.png");
        seedStoreProduct("Seepet Dog Munchies", "Seepet", 1200, "Soft chew munchies", "dog treats", "50pcs", "dt_s_dbdm.png");
        seedStoreProduct("Me-O Creamy Treat Bonito", "Me-O", 700, "Creamy lickable bonito treat", "cat treats", "Sachets", "ct_mo_b.png");
        seedStoreProduct("Me-O Creamy Treat Salmon", "Me-O", 700, "Creamy salmon flavored treat", "cat treats", "60g", "ct_mo_s.png");
        seedStoreProduct("Me-O Creamy Treat Variety", "Me-O", 700, "Assorted creamy cat treats", "cat treats", "Sachets", "ct_mo_cl.png");
        seedStoreProduct("Crispy Crunch Salmon", "Me-O", 600, "Crunchy cat treats with salmon", "cat treats", "60g", "ct_vk_s.png");
        seedStoreProduct("Crispy Crunch Poultry", "Me-O", 600, "Crunchy poultry flavored treats", "cat treats", "60g", "ct_vk_p.png");

        // HEALTH
        seedStoreProduct("TixFree Dog", "TixFree", 1800, "Tick and flea treatment for small dogs", "dog health", "2-10kg", "dh_tfx2-10.png");
        seedStoreProduct("TixFree Dog", "TixFree", 2000, "Tick and flea treatment for medium dogs", "dog health", "10–20kg", "dh_tfx10-20.png");
        seedStoreProduct("TixFree Dog", "TixFree", 2200, "Tick and flea treatment for large dogs", "dog health", "20–40kg", "dh_tfx20-40.png");
        seedStoreProduct("TixFree Dog", "TixFree", 2500, "Tick and flea treatment for extra large dogs", "dog health", "40kg+", "dh_tfx40+.png");
        seedStoreProduct("TixFree Adult Cat", "TixFree", 1500, "Tick and flea treatment for cats", "cat health", "Standard", "ch_tf_a.png");

        // GROOMING
        seedStoreProduct("Embark Dog Brush", "Embark", 1000, "Basic grooming brush", "grooming", "Standard", "gb_db.png");
        seedStoreProduct("Embark Grooming Brush", "Embark", 1100, "Advanced grooming brush", "grooming", "Standard", "gb_gb.png");
        seedStoreProduct("Double Sided Brush", "Generic", 1200, "Dual-sided grooming brush", "grooming", "Large", "gb_dsb.png");
        seedStoreProduct("Bioline Finger Toothbrush Set", "Bioline", 900, "Pet dental cleaning kit", "grooming", "Set", "gdh_ftb.png");
        seedStoreProduct("Bioline Pet Toothpaste", "Bioline", 1100, "Pet toothpaste", "grooming", "Standard", "gdh_tp.png");
        seedStoreProduct("Top Dog Shampoo", "Unical Ceylon", 325, "Pet shampoo with Margosa Oil. Suitable for dogs of any breed", "grooming", "Standard", "g_ds.png");
        seedStoreProduct("Doggo Care Dog Shampoo", "British Cosmetics", 1200, "Vegan, harsh chemical free and gentle dog shampoo to ensure safe and effective cleaning of dog fur", "grooming", "Standard", "g_dc.png");

        // ACCESSORIES
        seedStoreProduct("Nylon Dog Collar", "MyPets", 800, "Adjustable nylon dog collar", "accessories", "40cm (red, blue, black, purple)", "gcl_dg.PNG");
        seedStoreProduct("Cat Harness", "MyPets", 1500, "Various cat harness options", "accessories", "(red, blue, black, purple)", "gcl_ch.png");
        seedStoreProduct("Embark Rope Toy", "Embark", 900, "Rope toy for dogs", "accessories", "Standard", "t_rrt.png");
        seedStoreProduct("Ball Toy", "MyPets", 700, "Rubber spiky ball for play", "accessories", "Standard (brown, white, black)", "t_pb.png");

        // SUPPLEMENTS
        seedStoreProduct("Beaphar Bone Builder", "Beaphar", 5555, "Enhance Your Pet's Bone Health with Beaphar Bone Builder", "supplements", "standard", "s_b_bb.PNG");
        seedStoreProduct("Vetzyme High Strength Flexible Joint", "Hemas", 3600, "Enhance Your Dog’s Joint Health with Vetzyme High Strength", "supplements", "Standard", "s_h_fj.png");
        seedStoreProduct("Quadracoat Syrup for Cats and Dogs", "MyPets", 1275, "Omega Fatty Acids for required for a shiny coat, healthy skin", "supplements", "Standard", "s_m_q.png");
    }

    private void seedStoreProduct(String name, String brand, double price, String description, String category, String variants, String imageName) {
        String colors = null;
        String finalVariants = variants;

        // Parse colors from variants string: "40cm (red, blue, black, purple)"
        if (variants != null && variants.contains("(") && variants.contains(")")) {
            int start = variants.indexOf("(");
            int end = variants.indexOf(")");
            colors = variants.substring(start + 1, end).trim();
            finalVariants = variants.substring(0, start).trim();
            if (finalVariants.isEmpty()) finalVariants = "Standard";
        }

        final String flavor = null; // Can be expanded if flavor is explicitly provided
        final String finalColors = colors;
        final String finalV = finalVariants;

        // Uniqueness check: name + brand + variant + color + flavor
        boolean exists = productRepository.findAll().stream().anyMatch(p -> {
            if (!p.getName().equalsIgnoreCase(name)) return false;
            com.petcarehub.product.entity.ProductAttribute attr = productAttributeRepository.findById(p.getProductId()).orElse(null);
            if (attr == null) return false;
            return java.util.Objects.equals(attr.getBrand(), brand) &&
                   java.util.Objects.equals(attr.getVariants(), finalV) &&
                   java.util.Objects.equals(attr.getColors(), finalColors);
        });

        if (exists) return;

        com.petcarehub.product.entity.Product product = new com.petcarehub.product.entity.Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(java.math.BigDecimal.valueOf(price));
        product.setStockQuantity(50);
        product.setImageUrl("/api/products/images/" + imageName);
        product.setCategory(category);
        productRepository.save(product);

        com.petcarehub.product.entity.ProductAttribute attr = com.petcarehub.product.entity.ProductAttribute.builder()
                .product(product)
                .brand(brand)
                .variants(finalV)
                .colors(finalColors)
                .flavors(flavor)
                .category(category)
                .build();
        productAttributeRepository.save(attr);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void seedAdminUser() {
        final String adminEmail = aEmail;
        final String adminPassword = aPassword;

        if (userRepository.existsByEmail(adminEmail)) {
            User existing = userRepository.findByEmail(adminEmail).get();
            existing.setPassword(passwordEncoder.encode(adminPassword));
            if (existing.getRoles().isEmpty()) {
                existing.setRoles(new HashSet<>(Set.of(Role.ROLE_ADMIN, Role.ROLE_VET)));
            }
            userRepository.save(existing);
            System.out.println("[DataInitializer] Admin already exists — password synced.");
            return;
        }

        User admin = User.builder()
                .firstName("Prasanna")
                .lastName("Kumara")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .mobileNumber("1234567890")
                .address("Admin Address")
                .roles(new HashSet<>(Set.of(Role.ROLE_ADMIN, Role.ROLE_VET)))
                .enabled(true)
                .build();

        userRepository.save(admin);
        System.out.println("[DataInitializer] Admin user created: " + adminEmail);
    }

    /**
     * Creates a user if one with the given email doesn't already exist.
     * Returns the (possibly existing) User, or null on error.
     */
    private User seedUser(String firstName, String lastName,
                          String email, String rawPassword,
                          String mobile, String address,
                          Set<Role> roles) {
        if (userRepository.existsByEmail(email)) {
            // Sync password in case it changed in code
            User existing = userRepository.findByEmail(email).orElse(null);
            if (existing != null) {
                existing.setPassword(passwordEncoder.encode(rawPassword));
                userRepository.save(existing);
                System.out.println("[DataInitializer] User exists — password synced: " + email);
            }
            return existing;
        }

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .mobileNumber(mobile)
                .address(address)
                .roles(new HashSet<>(roles))
                .enabled(true)
                .build();

        userRepository.save(user);
        System.out.println("[DataInitializer] Created user: " + email + " " + roles);
        return user;
    }

    /**
     * Creates a pet for the given owner if a pet with that name and owner doesn't exist.
     */
    private void seedPet(String name, String species, String breed,
                         PetGender gender, LocalDate dob, Double weight,
                         User owner) {
        boolean exists = petRepository.findAll().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(name)
                        && p.getOwner().getUserId().equals(owner.getUserId()));

        if (exists) {
            System.out.println("[DataInitializer] Pet already exists, skipping: " + name);
            return;
        }

        Pet pet = new Pet();
        pet.setName(name);
        pet.setSpecies(species);
        pet.setBreed(breed);
        pet.setGender(gender);
        pet.setDateOfBirth(dob);
        pet.setWeight(weight);
        pet.setOwner(owner);

        petRepository.save(pet);
        System.out.println("[DataInitializer] Created pet: " + name + " for " + owner.getEmail());
    }
}