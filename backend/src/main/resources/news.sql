/*
 Navicat Premium Dump SQL

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : minigarden

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 26/05/2026 14:10:15
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for news
-- ----------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `published` bit(1) NULL DEFAULT NULL,
  `reading_time` int NULL DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `thumbnail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `type` enum('DECOR','GUIDE','PROMOTION','TIPS','TREND') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `updated_at` datetime(6) NULL DEFAULT NULL,
  `user_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKi09n75txtudw1kawj5o7i8xag`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FKi09n75txtudw1kawj5o7i8xag` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of news
-- ----------------------------
INSERT INTO `news` VALUES (1, '<p>- Không tưới quá nhiều nước<br>- Đặt cây nơi có ánh sáng nhẹ<br>- Lau lá thường xuyên</p><p></p>', '2026-05-25 13:41:37.000000', b'1', 5, 'meo-cham-soc-cay-mini', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779717511/minigarden/products/bvqcnj9twjdgjazs1ay6.webp', '5 mẹo chăm sóc cây mini để bàn luôn xanh tốt', 'TIPS', '2026-05-25 13:58:32.000000', NULL);
INSERT INTO `news` VALUES (2, '<h2><img src=\"https://res.cloudinary.com/do1rmzt7f/image/upload/v1779719874/minigarden/products/fiwfxlirunxnfqhue573.jpg\">5 Mẹo chăm sóc cây để bàn mini</h2><p>Cây mini để bàn giúp không gian làm việc thư giãn hơn...</p><ul><li><p>Không tưới quá nhiều nước.</p></li><li><p>Đặt cây nơi có ánh sáng nhẹ.</p></li><li><p>Lau lá thường xuyên</p></li></ul><p><img src=\"https://noithathongduc.vn/wp-content/uploads/2021/05/cay-de-ban-hoc-cho-hoc-sinh-cap-3.jpg\"><img src=\"https://res.cloudinary.com/do1rmzt7f/image/upload/v1779719890/minigarden/products/zfftebsqpomdjy13fdx4.jpg\"></p>', '2026-05-25 14:06:50.000000', b'1', 5, 'meo-cham-soc-cay-de-ban', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779718009/minigarden/products/oh3c0v9kbtocryoukt10.jpg', '5 mẹo chăm sóc cây để bàn mini', 'TIPS', '2026-05-25 14:38:14.000000', NULL);
INSERT INTO `news` VALUES (3, '<h1>Góc Decor Aesthetic – Biến Không Gian Nhỏ Thành Nơi Chữa Lành</h1><p><img src=\"https://res.cloudinary.com/do1rmzt7f/image/upload/v1779720537/minigarden/products/gdajuycavvb2qhnxgsfw.jpg\">Một góc decor aesthetic không chỉ là nơi để ngắm, mà còn là không gian giúp tâm trạng trở nên nhẹ nhàng hơn sau một ngày dài. Những gam màu trung tính như trắng kem, be, nâu gỗ hay xanh sage thường được dùng để tạo cảm giác ấm áp và thư giãn. Ánh đèn vàng dịu kết hợp cùng dây fairy light sẽ khiến căn phòng trở nên chill hơn vào buổi tối.</p><p><img src=\"https://res.cloudinary.com/do1rmzt7f/image/upload/v1779720551/minigarden/products/uyuns0cipwi0lpzk4msg.jpg\">Một chiếc bàn gỗ nhỏ đặt cạnh cửa sổ, thêm vài quyển sách, nến thơm và ly matcha cũng đủ tạo nên vibe cực kỳ nghệ. Cây xanh mini như monstera, xương rồng hay pothos không chỉ giúp decor đẹp hơn mà còn mang lại cảm giác gần gũi với thiên nhiên.</p><p><img src=\"https://res.cloudinary.com/do1rmzt7f/image/upload/v1779720571/minigarden/products/z2ypfjtijnthimg0jzty.jpg\">Phong cách aesthetic thường ưu tiên sự tối giản nhưng vẫn có điểm nhấn riêng. Những bức tranh canvas, poster vintage hoặc gương đứng viền gỗ là các món decor được nhiều bạn trẻ yêu thích. Chăn len, thảm lông và gối mềm cũng giúp không gian trở nên ấm cúng hơn.<br><img src=\"https://res.cloudinary.com/do1rmzt7f/image/upload/v1779720593/minigarden/products/bboxlo2in2vgsumj6zeu.jpg\">Âm nhạc lo-fi nhẹ nhàng cùng một góc setup gọn gàng sẽ khiến việc học tập hay làm việc trở nên dễ chịu hơn rất nhiều. Điều quan trọng nhất của aesthetic không nằm ở việc phải mua thật nhiều đồ, mà là tạo ra một không gian phản ánh đúng cá tính và cảm xúc của bản thân.</p><p></p>', '2026-05-25 14:50:07.000000', b'1', 3, 'goc-decor-aesthetic', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779720606/minigarden/products/m2crvhx7lyr6owjl7yx9.jpg', 'Góc Decor Aesthetic – Biến Không Gian Nhỏ Thành Nơi Chữa Lành', 'DECOR', '2026-05-26 01:29:52.000000', 5);

SET FOREIGN_KEY_CHECKS = 1;
