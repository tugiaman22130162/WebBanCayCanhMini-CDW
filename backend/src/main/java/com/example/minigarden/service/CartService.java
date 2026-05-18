package com.example.minigarden.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.minigarden.dto.AddToCartRequest;
import com.example.minigarden.repository.CartItemRepository;
import com.example.minigarden.repository.CartRepository;
import com.example.minigarden.entity.Carts;
import com.example.minigarden.entity.CartItems;
import com.example.minigarden.entity.Products;
import com.example.minigarden.dto.CartResponse;
import com.example.minigarden.dto.CartItemResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service

public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;
    public String addToCart(AddToCartRequest request) {

        // 1. tìm cart theo user
        Carts cart = cartRepository.findByUserId(request.getUserId())
                .orElseGet(() -> {

                    // nếu chưa có cart thì tạo mới
                    Carts newCart = new Carts();
                    newCart.setUserId(request.getUserId());

                    return cartRepository.save(newCart);
                });

        // 2. kiểm tra sản phẩm đã tồn tại chưa
        Optional<CartItems> optionalCartItem =
                cartItemRepository.findByCartIdAndProductId(
                        cart.getId(),
                        request.getProductId()
                );

        // 3. nếu đã tồn tại -> tăng số lượng
        if (optionalCartItem.isPresent()) {

            CartItems cartItem = optionalCartItem.get();

            cartItem.setQuantity(
                    cartItem.getQuantity() + request.getQuantity()
            );

            cartItemRepository.save(cartItem);

        } else {

            // 4. chưa tồn tại -> tạo mới
            CartItems cartItem = new CartItems();

            // Set đối tượng Cart thay vì CartId
            cartItem.setCart(cart);

            // JPA cho phép tham chiếu khóa ngoại chỉ bằng cách tạo Object và gắn ID
            Products product = new Products();
            product.setId(request.getProductId());
            cartItem.setProduct(product);
            
            cartItem.setQuantity(request.getQuantity());

            cartItemRepository.save(cartItem);
        }

        return "Add to cart success";
    }

    // 1. Lấy danh sách giỏ hàng và tổng tiền
    @Transactional(readOnly = true)
    public CartResponse getCart(Integer userId) {
        CartResponse response = new CartResponse();
        List<CartItemResponse> itemResponses = new ArrayList<>();
        double total = 0.0;

        Optional<Carts> optionalCart = cartRepository.findByUserId(userId);
        if (optionalCart.isPresent()) {
            Carts cart = optionalCart.get();
            List<CartItems> cartItems = cartItemRepository.findByCartId(cart.getId());

            for (CartItems item : cartItems) {
                CartItemResponse res = new CartItemResponse();
                res.setId(item.getId()); // ID của CartItem (dùng để gửi lên khi muốn xóa/sửa)
                
                // Mapping thông tin Product (Hãy đảm bảo hàm get() phù hợp với Entity Products của bạn)
                res.setProductId(item.getProduct().getId());
                res.setName(item.getProduct().getName());
                
                // Chuyển đổi từ BigDecimal sang Double
                res.setPrice(item.getProduct().getPrice() != null ? item.getProduct().getPrice().doubleValue() : 0.0);
                
                // Lấy hình ảnh đầu tiên của sản phẩm để hiển thị trong giỏ hàng
                if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
                    res.setImage(item.getProduct().getImages().get(0).getImage_url());
                }
                res.setQuantity(item.getQuantity());
                
                // THÊM CATEGORY ID ĐỂ XÉT ĐIỀU KIỆN KHUYẾN MÃI DANH MỤC
                if (item.getProduct().getCategory() != null) {
                    res.setCategoryId(item.getProduct().getCategory().getId());
                }

                itemResponses.add(res);
                total += res.getPrice() * res.getQuantity();
            }
        }
        
        response.setItems(itemResponses);
        response.setTotalPrice(total);
        return response;
    }

    // 2. Cập nhật số lượng (delta truyền vào là 1 hoặc -1)
    @Transactional
    public void updateCartItemQuantity(Integer cartItemId, int delta) {
        cartItemRepository.findById(cartItemId).ifPresent(item -> {
            int newQuantity = item.getQuantity() + delta;
            if (newQuantity <= 0) {
                cartItemRepository.delete(item); // Số lượng <= 0 thì tự động xóa khỏi giỏ
            } else {
                item.setQuantity(newQuantity);
                cartItemRepository.save(item);
            }
        });
    }

    // 3. Xóa hoàn toàn một sản phẩm khỏi giỏ
    @Transactional
    public void removeCartItem(Integer cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }
}
