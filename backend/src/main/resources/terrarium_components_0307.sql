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

 Date: 03/07/2026 21:34:08
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
  `max_per_container` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of terrarium_components
-- ----------------------------
INSERT INTO `terrarium_components` VALUES (1, NULL, 'w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-[160px]', 'Hạn chế tưới nước ngập bình', NULL, NULL, NULL, 'Bình tròn', 50000, 'CONTAINER', 8, NULL);
INSERT INTO `terrarium_components` VALUES (2, NULL, '#5d4037', NULL, NULL, NULL, NULL, 'Đất mùn', 30000, 'SOIL', 8, NULL);
INSERT INTO `terrarium_components` VALUES (3, 'Dễ', NULL, NULL, 'Cao', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1780660337/minigarden/components/c9uk1wx5rsxvx8m5aenn.png', 'Trung bình', 'Rêu đuôi chồn', 15000, 'PLANT', 14, 4);
INSERT INTO `terrarium_components` VALUES (4, NULL, '#455a64', NULL, NULL, NULL, NULL, 'Đen xám', 50000, 'SOIL', 10, NULL);
INSERT INTO `terrarium_components` VALUES (5, 'Dễ', NULL, NULL, 'Cao', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1780661215/minigarden/components/t1zlnjhlht1zaqbkrnwc.png', 'Trung bình', 'Cẩm nhung xanh', 21000, 'PLANT', 20, 3);
INSERT INTO `terrarium_components` VALUES (6, 'Trung bình', NULL, NULL, 'Cao', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1780662256/minigarden/components/y6t2vezwixolwzsxztvb.png', 'Trung bình', 'Sen đá ngọc', 30000, 'PLANT', 8, 2);
INSERT INTO `terrarium_components` VALUES (7, NULL, 'w-[180px] sm:w-[200px] h-[360px] sm:h-[400px] rounded-t-[100px] rounded-b-[30px]', '- Lót đáy chống úng: Bắt buộc có 3cm đá núi lửa dưới đáy để chứa nước thừa, tránh thối rễ cây.\n- Bố cục dốc & Đứng: Đổ đất cao phía sau và dùng lũa/đá thuôn dài để tận dụng chiều cao bình.\n- Kiểm soát độ ẩm: Thành kính bám sương mờ là tốt; đọng giọt to là dư nước, cần mở nắp xả bớt.', NULL, NULL, NULL, 'Bình trụ', 55000, 'CONTAINER', 7, NULL);
INSERT INTO `terrarium_components` VALUES (8, NULL, 'w-[260px] sm:w-[280px] h-[320px] sm:h-[360px] rounded-[40px]', '- Né nước đọng đáy: Không đổ quá nhiều nước vì mối hàn kim loại dễ bị rỉ sét và rò rỉ ra ngoài.\n- Né va đập cạnh góc: Các điểm nối bằng kính rất giòn, dễ nứt toác nếu bị cấn hoặc đặt mạnh xuống bàn.', NULL, NULL, NULL, 'Bình đa giác', 60000, 'CONTAINER', 8, NULL);
INSERT INTO `terrarium_components` VALUES (9, NULL, '#ffcc80', NULL, NULL, NULL, NULL, 'Vàng cát', 30000, 'SOIL', 10, NULL);
INSERT INTO `terrarium_components` VALUES (10, NULL, '#d7ccc8', NULL, NULL, NULL, NULL, 'Trắng xám', 45000, 'SOIL', 10, NULL);
INSERT INTO `terrarium_components` VALUES (11, NULL, '#a1887f', NULL, NULL, NULL, NULL, 'Nâu nhạt', 25000, 'SOIL', 10, NULL);
INSERT INTO `terrarium_components` VALUES (12, NULL, '#8d6e63', NULL, NULL, NULL, NULL, 'Đất nung', 30000, 'SOIL', 9, NULL);
INSERT INTO `terrarium_components` VALUES (13, 'Dễ', NULL, NULL, 'Thấp', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1783087986/minigarden/components/i3mx4yvuujx4dtjjmyid.png', 'Mạnh', 'Xương rồng Thanh sơn', 65000, 'PLANT', 6, 4);
INSERT INTO `terrarium_components` VALUES (14, 'Trung bình', NULL, NULL, 'Thấp', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1783088837/minigarden/components/pvde5b5hb6jboa0ikigm.png', 'Mạnh', 'Sen đá bèo Nhật', 15000, 'PLANT', 10, 2);
INSERT INTO `terrarium_components` VALUES (15, 'Dễ', NULL, NULL, 'Cao', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1783089118/minigarden/components/tqkuotwbsxca6yaokkou.png', 'Trung bình', 'Cẩm nhung đỏ', 25000, 'PLANT', 20, 4);

SET FOREIGN_KEY_CHECKS = 1;
