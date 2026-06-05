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

 Date: 05/06/2026 19:33:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for terrarium_components
-- ----------------------------
DROP TABLE IF EXISTS `terrarium_components`;
CREATE TABLE `terrarium_components`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `care_level` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `css_style` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `humidity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `light` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` double NULL DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `stock_quantity` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of terrarium_components
-- ----------------------------
INSERT INTO `terrarium_components` VALUES (1, NULL, 'w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-[160px]', 'Hạn chế tưới nước ngập bình', NULL, NULL, NULL, 'Bình Tròn', 50000, 'CONTAINER', 10);
INSERT INTO `terrarium_components` VALUES (2, NULL, '#5d4037', NULL, NULL, NULL, NULL, 'Đất mùn', 30000, 'SOIL', 10);
INSERT INTO `terrarium_components` VALUES (3, 'Dễ', NULL, NULL, 'Cao', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1780660337/minigarden/components/c9uk1wx5rsxvx8m5aenn.png', 'Trung bình', 'Rêu đuôi chồn', 15000, 'PLANT', 20);
INSERT INTO `terrarium_components` VALUES (4, NULL, '#455a64', NULL, NULL, NULL, NULL, 'Đen xám', 45000, 'SOIL', 10);
INSERT INTO `terrarium_components` VALUES (5, 'Dễ', NULL, NULL, 'Cao', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1780661215/minigarden/components/t1zlnjhlht1zaqbkrnwc.png', 'Trung bình', 'Cẩm nhung xanh', 21000, 'PLANT', 20);
INSERT INTO `terrarium_components` VALUES (6, 'Trung bình', NULL, NULL, 'Cao', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1780662256/minigarden/components/y6t2vezwixolwzsxztvb.png', 'Trung bình', 'Sen đá ngọc', 30000, 'PLANT', 10);

SET FOREIGN_KEY_CHECKS = 1;
