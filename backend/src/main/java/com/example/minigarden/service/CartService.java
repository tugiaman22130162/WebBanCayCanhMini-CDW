package com.example.minigarden.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.minigarden.dto.AddToCartRequest;
import com.example.minigarden.repository.CartItemRepository;
import com.example.minigarden.repository.CartRepository;
import com.example.minigarden.repository.ProductRepository;
import com.example.minigarden.entity.Cart;
import com.example.minigarden.entity.CartItem;
import com.example.minigarden.entity.Products;
import com.example.minigarden.dto.CartResponse;
import com.example.minigarden.dto.CartItemResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.minigarden.exception.OutOfStockException;
import com.example.minigarden.exception.ResourceNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service

public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public String addToCart(AddToCartRequest request) {

        if (request.getUserId() <= 0) {
            throw new IllegalArgumentException("Vui lòng đăng nhập để thêm vào giỏ hàng");
        }

        Cart cart = cartRepository.findByUserId(request.getUserId())
                .orElseGet(() -> {

                    Cart newCart = new Cart();
                    newCart.setUserId(request.getUserId());

                    return cartRepository.save(newCart);
                });

        Products product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

        int stock = product.getQuantity() != null ? product.getQuantity() : 0;
        int addQty = request.getQuantity() > 0 ? request.getQuantity() : 1;

        // 2. kiểm tra sản phẩm đã tồn tại chưa
        Optional<CartItem> optionalCartItem =
                cartItemRepository.findByCartIdAndProductId(
                        cart.getId(),
                        request.getProductId()
                );

        // 3. nếu đã tồn tại -> tăng số lượng
        if (optionalCartItem.isPresent()) {

            CartItem cartItem = optionalCartItem.get();

            int currentQty = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
            int newQuantity = currentQty + addQty;
            if (stock < newQuantity) {
                throw new OutOfStockException("Sản phẩm [" + product.getName() + "] không đủ số lượng (chỉ còn " + stock + " sản phẩm).");
            }

            cartItem.setQuantity(newQuantity);

            cartItemRepository.save(cartItem);

        } else {

            if (stock < addQty) {
                throw new OutOfStockException("Sản phẩm [" + product.getName() + "] không đủ số lượng (chỉ còn " + stock + " sản phẩm).");
            }

            // 4. chưa tồn tại -> tạo mới
            CartItem cartItem = new CartItem();

            // Set đối tượng Cart thay vì CartId
            cartItem.setCart(cart);

            cartItem.setProduct(product);
            
            cartItem.setQuantity(addQty);

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

        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);
        if (optionalCart.isPresent()) {
            Cart cart = optionalCart.get();
            List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

            for (CartItem item : cartItems) {
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
                res.setStock(item.getProduct().getQuantity() != null ? item.getProduct().getQuantity() : 0);
                
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
        cartItemRepository.findById(Objects.requireNonNull(cartItemId)).ifPresent(item -> {
            int newQuantity = item.getQuantity() + delta;
            if (newQuantity <= 0) {
                cartItemRepository.delete(item); // Số lượng <= 0 thì tự động xóa khỏi giỏ
            } else {
                int stock = item.getProduct().getQuantity() != null ? item.getProduct().getQuantity() : 0;
                // Chỉ kiểm tra tồn kho nếu số lượng tăng lên (bấm dấu +)
                if (delta > 0 && stock < newQuantity) {
                    throw new OutOfStockException("Sản phẩm [" + item.getProduct().getName() + "] không đủ số lượng (chỉ còn " + stock + " sản phẩm).");
                }
                item.setQuantity(newQuantity);
                cartItemRepository.save(item);
            }
        });
    }

    // 3. Xóa hoàn toàn một sản phẩm khỏi giỏ
    @Transactional
    public void removeCartItem(Integer cartItemId) {
        cartItemRepository.deleteById(Objects.requireNonNull(cartItemId));
    }
}
