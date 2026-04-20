package com.example.minigarden.service;

import com.example.minigarden.dto.ProductResponse;
import com.example.minigarden.dto.ProductDetailResponse;
import com.example.minigarden.dto.Product;
import com.example.minigarden.entity.ProductDetails;
import com.example.minigarden.entity.Categories;
import com.example.minigarden.entity.Products;
import com.example.minigarden.entity.ProductImages;
import com.example.minigarden.repository.CategoryRepository;
import com.example.minigarden.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllForList().stream().map(product -> {
            List<String> imageUrls = product.getImages() != null
                    ? product.getImages().stream().map(ProductImages::getImage_url).collect(Collectors.toList())
                    : new ArrayList<>();

            return ProductResponse.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice() != null ? product.getPrice().doubleValue() : null)
                    .quantity(product.getQuantity())
                    .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                    .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                    .images(imageUrls)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Integer id) {
        Products product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + id));

        List<String> imageUrls = product.getImages() != null
                ? product.getImages().stream().map(ProductImages::getImage_url).collect(Collectors.toList())
                : new ArrayList<>();

        ProductDetailResponse detailResponse = null;
        if (product.getDetails() != null) {
            detailResponse = ProductDetailResponse.builder()
                    .light(product.getDetails().getLight())
                    .water(product.getDetails().getWater())
                    .size(product.getDetails().getSize())
                    .origin(product.getDetails().getOrigin())
                    .temperature(product.getDetails().getTemperature())
                    .potType(product.getDetails().getPotType())
                    .weight(product.getDetails().getWeight())
                    .note(product.getDetails().getNote())
                    .build();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice() != null ? product.getPrice().doubleValue() : null)
                .quantity(product.getQuantity())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .images(imageUrls)
                .details(detailResponse)
                .build();
    }

    @Transactional
    public Products updateProduct(Integer id, Product dto, List<MultipartFile> images) {
        Products product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + id));

        if (!product.getName().equals(dto.getName()) && productRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác!");
        }

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice() != null ? BigDecimal.valueOf(dto.getPrice()) : BigDecimal.ZERO);
        product.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0);

        Categories category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category không tồn tại với ID: " + dto.getCategoryId()));
        product.setCategory(category);

        if (dto.getDetails() != null) {
            ProductDetails details = product.getDetails();
            if (details == null) {
                details = new ProductDetails();
                details.setProduct(product);
            }
            details.setLight(dto.getDetails().getLight());
            details.setWater(dto.getDetails().getWater());
            details.setSize(dto.getDetails().getSize());
            details.setOrigin(dto.getDetails().getOrigin());
            details.setTemperature(dto.getDetails().getTemperature());
            details.setPotType(dto.getDetails().getPotType());
            details.setWeight(dto.getDetails().getWeight());
            details.setNote(dto.getDetails().getNote());
            product.setDetails(details);
        }

        List<CloudinaryService.UploadedImage> uploadedImages = new ArrayList<>();
        try {
            if (images != null && !images.isEmpty()) {
                if (product.getImages() != null) {
                    for (ProductImages oldImg : product.getImages()) {
                        if (oldImg.getPublic_id() != null) {
                            try { cloudinaryService.deleteImage(oldImg.getPublic_id()); } catch (Exception ignored) {}
                        }
                    }
                    product.getImages().clear();
                }

                List<ProductImages> productImages = new ArrayList<>();
                boolean isPrimary = true;
                int sortOrder = 1;
                for (MultipartFile file : images) {
                    CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadListingImage(file);
                    uploadedImages.add(uploadedImage);
                    
                    ProductImages productImage = new ProductImages();
                    productImage.setImage_url(uploadedImage.secureUrl());
                    productImage.setPublic_id(uploadedImage.publicId());
                    productImage.setIs_primary(isPrimary);
                    productImage.setSort_order(sortOrder);
                    productImage.setProduct(product);
                    productImages.add(productImage);
                    
                    isPrimary = false;
                    sortOrder++;
                }
                if (product.getImages() == null) product.setImages(productImages);
                else product.getImages().addAll(productImages);
            }
            
            return productRepository.save(product);
        } catch (Exception e) {
            for (CloudinaryService.UploadedImage img : uploadedImages) {
                try { cloudinaryService.deleteImage(img.publicId()); } catch (Exception ignored) {}
            }
            throw new RuntimeException("Lỗi khi cập nhật dữ liệu sản phẩm: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Products createProduct(Product dto, List<MultipartFile> images) {
        // Kiểm tra trùng lặp tên ngay từ đầu để tránh tốn thời gian upload
        if (productRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác!");
        }

        Products product = new Products();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice() != null ? BigDecimal.valueOf(dto.getPrice()) : BigDecimal.ZERO);
        product.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0);

        Categories category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category không tồn tại với ID: " + dto.getCategoryId()));
        product.setCategory(category);

        if (dto.getDetails() != null) {
            ProductDetails details = new ProductDetails();
            details.setLight(dto.getDetails().getLight());
            details.setWater(dto.getDetails().getWater());
            details.setSize(dto.getDetails().getSize());
            details.setOrigin(dto.getDetails().getOrigin());
            details.setTemperature(dto.getDetails().getTemperature());
            details.setPotType(dto.getDetails().getPotType());
            details.setWeight(dto.getDetails().getWeight());
            details.setNote(dto.getDetails().getNote());

            details.setProduct(product);
            product.setDetails(details);
        }

        List<CloudinaryService.UploadedImage> uploadedImages = new ArrayList<>();
        try {
            if (images != null && !images.isEmpty()) {
                List<ProductImages> productImages = new ArrayList<>();
                boolean isPrimary = true;
                int sortOrder = 1;
                for (MultipartFile file : images) {
                    CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadListingImage(file);
                    uploadedImages.add(uploadedImage); // Lưu thông tin ảnh để xóa nếu cần rollback
                    
                    ProductImages productImage = new ProductImages();
                    productImage.setImage_url(uploadedImage.secureUrl());
                    productImage.setPublic_id(uploadedImage.publicId());
                    productImage.setIs_primary(isPrimary);
                    productImage.setSort_order(sortOrder);
                    productImage.setProduct(product);
                    productImages.add(productImage);
                    
                    isPrimary = false;
                    sortOrder++;
                }
                product.setImages(productImages);
            }
            
            return productRepository.save(product);
        } catch (Exception e) {
            // Nếu có lỗi từ cơ sở dữ liệu (Database), tiến hành xóa các ảnh vừa được upload trên Cloudinary
            for (CloudinaryService.UploadedImage img : uploadedImages) {
                cloudinaryService.deleteImage(img.publicId());
            }
            throw new RuntimeException("Lỗi khi lưu dữ liệu sản phẩm: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteProduct(Integer id) {
        Products product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + id));
        product.setStatus(false);
        productRepository.save(product);
    }
}