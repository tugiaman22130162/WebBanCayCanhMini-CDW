/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : minigarden

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 05/06/2026 21:59:03
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for custom_terrariums
-- ----------------------------
DROP TABLE IF EXISTS `custom_terrariums`;
CREATE TABLE `custom_terrariums`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_reply` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `container_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `container_price` double NULL DEFAULT NULL,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `plants` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `plants_price` double NULL DEFAULT NULL,
  `soil_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `soil_price` double NULL DEFAULT NULL,
  `status` enum('APPROVED','ORDERED','PENDING','REJECTED','DRAFT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `total_price` double NULL DEFAULT NULL,
  `user_note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `user_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `plant_positions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK39xnj6xrkpx7alwomsklldau0`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FK39xnj6xrkpx7alwomsklldau0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of custom_terrariums
-- ----------------------------
INSERT INTO `custom_terrariums` VALUES (1, NULL, 'Bình Tròn', 50000, '2026-06-02 13:22:15.000000', '2x Rêu đuôi chồn', 30000, 'Đất mùn', 30000, 'PENDING', 110000, '', 1, NULL, NULL);
INSERT INTO `custom_terrariums` VALUES (2, '', 'Bình Tròn', 50000, '2026-06-02 13:32:56.000000', '3x Rêu đuôi chồn', 45000, 'Đất mùn', 30000, 'APPROVED', 125000, '', 1, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1780407184/minigarden/user_designs/rl01zggb5jhwpzceclll.png', NULL);
INSERT INTO `custom_terrariums` VALUES (7, NULL, 'Bình Tròn', 50000, '2026-06-05 14:29:08.000000', '2x Sen đá ngọc, 3x Rêu đuôi chồn', 105000, 'Đất mùn', 30000, 'DRAFT', 185000, '', 1, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1780669759/minigarden/user_designs/px9fracqfggnsu83jqif.png', 'Sen đá ngọc|-54.4000244140625|96.5999755859375;Sen đá ngọc|49.60003662109375|75;Rêu đuôi chồn|-121.60003662109375|46.20001220703125;Rêu đuôi chồn|-40.79998779296875|37.4000244140625;Rêu đuôi chồn|117.5999755859375|17.4000244140625');

SET FOREIGN_KEY_CHECKS = 1;
