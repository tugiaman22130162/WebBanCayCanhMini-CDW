package com.example.minigarden.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Builder
@NoArgsConstructor
@Data
@AllArgsConstructor

public class DashboardResponse {
    private int totalProducts;
    private int totalOrders;
    private int totalUsers;
    private double totalRevenue;
    private int pendingOrders;
    
}
