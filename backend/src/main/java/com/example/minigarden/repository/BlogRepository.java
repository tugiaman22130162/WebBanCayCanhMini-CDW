package com.example.minigarden.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.minigarden.entity.Blog;
import com.example.minigarden.entity.BlogType;

import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Integer> {
    //tìm slug 
    Optional<Blog> findBySlug(String slug);

    //tìm blog đã xuất bản
    List<Blog> findByPublishedTrue();

    //tìm theo loại: TREND, TIPS, GUIDE, PROMOTION, DECOR
    List<Blog> findByType(BlogType type);
    
}
