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

 Date: 18/05/2026 01:13:16
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` bit(1) NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `street` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('COMPANY','HOME','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `ward` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_id` int NULL DEFAULT NULL,
  `province_id` int NULL DEFAULT NULL,
  `ward_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of addresses
-- ----------------------------
INSERT INTO `addresses` VALUES (1, '2026-05-15 10:27:11.000000', 'Quận Thủ Đức', 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', b'1', '0123456789', 'Hồ Chí Minh', 'Chan Chan', 'Đường số 6', 'COMPANY', 2, 'Phường Linh Trung', 1463, 202, '21808');
INSERT INTO `addresses` VALUES (2, '2026-05-15 15:23:16.000000', 'Huyện Gò Dầu', 'Hùng Vương, Thị trấn Gò Dầu, Huyện Gò Dầu, Tây Ninh', b'0', '012345678', 'Tây Ninh', 'Maya', 'Hùng Vương', 'HOME', 2, 'Thị trấn Gò Dầu', 1866, 240, '460801');
INSERT INTO `addresses` VALUES (3, '2026-05-15 15:56:40.000000', 'Huyện Si Ma Cai', 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', b'0', '0123456789', 'Lào Cai', 'Chan', 'Đường số 7', 'OTHER', 2, 'Xã Cán Cấu', 2264, 269, '80202');
INSERT INTO `addresses` VALUES (4, '2026-05-17 11:14:06.000000', 'Thành Phố Thủ Đức', 'đường số 6, Phường Linh Trung, Thành Phố Thủ Đức, Hồ Chí Minh', b'0', '0123456789', 'Hồ Chí Minh', 'Mayaa', 'đường số 6', 'OTHER', 2, 'Phường Linh Trung', 3695, 202, '90737');

-- ----------------------------
-- Table structure for care_instructions
-- ----------------------------
DROP TABLE IF EXISTS `care_instructions`;
CREATE TABLE `care_instructions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `fertilizing` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sunlight` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `watering` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_detail_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK606qeg2l4hl3l0k88wpi4vtuy`(`product_detail_id` ASC) USING BTREE,
  CONSTRAINT `FK606qeg2l4hl3l0k88wpi4vtuy` FOREIGN KEY (`product_detail_id`) REFERENCES `product_details` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 51 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of care_instructions
-- ----------------------------
INSERT INTO `care_instructions` VALUES (1, '- Cây có sức sống mạnh mẽ nên không cần quá nhiều phân bón.\n- Nếu muốn bón, chỉ nên dùng một lượng rất nhỏ để cây phát triển ổn định. ', '- Cần nhiều ánh sáng để duy trì màu sắc đẹp. Nếu trồng trong nhà, nên mang cây ra ngoài phơi nắng 2 ngày một lần.\n- Nên tránh nắng gắt buổi trưa; ánh sáng dịu hoặc nắng sáng sớm là tốt nhất.', '- Chỉ tưới khi đất đã khô hẳn, tần suất trung bình 1-2 lần mỗi tuần.\n- Quan trọng: Chỉ tưới vào gốc và đất, tuyệt đối không tưới lên lá để tránh đọng nước gây thối.', 1);
INSERT INTO `care_instructions` VALUES (2, '- Sử dụng phân bón lá chuyên dụng cho terrarium pha loãng để xịt định kỳ 1-2 tháng/lần.\n- Hạn chế phân bón giàu đạm để cây không mọc quá nhanh, làm phá vỡ bố cục tiểu cảnh.', '-Đặt ở nơi có ánh sáng dịu như bàn làm việc gần cửa sổ hoặc dưới ánh đèn văn phòng.\n- Ánh sáng bật 6-8 tiếng/ngày là tốt nhất cho cây quang hợp.', '- Sử dụng bình xịt phun sương để tưới đều mặt rêu.\n- Chỉ nên dùng nước lọc hoặc nước máy đã để lắng (không chứa clo) để rêu không bị vàng.', 2);
INSERT INTO `care_instructions` VALUES (3, '- Bón phân định kỳ 1 tháng/lần bằng phân NPK pha loãng hoặc phân hữu cơ tan chậm để lá luôn xanh mướt.', '- Đặt cây ở nơi có ánh sáng tán xạ (gần cửa sổ, ban công có mái che).\n- Nếu để trong phòng kín hoàn toàn, nên cho cây ra ngoài sáng hoặc bật đèn quang hợp 2-3 lần/tuần.', '- Kiểm tra độ ẩm đất trước khi tưới. Mùa hè có thể tưới nhiều hơn, mùa đông nên giảm lượng nước.\n- Nên phun sương lên lá để giữ độ ẩm và làm sạch bụi bẩn giúp lá bóng đẹp.', 3);
INSERT INTO `care_instructions` VALUES (4, '- Sử dụng phân tan chậm chuyên dụng cho sen đá (như phân chì Nhật) rải quanh gốc, khoảng 3-4 tháng mới cần bổ sung một lần.', '- Phơi nắng thường xuyên giúp đầu lá có màu hồng rực rỡ hơn.\n- Tránh nắng gắt trực tiếp buổi trưa mùa hè (có thể dùng lưới che lan).', '- Tưới vào lúc sáng sớm hoặc chiều mát. Tránh để nước đọng trên tim lá vì dễ gây thối nhũn.\n- Sử dụng đất trồng có độ thoát nước cực cao (trộn nhiều đá perlite hoặc đá pumice).', 4);
INSERT INTO `care_instructions` VALUES (5, '- Bón phân tan chậm (phân chì Nhật hoặc phân hữu cơ chuyên dụng) định kỳ 3 tháng/lần để cây duy trì sức sống và đẻ thêm nhiều nhánh con.', '- Cần ánh sáng mặt trời ít nhất 5-6 tiếng mỗi ngày. Nếu để trong nhà lâu ngày, cây sẽ mất màu và thân mọc dài ra, lá thưa thớt.', '- Sử dụng phương pháp tưới ngấm (đặt chậu vào khay nước) hoặc tưới trực tiếp vào gốc, không nên xịt nước lên lá thường xuyên để tránh nấm mốc giữa các kẽ lá dày đặc.', 5);
INSERT INTO `care_instructions` VALUES (6, '- Sử dụng phân tan chậm chuyên dụng cho cây lá hoặc phân NPK pha thật loãng để tưới định kỳ 1-2 tháng/lần.', '- Thích hợp đặt ở cửa sổ hướng Đông/Tây hoặc dưới ánh đèn LED văn phòng.\n- Nếu lá có dấu hiệu nhạt màu và thưa, hãy di chuyển cây ra nơi có nhiều ánh sáng hơn.', '- Tưới trực tiếp vào gốc hoặc dùng bình phun sương xịt lên lá để giữ độ ẩm.\n- Giảm lượng nước tưới vào mùa mưa hoặc khi thời tiết nồm ẩm.', 6);
INSERT INTO `care_instructions` VALUES (7, '- Sử dụng phân tan chậm (phân chì Nhật) rải quanh gốc định kỳ 3-4 tháng/lần để cung cấp dinh dưỡng vừa đủ cho cây.', '- Cần nhiều ánh sáng tự nhiên. Nếu thiếu nắng, lá sẽ bị thưa, dài ra và mất đi màu viền hồng đặc trưng.\n- Mùa hè nắng gắt cần có lưới che để tránh cháy lá.', '- Nên tưới vào gốc, tránh tưới trực tiếp lên lá.\n- Tốt nhất là sử dụng phương pháp tưới ngấm (đặt chậu vào khay nước cao khoảng 1/3 chậu trong 5-10 phút).', 7);
INSERT INTO `care_instructions` VALUES (8, '- Hầu như không cần bón phân để cây không phát triển quá nhanh làm mất bố cục ban đầu. Nếu cần, chỉ dùng phân bón lá dạng xịt pha cực loãng 6 tháng/lần.', '- Đặt cách cửa sổ khoảng 1-2m hoặc để dưới đèn LED bàn làm việc từ 6-8 tiếng mỗi ngày.', '- Sử dụng nước lọc hoặc nước tinh khiết để tránh đóng cặn canxi trên mặt kính.\n- Chỉ phun sương nhẹ, không để nước đọng thành vũng dưới đáy bình.', 8);
INSERT INTO `care_instructions` VALUES (9, '- Bón phân tan chậm định kỳ 3-4 tháng/lần.', '- Thích hợp để bàn làm việc có ánh sáng tự nhiên hoặc cửa sổ. Mỗi ngày nên phơi nắng ít nhất 3-4 tiếng để cây không bị \"vống\" cao.', '- Nên tưới ngấm hoặc tưới vào mép chậu vào buổi sáng sớm hoặc chiều mát.', 9);
INSERT INTO `care_instructions` VALUES (10, '- Sử dụng phân NPK pha loãng hoặc phân hữu cơ tan chậm bón định kỳ 1 tháng/lần để cung cấp dinh dưỡng cho cây ra lá mới.', '- Đặt cây ở nơi thoáng mát, gần cửa sổ hoặc dưới ánh đèn văn phòng.\n- Để lá giữ được màu hồng rực rỡ, mỗi tuần nên cho cây tiếp xúc với ánh sáng mặt trời dịu nhẹ khoảng 2-3 tiếng vào sáng sớm.', '- Tưới trực tiếp vào gốc hoặc tưới phun sương lên lá để làm sạch bụi bẩn, giúp lá bóng đẹp và quang hợp tốt hơn.\n- Nếu để trong môi trường máy lạnh, nên giảm lượng nước tưới.', 10);
INSERT INTO `care_instructions` VALUES (11, '- Hạn chế tối đa phân bón để giữ form cây nhỏ nhắn. Nếu thấy cây vàng lá, có thể pha phân bón lá thật loãng xịt nhẹ 1 lần mỗi 6 tháng.\n', '- Đặt ở nơi thoáng mát, có ánh sáng dịu. Nếu dùng đèn LED chuyên dụng, nên đặt đèn cách đỉnh bình khoảng 15-20cm.', '- Dùng bình xịt phun sương nước lọc (nước tinh khiết) để tránh để lại vết cặn vôi trên kính.\n- Chỉ xịt vừa đủ ẩm mặt rêu, không để nước chảy thành dòng xuống đáy.', 11);
INSERT INTO `care_instructions` VALUES (12, '- Bón phân tan chậm chuyên dụng cho sen đá (phân chì Nhật) định kỳ 4-6 tháng/lần. Không nên bón quá nhiều đạm vì sẽ làm cây mọc vống và mất form dáng hoa sen.', '- Vị trí tốt nhất là ban công hoặc cửa sổ hướng Nam/Đông.\n- Nếu để trong nhà, phải mang cây ra phơi nắng thường xuyên ít nhất 3 ngày mỗi tuần.', '- Sử dụng phương pháp tưới ngấm hoặc dùng bình có vòi nhọn tưới sát mép chậu.\n- Chỉ tưới khi thấy lá hơi có dấu hiệu nhăn (biểu hiện thiếu nước).', 12);
INSERT INTO `care_instructions` VALUES (13, '- Dùng phân bón lá pha thật loãng xịt định kỳ 1 tháng/lần để lá luôn xanh mướt và giữ được độ bóng.', '- Thích hợp nhất là để trên bàn làm việc có ánh đèn huỳnh quang hoặc gần cửa sổ đón ánh sáng gián tiếp.\n- Nếu lá có dấu hiệu nhạt màu và thưa, cây đang cần thêm ánh sáng.', '- Luôn giữ cho đất ẩm nhưng không được úng. Nên dùng bình xịt phun sương lên lá để tăng độ ẩm không khí xung quanh cây.\n- Sử dụng nước lọc hoặc nước để qua đêm để tránh Clo làm cháy mép lá.', 13);
INSERT INTO `care_instructions` VALUES (14, '- Sử dụng phân tan chậm chuyên dụng định kỳ 4 tháng/lần để cây khỏe mạnh và ra thêm nhiều nhánh con xung quanh gốc.', '- Cần nắng trực tiếp. Nếu trồng trong nhà, bạn nên đặt ở ban công hoặc cửa sổ hướng Nam để cây giữ được sắc hồng \"đỉnh\" nhất.', '- Tưới vào mép chậu hoặc tưới ngấm. Hạn chế để nước đọng trên kẽ lá vì loài này lá xếp rất khít, nước khó thoát dễ gây thối nhũn.', 14);
INSERT INTO `care_instructions` VALUES (15, '- Sử dụng phân tan chậm (phân chì Nhật) rải quanh các khe hở giữa các gốc cây, khoảng 4-5 tháng/lần để cung cấp dưỡng chất duy trì màu lá.', '- Vị trí lý tưởng nhất là nơi có nắng sáng từ 6h - 10h. Nếu thiếu nắng, các đầu cây sẽ bị \"ngoảnh\" (vươn dài) và mất đi màu hồng cam xinh đẹp.', '- Nên tưới vào mép chậu hoặc dùng phương pháp tưới ngấm từ dưới lên để đảm bảo nước không dính vào tim lá của cụm cây dày đặc này.', 15);
INSERT INTO `care_instructions` VALUES (16, '- Cây không cần nhiều dinh dưỡng. Chỉ cần bón phân tan chậm hoặc phân hữu cơ 3-4 tháng/lần là đủ.', '- Thích hợp đặt ở bàn làm việc, kệ sách hoặc cửa sổ.\n- Nếu đặt ở nơi tối, thỉnh thoảng (1 tuần/lần) nên mang cây ra nơi có ánh sáng tự nhiên để cây tái tạo diệp lục.', '- Tưới trực tiếp vào đất quanh mép chậu, tránh để nước đọng lâu trong kẽ lá.\n- Thà để cây thật khô còn hơn tưới dư nước.', 16);
INSERT INTO `care_instructions` VALUES (17, '- Hầu như không cần bón phân. Nếu muốn cây bền màu, có thể dùng phân bón lá dạng xịt pha cực loãng xịt nhẹ 1 lần mỗi 6 tháng.', '- Đặt cách cửa sổ khoảng 1-2m hoặc sử dụng đèn LED chuyên dụng soi từ trên xuống 6-8 tiếng mỗi ngày để rêu và cây giữ màu xanh.', '- Sử dụng nước lọc hoặc nước mưa để phun sương mặt rêu, giúp kính luôn trong suốt, không bị bám cặn vôi.', 17);
INSERT INTO `care_instructions` VALUES (18, '- Bón phân tan chậm chuyên dụng định kỳ 6 tháng/lần. Cây lớn khá chậm nên không cần bón phân thường xuyên.', '- Nếu đặt trong văn phòng, mỗi tuần nên cho cây ra gần cửa sổ phơi nắng sáng (trước 10h) khoảng 2 lần để cây giữ được màu xanh đậm và không bị héo lá.', '- Tưới trực tiếp vào đất quanh gốc cây vào buổi sáng sớm hoặc chiều mát.\n- Vào mùa mưa hoặc thời tiết nồm ẩm, có thể nửa tháng mới cần tưới một lần.', 18);
INSERT INTO `care_instructions` VALUES (19, '- Bón phân NPK pha loãng hoặc phân tan chậm chuyên dụng cho hoa định kỳ 1 tháng/lần, đặc biệt là trước mùa hoa (thường là dịp Tết) để chùm hoa to và đậm màu.', '- Nên đặt cây gần cửa sổ hoặc ban công thoáng mát. Nếu để bàn làm việc, thỉnh thoảng nên mang cây ra nơi có ánh sáng tự nhiên để lá không bị nhỏ và thưa.', '- Tưới vào gốc cây vào buổi sáng sớm. Nếu trồng trong nhà máy lạnh, chỉ cần tưới 1-2 lần/tuần.', 19);
INSERT INTO `care_instructions` VALUES (20, '- Sử dụng phân tan chậm (phân chì Nhật) rải quanh gốc định kỳ 4-6 tháng/lần để cây khỏe mạnh và duy trì màu sắc ổn định.', '- Vị trí lý tưởng nhất là ban công hướng Nam hoặc Đông có nắng trực tiếp. Nếu trồng trong nhà, mỗi ngày cần cho cây ra nắng ít nhất 4 tiếng.', '- Tưới vào sáng sớm hoặc chiều mát. Nên tưới ngấm hoặc tưới sát mép chậu để nước không dính vào các kẽ lá dày đặc.', 20);
INSERT INTO `care_instructions` VALUES (21, '- Sử dụng phân bón lá chuyên dụng pha thật loãng xịt nhẹ cho rêu và gốc cây định kỳ 3-4 tháng/lần để cây duy trì độ xanh mướt.', '- Vị trí lý tưởng là bàn làm việc gần cửa sổ hoặc dưới đèn LED văn phòng. Đèn nên đặt cách đỉnh bình khoảng 10-15cm.', '- Sử dụng nước lọc để xịt phun sương, giúp kính không bị mờ do cặn canxi.\n- Chỉ tưới khi thấy mặt rêu hơi khô, tránh để nước đọng quá nhiều ở tầng sỏi phía dưới.', 21);
INSERT INTO `care_instructions` VALUES (22, '- Bón phân tan chậm chuyên dụng hoặc phân bón lá pha thật loãng định kỳ 4 - 6 tuần/lần vào mùa phát triển (xuân, hè). Không bón vào mùa đông khi cây nghỉ. ', '- Ánh sáng là \"chìa khóa\" để cây lên màu gân bạc rõ nét và giữ được màu đỏ ở mặt dưới lá.\n- Nếu đặt trong phòng kín, nên bật đèn quang hợp ít nhất 6-8 tiếng mỗi ngày.', '- Nên tưới vào gốc hoặc dùng phương pháp tưới ngấm để giữ cho bộ lá khô ráo.\n- Giữ đất luôn ẩm nhẹ nhưng phải đảm bảo thoát nước tốt.', 22);
INSERT INTO `care_instructions` VALUES (23, '- Bón phân tan chậm chuyên dụng định kỳ 4-6 tháng/lần vào mùa xuân hoặc mùa thu (thời điểm cây phát triển mạnh nhất).', '- Đặt cây ở nơi thoáng gió, có nắng sáng dịu. Nếu thấy lá bắt đầu xòe rộng ra quá mức là dấu hiệu cây đang thiếu nắng.', '- Tưới vào mép chậu hoặc dùng phương pháp tưới ngấm. Tuyệt đối không tưới vào tâm hoa vì nước đọng lâu sẽ làm thối nụ hoa hồng này rất nhanh.', 23);
INSERT INTO `care_instructions` VALUES (24, '- Bón phân tan chậm hoặc phân bón lá định kỳ 2-3 tháng/lần để kích thích cây đẻ thêm nhiều nhánh non (mầm lộc).', '- Đặt cây ở góc phòng, kệ sách hoặc bàn làm việc. Nếu lá có dấu hiệu vàng và rủ, hãy di chuyển cây đến nơi có ánh sáng tán xạ tốt hơn.', '- Thà để cây khô còn hơn tưới quá nhiều. Úng nước là nguyên nhân hàng đầu làm thối rễ củ của cây Kim Tiền.\n- Nên dùng khăn ẩm lau lá định kỳ để giữ độ bóng và giúp cây lọc không khí tốt hơn.', 24);
INSERT INTO `care_instructions` VALUES (25, '- Bón phân tan chậm (phân chì Nhật) định kỳ 6 tháng/lần với lượng rất ít (2-3 viên). Cây lớn khá chậm nên không cần nhiều dinh dưỡng.', '- Vị trí lý tưởng nhất là bàn làm việc có ánh sáng từ cửa sổ chiếu vào gián tiếp hoặc đặt dưới đèn LED. Ánh sáng dịu sẽ giúp lá trong suốt và xanh mướt hơn.', '- Nên tưới vào gốc hoặc tưới ngấm. Hạn chế để nước đọng lâu trên tim lá.\n- Vào mùa hè nóng bức, có thể phun sương xung quanh không khí để giữ độ tươi cho lá.', 25);
INSERT INTO `care_instructions` VALUES (26, '1–2 lần/tháng, dùng phân nhẹ.', 'Đặt nơi có ánh sáng tự nhiên nhẹ.', 'Chỉ tưới khi đất khô, tránh ướt lá.', 26);
INSERT INTO `care_instructions` VALUES (27, '1–2 lần/tháng, dùng phân hữu cơ hoặc NPK loãng.', 'Đặt trong nhà gần cửa sổ hoặc nơi có ánh sáng nhẹ.', 'Tưới khi đất bắt đầu khô, tránh để nước đọng.', 27);
INSERT INTO `care_instructions` VALUES (28, 'Bón phân hữu cơ hoặc phân tan chậm khoảng 1 lần/tháng để cây phát triển xanh tốt và ra lá đẹp hơn.', 'Ưa ánh sáng gián tiếp hoặc nắng bán phần nhẹ. Phù hợp đặt gần cửa sổ, bàn làm việc hoặc nơi có ánh sáng tự nhiên.', 'Tưới 2–3 lần/tuần tùy môi trường. Giữ đất hơi ẩm, tránh để cây bị úng nước hoặc khô quá lâu. Nên tưới vào sáng sớm hoặc chiều mát.', 28);
INSERT INTO `care_instructions` VALUES (29, 'Bón phân hữu cơ hoặc NPK loãng khoảng 2–3 tuần/lần để kích thích ra hoa.', 'Cần khoảng 4–6 giờ ánh sáng mỗi ngày để cây ra hoa đẹp và đều màu.', 'Giữ đất ẩm vừa phải, tránh để đất khô hoàn toàn hoặc quá úng nước.', 29);
INSERT INTO `care_instructions` VALUES (30, 'Bón phân hữu cơ hoặc phân tan chậm khoảng 2 tuần/lần giúp cây ra hoa đều hơn.', 'Cây cần khoảng 3–5 giờ ánh sáng nhẹ mỗi ngày để hoa nở đẹp và lâu tàn.', 'Giữ đất hơi ẩm, tránh để cây khô quá lâu hoặc đọng nước dưới đáy chậu.', 30);
INSERT INTO `care_instructions` VALUES (31, 'Bón phân hữu cơ hoặc phân dành cho hoa khoảng 2–3 tuần/lần để cây phát triển tốt hơn.', 'Cây cần khoảng 4–6 giờ ánh sáng nhẹ mỗi ngày để hoa giữ màu đẹp và lâu tàn.', 'Giữ đất ẩm vừa phải, không để đất quá khô hoặc quá úng nước.', 31);
INSERT INTO `care_instructions` VALUES (32, 'Bón phân hữu cơ hoặc phân dành cho hoa khoảng 2–3 tuần/lần để cây phát triển tốt hơn.', 'Cây cần khoảng 4–6 giờ ánh sáng nhẹ mỗi ngày để hoa giữ màu đẹp và lâu tàn.', 'Giữ đất ẩm vừa phải, không để đất quá khô hoặc quá úng nước.', 32);
INSERT INTO `care_instructions` VALUES (33, 'Bón phân hữu cơ hoặc phân dành cho hoa khoảng 2–3 tuần/lần để cây phát triển tốt hơn.', 'Giữ đất ẩm vừa phải, không để đất quá khô hoặc quá úng nước.', 'Cây cần khoảng 4–6 giờ ánh sáng nhẹ mỗi ngày để hoa giữ màu đẹp và lâu tàn.', 33);
INSERT INTO `care_instructions` VALUES (34, 'Bón phân hữu cơ hoặc phân dành cho hoa khoảng 2 tuần/lần giúp cây phát triển khỏe và ra hoa đều.', 'Cần khoảng 4–6 giờ ánh sáng nhẹ mỗi ngày để hoa nở đẹp và giữ màu lâu hơn.', 'Giữ đất hơi ẩm, tránh để đất quá khô hoặc đọng nước lâu ngày.', 34);
INSERT INTO `care_instructions` VALUES (35, '1–2 lần/tháng, dùng phân hữu cơ hoặc NPK loãng.', 'Tưới khi đất bắt đầu khô, tránh để nước đọng.', 'Đặt trong nhà gần cửa sổ hoặc nơi có ánh sáng nhẹ.', 35);
INSERT INTO `care_instructions` VALUES (36, 'Bón phân hữu cơ loãng hoặc phân tan chậm khoảng 1 lần/tháng.', 'Cây cần ánh sáng nhẹ để lá giữ màu đẹp và dây phát triển đều hơn.', 'Chỉ tưới khi bề mặt đất đã khô nhẹ để tránh úng rễ.', 36);
INSERT INTO `care_instructions` VALUES (37, 'Bón phân hữu cơ hoặc phân tan chậm khoảng 1 lần/tháng giúp lá xanh và phát triển dày hơn.', 'Nên treo nơi có ánh sáng tự nhiên nhẹ như gần cửa sổ, ban công có mái che hoặc phòng có ánh sáng tốt.', 'Giữ đất luôn hơi ẩm, đặc biệt trong thời tiết nóng. Có thể phun sương lên lá để tăng độ ẩm.', 37);
INSERT INTO `care_instructions` VALUES (38, 'Bón phân hữu cơ hoặc phân tan chậm 1–2 lần/tháng để lá xanh và dây leo phát triển mạnh.', 'Cây thích ánh sáng nhẹ, rất hợp treo gần cửa sổ hoặc ban công có mái che.', 'Giữ đất ẩm vừa phải, tránh để khô lâu hoặc úng nước.', 38);
INSERT INTO `care_instructions` VALUES (39, 'Bón phân hữu cơ hoặc NPK loãng khoảng 1–2 lần/tháng.', 'Cây cần ánh sáng nhẹ để giữ màu lá đẹp và phát triển dây rủ dài.', 'Tưới khi mặt đất bắt đầu khô nhẹ, tránh tưới quá thường xuyên.', 39);
INSERT INTO `care_instructions` VALUES (40, 'Bón phân loãng 1 lần/tháng để giữ lá xanh và dây phát triển đều.', 'Cây thích ánh sáng nhẹ, rất hợp để trong phòng hoặc treo gần cửa sổ.', 'Chỉ tưới khi đất khô nhẹ, tránh tưới quá nhiều vì dễ gây úng rễ.', 40);
INSERT INTO `care_instructions` VALUES (41, 'Bón phân loãng (1/4 liều) 1–2 lần/tháng để kích thích ra hoa.', 'Cần ánh sáng mạnh để cây phát triển và ra hoa. Thiếu sáng cây sẽ chậm lớn và ít hoa.', 'Phun sương trực tiếp lên rễ hoặc ngâm rễ nhanh 10–15 phút rồi để ráo hoàn toàn.', 41);
INSERT INTO `care_instructions` VALUES (42, 'Bón phân hữu cơ hoặc NPK loãng 1–2 lần/tháng.', 'Cần ánh sáng tốt để lá có nhiều lỗ đẹp và phát triển nhanh.', 'Giữ đất ẩm nhẹ, tưới khi bề mặt đất bắt đầu khô.', 42);
INSERT INTO `care_instructions` VALUES (43, 'Bón phân loãng 1–2 lần/tháng để kích thích ra hoa.', 'Cần ánh sáng tốt để cây khỏe và có khả năng ra hoa.', 'Tưới khi đất khô khoảng 2–3cm bề mặt, tránh tưới quá nhiều.', 43);
INSERT INTO `care_instructions` VALUES (44, 'Bón phân loãng 1–2 lần/tháng để kích thích ra hoa.', 'Cần ánh sáng tốt để cây khỏe và có khả năng ra hoa.', 'Tưới khi đất khô khoảng 2–3cm bề mặt, tránh tưới quá nhiều.', 44);
INSERT INTO `care_instructions` VALUES (45, 'Bón phân loãng 1–2 lần/tháng để cây phát triển nhanh và rủ đẹp.', 'Cần ánh sáng tốt để giữ màu tím rõ và cây mọc dày.', 'Tưới khi mặt đất bắt đầu khô nhẹ, không để khô hoàn toàn quá lâu.', 45);
INSERT INTO `care_instructions` VALUES (46, 'Bón phân loãng 1 lần/tháng để cây phát triển đều.', 'Cần ánh sáng nhẹ để phát triển tốt nhưng không chịu được nắng gắt.', 'Tưới khi đất khô, tránh tưới quá nhiều vì dễ gây thối rễ.', 46);
INSERT INTO `care_instructions` VALUES (47, 'Bón phân NPK loãng 1–2 lần/tháng để cây ra hoa liên tục.', 'Cần nắng trực tiếp ít nhất 4–6 giờ/ngày để ra hoa đẹp.', 'Chỉ tưới khi đất khô, tránh tưới quá nhiều gây úng.', 47);
INSERT INTO `care_instructions` VALUES (48, 'Bón phân loãng 2–4 tuần/lần để cây ra hoa đều và lá xanh bóng.', 'Cần ánh sáng nhẹ, phù hợp đặt gần cửa sổ có rèm che.', 'Tưới khi lớp đất mặt hơi khô, tránh để khô hoàn toàn hoặc úng nước.', 48);
INSERT INTO `care_instructions` VALUES (49, 'Bón phân loãng 1–2 lần/tháng để kích thích ra hoa.', 'Cần nhiều ánh sáng để ra hoa liên tục và màu hoa đẹp.', 'Chỉ tưới khi đất khô hoàn toàn hoặc gần khô, tránh úng nước.', 49);
INSERT INTO `care_instructions` VALUES (50, 'Bón phân chuyên cho lan 2–3 tuần/lần để giữ hoa lâu tàn.', 'Cần ánh sáng nhẹ, đặt gần cửa sổ có rèm là tốt nhất.', 'Tưới vào rễ, tránh làm đọng nước trên hoa và lá.', 50);

-- ----------------------------
-- Table structure for cart_items
-- ----------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKpcttvuq4mxppo8sxggjtn5i2c`(`cart_id` ASC) USING BTREE,
  INDEX `FK1re40cjegsfvw58xrkdp6bac6`(`product_id` ASC) USING BTREE,
  CONSTRAINT `FK1re40cjegsfvw58xrkdp6bac6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of cart_items
-- ----------------------------
INSERT INTO `cart_items` VALUES (12, 1, 2, 3);
INSERT INTO `cart_items` VALUES (14, 1, 3, 6);
INSERT INTO `cart_items` VALUES (15, 1, 1, 7);

-- ----------------------------
-- Table structure for carts
-- ----------------------------
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `total_price` decimal(38, 2) NULL DEFAULT NULL,
  `updated_at` datetime(6) NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK64t7ox312pqal3p7fg9o503c2`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of carts
-- ----------------------------
INSERT INTO `carts` VALUES (1, '2026-05-11 02:57:28.000000', NULL, NULL, 2);
INSERT INTO `carts` VALUES (2, '2026-05-12 03:24:52.000000', NULL, NULL, 5);
INSERT INTO `carts` VALUES (3, '2026-05-16 03:14:38.000000', NULL, NULL, 1);

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKt8o6pivur7nn124jehx7cygw5`(`name` ASC) USING BTREE,
  UNIQUE INDEX `UKoul14ho7bctbefv8jywp5v3i2`(`slug` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, 'Hệ sinh thái khép kín đầy nghệ thuật trong lọ thủy tinh.', 'Terrarium', 'terrarium', 'https://cdn.hstatic.net/products/200000968796/bb1_5b4161f028e848e88c84f3fd8c4a5090_large.png');
INSERT INTO `categories` VALUES (2, 'Mang thiên nhiên xanh mát vào không gian làm việc.', 'Cây để bàn', 'cay-de-ban', 'https://cdn-kvweb.kiotviet.vn/kiotviet-website/wp-content/uploads/2019/07/hai-ra-tien-tu-kinh-doanh-cay-canh-mini-2.png');
INSERT INTO `categories` VALUES (3, 'Nhỏ xinh, dễ chăm sóc, hoàn hảo cho mọi góc nhỏ.', 'Sen đá', 'sen-da', 'https://giatheficoco.com/wp-content/uploads/cay-co-the-moc-ra-nhieu-nhanh-moi-nen-tao-cho-cay-co-canh-la-xum-xue.webp');
INSERT INTO `categories` VALUES (11, 'Hợp decor bàn học, phòng ngủ, quán cà phê🍃', 'Cây Treo Aesthetic', 'cay-treo-aesthetic', 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778837436/minigarden/products/ug40pnictcbwmsdy46tv.jpg');

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `price` decimal(10, 2) NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(12, 2) NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKbioxgbv59vetrxe0ejfubep1w`(`order_id` ASC) USING BTREE,
  INDEX `FKocimc7dtr037rh4ls4l95nlfi`(`product_id` ASC) USING BTREE,
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 34 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (1, 30000.00, 'Sen đá kẹo bọc đường', 3, 90000.00, 1, 5);
INSERT INTO `order_items` VALUES (2, 485000.00, 'Terrarium tròn treo Totoro', 2, 970000.00, 1, 2);
INSERT INTO `order_items` VALUES (3, 120000.00, 'Lan hạt dưa', 1, 120000.00, 1, 6);
INSERT INTO `order_items` VALUES (4, 110000.00, 'Cây lưỡi hổ thái lùn vàng', 2, 220000.00, 1, 16);
INSERT INTO `order_items` VALUES (5, 350000.00, 'Trầu bà đế vương đỏ', 2, 700000.00, 1, 3);
INSERT INTO `order_items` VALUES (6, 45000.00, 'Sen đá Echeveria Prolifica (Sen đá nhánh)', 1, 45000.00, 1, 4);
INSERT INTO `order_items` VALUES (7, 45000.00, 'Sen đá Blue Minima', 1, 45000.00, 1, 7);
INSERT INTO `order_items` VALUES (8, 100000.00, 'Hoa hồng môn đỏ mini', 1, 100000.00, 1, 29);
INSERT INTO `order_items` VALUES (9, 100000.00, 'Hoa hồng môn đỏ mini', 1, 100000.00, 2, 29);
INSERT INTO `order_items` VALUES (10, 100000.00, 'Dương Xỉ Treo Aesthetic', 1, 100000.00, 3, 40);
INSERT INTO `order_items` VALUES (11, 100000.00, 'Hoa hồng môn đỏ mini', 1, 100000.00, 4, 29);
INSERT INTO `order_items` VALUES (12, 100000.00, 'Hoa hồng mônmini', 1, 100000.00, 5, 38);
INSERT INTO `order_items` VALUES (13, 70000.00, 'Cây Lan Tim Treo Aesthetic', 2, 140000.00, 6, 39);
INSERT INTO `order_items` VALUES (14, 100000.00, 'Hoa hồng mônmini', 1, 100000.00, 7, 38);
INSERT INTO `order_items` VALUES (15, 50000.00, ' Hoa Đồng Tiền Mini Để Bàn', 1, 50000.00, 8, 37);
INSERT INTO `order_items` VALUES (16, 50000.00, ' Hoa Đồng Tiền Mini Để Bàn', 1, 50000.00, 9, 37);
INSERT INTO `order_items` VALUES (17, 50000.00, ' Hoa Đồng Tiền Mini Để Bàn', 1, 50000.00, 10, 37);
INSERT INTO `order_items` VALUES (18, 120000.00, 'Lan hạt dưa', 1, 120000.00, 11, 6);
INSERT INTO `order_items` VALUES (19, 110000.00, 'Cây lưỡi hổ thái lùn vàng', 2, 220000.00, 11, 16);
INSERT INTO `order_items` VALUES (20, 100000.00, 'Hoa hồng môn đỏ mini', 1, 100000.00, 12, 29);
INSERT INTO `order_items` VALUES (21, 45000.00, 'Tulip Màu Vàng Mini Để Bàn', 1, 45000.00, 14, 36);
INSERT INTO `order_items` VALUES (22, 45000.00, 'Tulip Màu Vàng Mini Để Bàn', 1, 45000.00, 15, 36);
INSERT INTO `order_items` VALUES (23, 45000.00, 'Tulip Màu Vàng Mini Để Bàn', 1, 45000.00, 16, 36);
INSERT INTO `order_items` VALUES (24, 45000.00, 'Tulip Màu Vàng Mini Để Bàn', 1, 45000.00, 17, 36);
INSERT INTO `order_items` VALUES (25, 45000.00, 'Tulip Màu Vàng Mini Để Bàn', 1, 45000.00, 18, 36);
INSERT INTO `order_items` VALUES (26, 45000.00, 'Tulip Màu Vàng Mini Để Bàn', 1, 45000.00, 19, 36);
INSERT INTO `order_items` VALUES (27, 30000.00, 'Sen đá kẹo bọc đường', 3, 90000.00, 20, 5);
INSERT INTO `order_items` VALUES (28, 485000.00, 'Terrarium tròn treo Totoro', 2, 970000.00, 20, 2);
INSERT INTO `order_items` VALUES (29, 350000.00, 'Trầu bà đế vương đỏ', 2, 700000.00, 20, 3);
INSERT INTO `order_items` VALUES (30, 45000.00, 'Sen đá Echeveria Prolifica (Sen đá nhánh)', 1, 45000.00, 20, 4);
INSERT INTO `order_items` VALUES (31, 45000.00, 'Sen đá Blue Minima', 1, 45000.00, 20, 7);
INSERT INTO `order_items` VALUES (32, 70000.00, 'Cây Lan Tim Treo Aesthetic', 1, 70000.00, 21, 39);
INSERT INTO `order_items` VALUES (33, 30000.00, 'Sen đá kẹo bọc đường', 2, 60000.00, 22, 5);

-- ----------------------------
-- Table structure for order_promotions
-- ----------------------------
DROP TABLE IF EXISTS `order_promotions`;
CREATE TABLE `order_promotions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `discount_amount` decimal(12, 2) NOT NULL,
  `promotion_code` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKgrsuq7n4l6dxc8r7hsxv2k6qi`(`order_id` ASC) USING BTREE,
  CONSTRAINT `FKgrsuq7n4l6dxc8r7hsxv2k6qi` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_promotions
-- ----------------------------
INSERT INTO `order_promotions` VALUES (1, 21001.00, 'SHIPFREED3F8', 6);
INSERT INTO `order_promotions` VALUES (2, 21001.00, 'SHIPFREED3F8', 7);
INSERT INTO `order_promotions` VALUES (3, 53999.00, 'SHIPFREED3F8', 11);
INSERT INTO `order_promotions` VALUES (4, 53999.00, 'SHIPFREED3F8', 12);
INSERT INTO `order_promotions` VALUES (5, 53999.00, 'SHIPFREED3F8', 13);
INSERT INTO `order_promotions` VALUES (6, 2250.00, 'PROD5P65AC', 14);
INSERT INTO `order_promotions` VALUES (7, 2250.00, 'PROD5P65AC', 15);
INSERT INTO `order_promotions` VALUES (8, 2250.00, 'PROD5P65AC', 19);
INSERT INTO `order_promotions` VALUES (9, 50000.00, 'SALE10P5934', 20);
INSERT INTO `order_promotions` VALUES (10, 6000.00, 'CATE10PC790', 22);

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('CANCELLED','CONFIRMED','DELIVERED','PENDING','SHIPPING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(12, 2) NOT NULL,
  `updated_at` datetime(6) NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `shipping_fee` decimal(12, 2) NULL DEFAULT NULL,
  `estimated_delivery_time_from` datetime(6) NULL DEFAULT NULL,
  `estimated_delivery_time_to` datetime(6) NULL DEFAULT NULL,
  `order_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paid_at` datetime(6) NULL DEFAULT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `discount_amount` decimal(12, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKdhk2umg8ijjkg4njg6891trit`(`order_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 02:02:19.000000', '', '0123456789', 'Chan Chan', 'PENDING', 2090953.00, NULL, 2, 49953.00, NULL, NULL, 'DH20260517090219', NULL, 'cod', NULL);
INSERT INTO `orders` VALUES (2, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 02:49:53.000000', '', '0123456789', 'Chan Chan', 'PENDING', 100000.00, NULL, 2, 21001.00, NULL, NULL, 'DH20260517094953', NULL, 'cod', NULL);
INSERT INTO `orders` VALUES (3, 'Hùng Vương, Thị trấn Gò Dầu, Huyện Gò Dầu, Tây Ninh', '2026-05-17 02:55:15.000000', 'Đóng gói cẩn thận giúp mình với shop ak.Thanksss<3', '012345678', 'Maya', 'PENDING', 100000.00, NULL, 2, 41501.00, NULL, NULL, 'DH20260517095515', NULL, 'cod', NULL);
INSERT INTO `orders` VALUES (4, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 03:00:40.000000', '', '0123456789', 'Chan Chan', 'PENDING', 100000.00, NULL, 2, 0.00, '2026-05-18 03:00:40.000000', '2026-05-19 03:00:40.000000', 'DHMG-20260517100040', NULL, 'cod', NULL);
INSERT INTO `orders` VALUES (5, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 03:41:27.000000', '', '0123456789', 'Chan Chan', 'PENDING', 100000.00, NULL, 2, 0.00, '2026-05-18 03:41:27.000000', '2026-05-19 03:41:27.000000', 'DHMG-20260517104127', NULL, 'cod', NULL);
INSERT INTO `orders` VALUES (6, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 04:01:23.000000', '', '0123456789', 'Chan Chan', 'PENDING', 140000.00, NULL, 2, 0.00, '2026-05-18 04:01:23.000000', '2026-05-19 04:01:23.000000', 'DHMG-20260517110123', NULL, 'cod', NULL);
INSERT INTO `orders` VALUES (7, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 05:33:39.000000', '', '0123456789', 'Chan Chan', 'PENDING', 100000.00, NULL, 2, 0.00, '2026-05-18 05:33:39.000000', '2026-05-19 05:33:39.000000', 'DHMG-20260517123339', NULL, 'cod', 0.00);
INSERT INTO `orders` VALUES (8, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 06:09:35.000000', '', '0123456789', 'Chan', 'PENDING', 103999.00, NULL, 2, 53999.00, '2026-05-20 06:09:35.000000', '2026-05-22 06:09:35.000000', 'DHMG-20260517130935', NULL, 'cod', 0.00);
INSERT INTO `orders` VALUES (9, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 06:10:08.000000', '', '0123456789', 'Chan', 'PENDING', 103999.00, NULL, 2, 53999.00, '2026-05-20 06:10:08.000000', '2026-05-22 06:10:08.000000', 'DHMG-20260517131008', NULL, 'cod', 0.00);
INSERT INTO `orders` VALUES (10, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 06:12:55.000000', '', '0123456789', 'Chan Chan', 'CANCELLED', 71001.00, '2026-05-17 06:46:59.000000', 2, 21001.00, '2026-05-18 06:12:55.000000', '2026-05-19 06:12:55.000000', 'DHMG-20260517131255', NULL, 'COD', 0.00);
INSERT INTO `orders` VALUES (11, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 06:15:28.000000', '', '0123456789', 'Chan', 'CONFIRMED', 340000.00, NULL, 2, 0.00, '2026-05-20 06:15:28.000000', '2026-05-22 06:15:28.000000', 'DHMG-20260517131528', NULL, 'COD', 0.00);
INSERT INTO `orders` VALUES (12, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 06:18:26.000000', '', '0123456789', 'Chan', 'CANCELLED', 100000.00, '2026-05-17 06:37:39.000000', 2, 0.00, '2026-05-20 06:18:26.000000', '2026-05-22 06:18:26.000000', 'DHMG-20260517131826', NULL, 'COD', 0.00);
INSERT INTO `orders` VALUES (13, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 06:21:41.000000', '', '0123456789', 'Chan', 'CANCELLED', 0.00, '2026-05-17 06:36:52.000000', 2, 0.00, '2026-05-20 06:21:41.000000', '2026-05-22 06:21:41.000000', 'DHMG-20260517132141', NULL, 'COD', 0.00);
INSERT INTO `orders` VALUES (14, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 07:33:00.000000', '', '0123456789', 'Chan', 'PENDING', 96749.00, NULL, 2, 53999.00, '2026-05-20 07:33:00.000000', '2026-05-22 07:33:00.000000', 'DHMG-20260517143300', NULL, 'COD', 2250.00);
INSERT INTO `orders` VALUES (15, 'Hùng Vương, Thị trấn Gò Dầu, Huyện Gò Dầu, Tây Ninh', '2026-05-17 07:40:22.000000', '', '012345678', 'Maya', 'PENDING', 84251.00, NULL, 2, 41501.00, '2026-05-20 07:40:22.000000', '2026-05-22 07:40:22.000000', 'DHMG-20260517144022', NULL, 'COD', 2250.00);
INSERT INTO `orders` VALUES (16, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 07:40:30.000000', '', '0123456789', 'Chan Chan', 'PENDING', 66001.00, NULL, 2, 21001.00, '2026-05-18 07:40:30.000000', '2026-05-19 07:40:30.000000', 'DHMG-20260517144030', NULL, 'COD', 0.00);
INSERT INTO `orders` VALUES (17, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 07:46:59.000000', '', '0123456789', 'Chan Chan', 'PENDING', 66001.00, NULL, 2, 21001.00, '2026-05-18 07:46:59.000000', '2026-05-19 07:46:59.000000', 'DHMG-20260517144659', NULL, 'COD', 0.00);
INSERT INTO `orders` VALUES (18, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 07:47:10.000000', '', '0123456789', 'Chan Chan', 'PENDING', 66001.00, NULL, 2, 21001.00, '2026-05-18 07:47:10.000000', '2026-05-19 07:47:10.000000', 'DHMG-20260517144710', NULL, 'COD', 0.00);
INSERT INTO `orders` VALUES (19, 'Đường số 6, Phường Linh Trung, Quận Thủ Đức, Hồ Chí Minh', '2026-05-17 07:56:25.000000', '', '0123456789', 'Chan Chan', 'PENDING', 63751.00, NULL, 2, 21001.00, '2026-05-18 07:56:25.000000', '2026-05-19 07:56:25.000000', 'DHMG-20260517145625', NULL, 'COD', 2250.00);
INSERT INTO `orders` VALUES (20, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 07:57:07.000000', '', '0123456789', 'Chan', 'PENDING', 1888247.00, NULL, 2, 88247.00, '2026-05-20 07:57:07.000000', '2026-05-22 07:57:07.000000', 'DHMG-20260517145707', NULL, 'COD', 50000.00);
INSERT INTO `orders` VALUES (21, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 14:35:54.000000', '', '0123456789', 'Chan', 'CANCELLED', 123999.00, '2026-05-17 14:42:46.000000', 2, 53999.00, '2026-05-20 14:35:54.000000', '2026-05-22 14:35:54.000000', 'DHMG-20260517213554', NULL, 'COD', 0.00);
INSERT INTO `orders` VALUES (22, 'Đường số 7, Xã Cán Cấu, Huyện Si Ma Cai, Lào Cai', '2026-05-17 15:44:27.000000', '', '0123456789', 'Chan', 'PENDING', 107999.00, NULL, 2, 53999.00, '2026-05-20 15:44:27.000000', '2026-05-22 15:44:27.000000', 'DHMG-20260517224427', NULL, 'COD', 6000.00);

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(12, 2) NOT NULL,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `method` enum('COD','VNPAY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('FAILED','PENDING','REFUNDED','SUCCESS') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `order_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK81gagumt0r8y3rmudcgpbk42l`(`order_id` ASC) USING BTREE,
  CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of payments
-- ----------------------------

-- ----------------------------
-- Table structure for product_details
-- ----------------------------
DROP TABLE IF EXISTS `product_details`;
CREATE TABLE `product_details`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `light` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `origin` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `pot_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `size` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `temperature` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `water` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `weight` double NULL DEFAULT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKd8itpicgj364s8ud8ge17m4qe`(`product_id` ASC) USING BTREE,
  CONSTRAINT `FKnfvvq3meg4ha3u1bju9k4is3r` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 51 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_details
-- ----------------------------
INSERT INTO `product_details` VALUES (1, 'Ưa sáng, thích hợp đặt ở nơi thoáng mát và có nhiều nắng.', ' Tránh ánh nắng gắt trực tiếp vì có thể làm nhạt màu lá hoặc gây rụng lá; không nên tưới nước trực tiếp lên lá để tránh làm mất lớp phấn và gây thối lá. ', 'Mexico và vùng Tây Bắc Nam Mỹ', 'Chậu gốm', '10 cm', '15-25', '1 - 2 lần/tuần', 0.3, 1);
INSERT INTO `product_details` VALUES (2, 'Ưa ánh sáng gián tiếp hoặc ánh sáng từ đèn LED chuyên dụng', ' Không nên tưới quá nhiều gây đọng nước dưới đáy bình vì không có lỗ thoát nước, dễ làm úng rễ và mốc rêu.', 'Việt Nam', 'Bình thủy tinh', '12 - 15 cm', '18 - 28', '2 - 3 lần/tuần', 0.8, 2);
INSERT INTO `product_details` VALUES (3, 'Ưa bóng râm bán phần, thích hợp trồng trong nhà, văn phòng', 'Tất cả các bộ phận của cây đều có chứa canxi oxalat, có thể gây độc nhẹ nếu thú cưng hoặc trẻ em nuốt phải.', 'Các khu rừng nhiệt đới tại Trung và Nam Mỹ', 'Chậu sứ', '30 - 60 cm', '18 - 30', '1 - 2 lần/tuần', 3, 3);
INSERT INTO `product_details` VALUES (4, 'Ưa sáng mạnh', 'Loài này rất dễ rụng lá khi chạm mạnh, nhưng mỗi lá rụng đều có khả năng tự mọc thành cây mới cực kỳ nhanh.', 'Mexico', 'Chậu đất nung', '5 - 13 cm', '15 - 28', '1 lần/tuần', 0.2, 4);
INSERT INTO `product_details` VALUES (5, 'Ưa nắng toàn phần', 'Lá cây rất nhỏ và dễ rụng nếu bị va chạm mạnh. Tránh để cây ở nơi ẩm thấp thiếu sáng vì cây sẽ bị thối nhũn rất nhanh.', 'Mexico', 'Chậu nhựa', '5 - 10 cm', '15 - 28', '1 lần/tuần', 0.2, 5);
INSERT INTO `product_details` VALUES (6, 'Ưa ánh sáng tán xạ, bóng râm bán phần.', 'Cây có thể bị thối rễ nếu tưới quá nhiều nước đọng ở đáy chậu. Tránh va chạm mạnh vì lá mọng nước dễ bị rụng.', 'Các khu vực nhiệt đới Đông Nam Á', 'Chậu sứ', '10 - 30', '18 - 30', '2 - 3 lần/tuần', 0.8, 6);
INSERT INTO `product_details` VALUES (7, 'Ưa nắng mạnh', 'Không nên chạm tay trực tiếp vào lá để tránh làm mất lớp phấn trắng bảo vệ cây. Không để nước đọng ở tim lá.', 'Mexico', 'Chậu nhựa', '5 - 8 cm', '15 - 28', '1 lần/tuần', 0.2, 7);
INSERT INTO `product_details` VALUES (8, 'Ưa ánh sáng tán xạ nhẹ hoặc đèn LED chuyên dụng cho cây', 'Không nên mở nắp quá thường xuyên để duy trì độ ẩm tự nhiên bên trong. Nếu bình bị đọng hơi nước quá dày làm mờ kính, hãy mở nắp khoảng 15-30 phút cho bay bớt hơi.', 'Việt Nam', 'Bình thủy tinh', '20 cm', '18 - 26', '1 - 2 tháng/lần', 4, 8);
INSERT INTO `product_details` VALUES (9, 'Ưa sáng mạnh nhưng chịu được bóng râm tốt hơn các loại có phấn.', 'Tuy ít bị mất phấn khi chạm vào nhưng cây vẫn rất sợ úng. Tránh tưới nước vào giữa tâm lá để phòng thối nhũn.', 'Mexico', 'Chậu nhựa', '6 - 10 cm', '15 - 28', '1 lần/tuần', 0.2, 9);
INSERT INTO `product_details` VALUES (10, 'Ưa ánh sáng tán xạ, bóng râm bán phần', 'Cây có chứa tinh thể canxi oxalat, có thể gây ngứa hoặc kích ứng nhẹ nếu nuốt phải, nên để xa tầm tay trẻ em và thú cưng.', 'Các vùng nhiệt đới châu Á (Thái Lan, Indonesia)', 'Chậu sứ', '20 - 30 cm', '18 - 30', '2 - 3 lần/tuần', 1.2, 10);
INSERT INTO `product_details` VALUES (11, 'Ưa ánh sáng tán xạ nhẹ hoặc đèn LED chuyên dụng (6-8 tiếng/ngày)', 'Không nên tưới quá nhiều nước gây ngập úng đáy bình vì không có lỗ thoát nước. Nếu rêu có dấu hiệu bị mốc, cần mở nắp để lưu thông không khí và điều chỉnh lượng nước.', 'Việt Nam', 'Bình thủy tinh', '15 - 30 cm', '18 - 26', '1 - 2 lần/tháng', 4.5, 11);
INSERT INTO `product_details` VALUES (12, 'Ưa sáng mạnh và nắng trực tiếp (4-6 tiếng/ngày)', 'Tuyệt đối không chạm tay vào lá vì sẽ làm mất lớp phấn trắng (lớp phấn này không tái tạo được). Tránh để nước đọng ở tim lá vì rất dễ gây thối nhũn.', 'Các vùng bán sa mạc ở Mexico', 'Chậu sứ', '6 - 10 cm', '15 - 28', '1 lần/tuần', 0.5, 12);
INSERT INTO `product_details` VALUES (13, 'Ưa bóng râm bán phần hoặc ánh sáng tán xạ dịu nhẹ', 'Đây là loài cây \"biết hờn dỗi\". Nếu thiếu nước, cây sẽ héo rũ rất nhanh trông như đã chết, nhưng chỉ cần tưới nước lại sau vài tiếng cây sẽ đứng thẳng và tươi tỉnh trở lại.', 'Các khu rừng mưa nhiệt đới ở Nam Mỹ (Peru)', 'Chậu gốm', '5 - 12 cm', '18 - 27', 'Hằng ngày', 0.6, 13);
INSERT INTO `product_details` VALUES (14, 'Ưa nắng mạnh', 'Tránh tưới nước vào buổi trưa nắng gắt vì dễ làm lá bị \"luộc\" chín hoặc để lại vết thâm trên lá mọng.', 'Mexico', 'Chậu sứ', '5 - 10 cm', '15 - 28', '1 lần/tuần', 0.5, 14);
INSERT INTO `product_details` VALUES (15, 'Ưa sáng mạnh, nắng tán xạ', 'Tránh để nước đọng lâu ngày trong các kẽ lá vì cụm cây mọc rất dày, nước khó thoát dễ gây thối nhũn lan sang các đầu cây khác.', 'Mexico', 'Chậu nhựa', '8 - 12 cm', '15 - 25', '1 lần/tuần', 0.4, 15);
INSERT INTO `product_details` VALUES (16, 'Từ nơi thiếu sáng (văn phòng) đến nơi có ánh sáng tán xạ mạnh', 'Sai lầm lớn nhất khi chăm sóc loại này là tưới quá nhiều. Cây rất dễ bị thối gốc nếu đất luôn trong tình trạng ẩm ướt.', 'Thái Lan', 'Chậu sứ', '12 - 18 cm', '18 - 30', '10 - 15 ngày/lần', 0.8, 16);
INSERT INTO `product_details` VALUES (17, 'Ưa ánh sáng tán xạ hoặc đèn LED chuyên dụng', 'Không đặt bình ở nơi có nhiệt độ thay đổi đột ngột. Nếu hơi nước bám quá dày làm mờ kính, hãy mở nắp khoảng 20 phút để cân bằng lại độ ẩm.', 'Việt Nam', 'Bình thủy tinh', '25 - 45 cm', '18 - 26', '1 - 2 tháng/lần', 5.3, 17);
INSERT INTO `product_details` VALUES (18, 'Ưa ánh sáng tán xạ mạnh', 'Tuy dễ chăm nhưng cây cực kỳ sợ úng. Tránh tưới quá nhiều làm nước đọng lại ở bẹ lá phía sát gốc vì sẽ gây thối rễ.', 'Nam Phi', 'Chậu nhựa', '5 - 8 cm', '18 - 30', '7 - 10 ngày/lần', 0, 18);
INSERT INTO `product_details` VALUES (19, 'Ưa ánh sáng khuếch tán mạnh hoặc nắng nhẹ', 'Khi hoa tàn, nên cắt bỏ cuống hoa để cây tập trung dinh dưỡng nuôi lá và chuẩn bị cho đợt hoa tiếp theo. Tránh tưới nước trực tiếp lên cánh hoa vì dễ làm hoa nhanh thối.', 'Madagascar', 'Chậu gốm sứ', '15 - 20 cm', '18 - 30', '2 - 3 lần/tuần', 0.8, 19);
INSERT INTO `product_details` VALUES (20, 'Ưa nắng mạnh', 'Không nên tưới nước trực tiếp lên lá vào buổi trưa nắng vì dễ gây cháy lá hoặc thối nhũn do đọng nước.', 'Mexico', 'Chậu sứ', '8 - 12 cm', '15 - 28', '1 lần/tuần', 0.6, 20);
INSERT INTO `product_details` VALUES (21, 'Ưa ánh sáng tán xạ mạnh hoặc đèn LED chuyên dụng', 'Cần cắt tỉa các cành Bonsai định kỳ để giữ đúng form dáng ban đầu và không làm cây mọc quá cao chạm đỉnh bình.', 'Việt Nam', 'Bình thủy tinh', '20 cm', '18 - 28', '2 - 3 tuần/lần', 4.5, 21);
INSERT INTO `product_details` VALUES (22, 'Ưa ánh sáng tán xạ, gián tiếp', ' Cây an toàn cho thú cưng (chó, mèo). Tránh để nước đọng lâu trên lá vì các lông mịn li ti trên mặt lá có thể giữ nước gây thối lá.', 'Trung Quốc, Nhật Bản', 'Chậu sứ', '5 - 10 cm', '18 - 26', '2 - 3 ngày/lần', 0.3, 22);
INSERT INTO `product_details` VALUES (23, 'Ưa ánh sáng tán xạ mạnh hoặc nắng nhẹ', 'Loài này có giai đoạn ngủ đông vào mùa hè nắng nóng. Lúc này, các lá sẽ cuộn chặt lại như nụ hoa hồng để bảo vệ tâm cây. Khi đó cần hạn chế tưới nước tối đa.', 'Tây Ban Nha', 'Chậu sứ', '15 - 20 cm', '15 - 25', '1 lần/tuần', 0.8, 23);
INSERT INTO `product_details` VALUES (24, 'Chịu được bóng râm tốt', 'Tất cả các bộ phận của cây đều có chứa canxi oxalat, có thể gây kích ứng da hoặc niêm mạc nếu trẻ em hoặc thú cưng nhai phải.', 'Vùng Đông Phi', 'Chậu sứ', '35 - 50 cm', '18 - 30', '10 - 15 ngày/lần', 2.5, 24);
INSERT INTO `product_details` VALUES (25, 'Ưa ánh sáng tán xạ nhẹ hoặc bóng râm bán phần', 'Nếu lá có dấu hiệu xẹp lại hoặc mất độ căng bóng, đó là lúc cây đang thiếu nước hoặc độ ẩm môi trường quá thấp.', 'Nam Phi', 'Chậu nhựa', '3 - 5 cm', '18 - 28', '7 - 10 ngày/lần', 0.1, 25);
INSERT INTO `product_details` VALUES (26, ' Tránh ánh nắng gắt trực tiếp vào buổi trưa.', 'Tránh va đập mạnh khi vận chuyển. Không để cây ở nơi quá ẩm hoặc thiếu ánh sáng trong thời gian dài. Hạn chế tưới nước lên lá để tránh úng, thối cây.', 'Nga', 'Thủy tinh', 'Chiều cao tổng thể khoảng 15–20cm (bao gồm chậu và cây).', '18–25°C', 'Tưới 2 lần/tuần', 1.5, 28);
INSERT INTO `product_details` VALUES (27, 'Ánh sáng gián tiếp, tránh nắng gắt trực tiếp.', 'Không để cây dưới nắng gắt hoặc nơi quá lạnh. Tránh tưới quá nhiều gây úng rễ.', 'Đà Lạt', 'Chậu sứ / nhựa có lỗ thoát nước.', '15–25cm', '18–30°C', '2–3 lần/tuần, giữ đất ẩm nhẹ.', 0.8, 29);
INSERT INTO `product_details` VALUES (28, 'Ánh sáng gián tiếp hoặc nắng bán phần nhẹ, thích hợp gần cửa sổ hoặc nơi có ánh sáng tự nhiên.', 'Không nên đặt dưới nắng gắt trực tiếp.\nCó thể lau lá bằng khăn ẩm để lá xanh bóng đẹp hơn.\nNếu trồng thủy sinh nên thay nước khoảng 1 lần/tuần.', 'Đà Lạt', 'Gốm, sứ, nhựa cao cấp', '15–25cm', '18–30°C', '2–3 lần/tuần', 1.1, 30);
INSERT INTO `product_details` VALUES (29, 'Ưa nắng nhẹ buổi sáng hoặc ánh sáng tự nhiên gián tiếp.', 'ránh để cây dưới mưa lớn liên tục.\nKhông tưới trực tiếp lên hoa vào buổi tối.\nKiểm tra sâu bệnh định kỳ để cây phát triển tốt hơn.', 'Đà Lạt', 'Chậu gốm, sứ, xi măng mini hoặc nhựa cao cấp', '20–30cm', '18–28°C', '1 lần/ngày', 1.5, 32);
INSERT INTO `product_details` VALUES (30, 'Ưa ánh sáng tự nhiên nhẹ hoặc nắng buổi sáng. Nên đặt gần cửa sổ hoặc nơi thông thoáng.', 'Không nên đặt cây dưới nắng gắt buổi trưa.\nHạn chế tưới trực tiếp lên hoa để tránh nhanh úng cánh.\nXoay chậu định kỳ để cây phát triển đều các hướng.', 'Đà Lạt', 'Chậu gốm, sứ, nhựa mini hoặc chậu xi măng decor', '15-30cm', '18-27°C', '1 lần/ngày', 1.3, 33);
INSERT INTO `product_details` VALUES (31, 'Ưa ánh sáng tự nhiên nhẹ hoặc nắng buổi sáng. Tránh ánh nắng gắt trực tiếp vào buổi trưa.', 'Tránh đặt cây nơi quá nóng hoặc ánh nắng trực tiếp kéo dài.\nKhông tưới nước lên cánh hoa vào buổi tối.\nNên đặt nơi thoáng mát để hoa nở bền hơn.', 'Đà Lạt', 'Chậu gốm, sứ trắng, thủy tinh hoặc chậu decor tối giản', '15–25cm', '15–22°C', '2–3 lần/tuần', 1.2, 34);
INSERT INTO `product_details` VALUES (32, 'Ưa ánh sáng tự nhiên nhẹ hoặc nắng buổi sáng. Tránh ánh nắng gắt trực tiếp vào buổi trưa.', 'Tránh đặt cây nơi quá nóng hoặc ánh nắng trực tiếp kéo dài.\nKhông tưới nước lên cánh hoa vào buổi tối.\nNên đặt nơi thoáng mát để hoa nở bền hơn.', 'Đà Lạt', 'Chậu gốm, sứ trắng, thủy tinh hoặc chậu decor tối giản', '15–25cm', '15–22°C', '2–3 lần/tuần', 1.2, 35);
INSERT INTO `product_details` VALUES (33, 'Ưa ánh sáng tự nhiên nhẹ hoặc nắng buổi sáng', 'Tránh đặt cây nơi quá nóng hoặc ánh nắng trực tiếp kéo dài. Không tưới nước lên cánh hoa vào buổi tối. Nên đặt nơi thoáng mát để hoa nở bền hơn.', 'Đà Lạt', 'Chậu gốm, sứ trắng, thủy tinh hoặc chậu decor tối giản', '15–25cm', '15–22°C', '2–3 lần/tuần', 1.2, 36);
INSERT INTO `product_details` VALUES (34, 'Ưa ánh sáng tự nhiên nhẹ hoặc nắng buổi sáng.', 'Không nên tưới trực tiếp lên cánh hoa vào buổi tối.\nTránh đặt cây dưới nắng gắt giữa trưa.\nXoay chậu định kỳ để cây phát triển đều các hướng.', 'Đà Lạt', 'Chậu gốm, sứ, xi măng mini hoặc nhựa decor', '15–25cm', '18–27°C', '1 lần/ngày', 1.3, 37);
INSERT INTO `product_details` VALUES (35, 'Ánh sáng gián tiếp, tránh nắng gắt trực tiếp.', 'Không để cây dưới nắng gắt hoặc nơi quá lạnh. Tránh tưới quá nhiều gây úng rễ.', 'Đà Lạt', 'Chậu sứ / nhựa có lỗ thoát nước.', '20 - 30 cm', '18–30°C', '2–3 lần/tuần, giữ đất ẩm nhẹ.', 1.4, 38);
INSERT INTO `product_details` VALUES (36, 'Ánh sáng gián tiếp hoặc nắng nhẹ buổi sáng', 'Không tưới quá nhiều nước.\nTránh ánh nắng gắt trực tiếp giữa trưa.\nNên treo nơi thoáng khí để dây rủ đẹp hơn.', 'Đà Lạt', 'Chậu treo gốm, sứ, nhựa decor hoặc macrame treo', 'Khoảng 30–100cm', '18–30°C', '1–2 lần/tuần', 1, 39);
INSERT INTO `product_details` VALUES (37, 'Ánh sáng gián tiếp hoặc nơi có bóng râm nhẹ.', 'Không để cây dưới nắng gắt trực tiếp quá lâu.\nTránh để đất khô hoàn toàn trong nhiều ngày.\nNên treo nơi thoáng khí để cây phát triển tự nhiên và lá rủ đẹp hơn.', 'Đà Lạt', 'Chậu treo gốm, nhựa treo, macrame hoặc giỏ mây decor.', '30–70cm', '18–28°C', '3–4 lần/tuần', 2.3, 40);
INSERT INTO `product_details` VALUES (38, 'Ưa ánh sáng gián tiếp hoặc bóng râm nhẹ.', 'Tránh nắng gắt trực tiếp làm cháy lá.\nKhông để đất quá khô trong thời gian dài.\nCó thể xoay chậu để dây leo phát triển đều và đẹp hơn.', 'Đà Lạt', 'Chậu treo gốm, nhựa treo, macrame hoặc giỏ mây', '30–70cm', '15–28°C', '2 - 3 lần/tuần', 2, 41);
INSERT INTO `product_details` VALUES (39, 'Ưa ánh sáng gián tiếp hoặc bán phần', 'Tránh nắng gắt trực tiếp gây cháy lá.\nKhông để đất quá ẩm lâu ngày.\nLau lá định kỳ để giữ màu lá bóng đẹp hơn.', 'Đà Lạt', 'Chậu treo gốm, nhựa treo, macrame hoặc chậu thủy tinh', '30–120cm', '18–30°C', '2 - 3 lần/tuần', 1.5, 42);
INSERT INTO `product_details` VALUES (40, 'Ưa ánh sáng gián tiếp hoặc nắng nhẹ buổi sáng.', 'Không để cây ở nơi quá ẩm hoặc bí khí.\nTránh ánh nắng trực tiếp kéo dài.\nKhông tưới quá nhiều nước vì cây dễ bị úng.', 'Nam Mỹ', 'Chậu treo nhỏ, chậu gốm mini, chậu nhựa hoặc chậu thủy tinh decor', '20–80cm', '18–28°C', '1-2 lần/tuần', 1, 43);
INSERT INTO `product_details` VALUES (41, 'Cần ánh sáng mạnh nhưng gián tiếp (ánh sáng tự nhiên nhiều).', 'Không trồng trong đất.\nKhông để rễ bị úng nước lâu.\nCần độ thoáng khí cao để rễ không bị thối.', 'Đà Lạt', 'Chậu treo thoáng (giỏ gỗ, giỏ nhựa thoáng)', '20-60cm', '20–32°C', '2 - 3 lần/tuần', 1.2, 44);
INSERT INTO `product_details` VALUES (42, 'Ưa ánh sáng gián tiếp sáng hoặc bán phần', 'Không để thiếu sáng lâu (lá sẽ ít lỗ hơn).\nKhông tưới quá nhiều gây thối rễ.\nNên có giá đỡ hoặc để rủ tự nhiên để đẹp hơn.', 'Đà Lạt', 'Chậu treo gốm, nhựa, macrame hoặc giỏ tre thoáng khí', '30–70cm', '18–30°C', '2–3 lần/tuần', 1.3, 45);
INSERT INTO `product_details` VALUES (43, 'Ưa ánh sáng gián tiếp sáng.', 'Không tưới quá nhiều nước (dễ úng rễ).\nCần ánh sáng đủ để ra hoa.\nKhông thích di chuyển vị trí liên tục.', 'Đà Lạt', 'Chậu treo gốm, nhựa, macrame hoặc giỏ tre thoáng khí', '30–70cm', '18–30°C', '1-2 lần/tuần', 2, 46);
INSERT INTO `product_details` VALUES (44, 'Ưa ánh sáng gián tiếp sáng', 'Không tưới quá nhiều nước (dễ úng rễ).\nCần ánh sáng đủ để ra hoa.\nKhông thích di chuyển vị trí liên tục.', 'Đông Nam Á', 'Chậu treo gốm, nhựa, macrame hoặc giỏ tre thoáng khí', '30–70cm', '18–30°C', '1-2 lần/tuần', 1.4, 47);
INSERT INTO `product_details` VALUES (45, 'Ưa ánh sáng gián tiếp sáng hoặc nắng nhẹ buổi sáng.', 'Thiếu sáng → lá bị xanh nhạt, mất màu tím.\nCây phát triển rất nhanh nên cần tỉa thường xuyên.\nKhông để đất quá khô lâu ngày.', 'Trung - Nam Mỹ', 'Chậu treo gốm, nhựa, macrame hoặc giỏ tre', '30–70cm', '18–30°C', '2–3 lần/tuần', 1.1, 48);
INSERT INTO `product_details` VALUES (46, 'Ưa ánh sáng gián tiếp hoặc bóng râm nhẹ.', 'Không để đất bị úng nước lâu.\nTránh nắng trực tiếp mạnh.\nCần chậu thoát nước tốt.', 'Trung và Nam Mỹ', 'Chậu treo thoáng khí (gốm, nhựa, giỏ mây hoặc macrame)', '30–70cm', '18–30°C', '1-2 lần/tuần', 1.5, 49);
INSERT INTO `product_details` VALUES (47, 'Cần nắng trực tiếp (càng nắng càng nở nhiều hoa)', 'Thiếu nắng → cây ít hoặc không ra hoa.\nKhông chịu được môi trường râm lâu ngày.\nCàng nắng càng đẹp 🌞', 'Việt Nam', 'Chậu treo, chậu ban công, chậu đất thấp hoặc giỏ mây', '10-25cm', '20–35°C', '2–3 lần/tuần', 1, 50);
INSERT INTO `product_details` VALUES (48, 'Ưa ánh sáng gián tiếp, sáng nhẹ.', 'Không chịu nắng gắt trực tiếp.\nTránh tưới quá nhiều gây thối rễ.\nCần độ ẩm ổn định để hoa bền.', 'Đà Lạt', 'Chậu gốm, chậu sứ trắng, chậu decor nội thất hoặc chậu tự tưới', '20–30cm', '18–28°C', '2–3 lần/tuần', 1.4, 51);
INSERT INTO `product_details` VALUES (49, 'Ưa ánh sáng mạnh, có thể chịu nắng trực tiếp nhẹ.', 'Không để trong bóng râm lâu ngày.\nKhông tưới quá nhiều (dễ thối rễ).\nCần ánh nắng để ra hoa đẹp.', 'Đà Lạt', 'Chậu gốm, chậu nhựa nhỏ', '15–25cm', '18–32°C', '1-2 lần/tuần', 0.8, 52);
INSERT INTO `product_details` VALUES (50, 'Ưa ánh sáng gián tiếp sáng, tránh nắng gắt trực tiếp vì dễ làm cháy cánh hoa.', 'Không tưới quá nhiều nước (dễ thối rễ lan).\nKhông đặt nơi gió lạnh hoặc nắng gắt.\nCần chậu thoát nước tốt và giá thể thoáng.', 'Việt Nam', 'Chậu sứ, chậu thủy tinh, chậu nhựa trong hoặc chậu decor cao cấp', '30–70cm', '18–28°C', '1-2 lần/tuần', 2, 53);

-- ----------------------------
-- Table structure for product_favorites
-- ----------------------------
DROP TABLE IF EXISTS `product_favorites`;
CREATE TABLE `product_favorites`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKaeio5gmhk53yb0vug1gs3cs6s`(`user_id` ASC, `product_id` ASC) USING BTREE,
  INDEX `FKpkyejd2ayy5cedwdmsanhxeg8`(`product_id` ASC) USING BTREE,
  CONSTRAINT `FKpkyejd2ayy5cedwdmsanhxeg8` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_favorites
-- ----------------------------

-- ----------------------------
-- Table structure for product_images
-- ----------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` bit(1) NOT NULL,
  `public_id` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NULL DEFAULT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKqnq71xsohugpqwf3c9gxmsuy`(`product_id` ASC) USING BTREE,
  CONSTRAINT `FKqnq71xsohugpqwf3c9gxmsuy` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 119 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_images
-- ----------------------------
INSERT INTO `product_images` VALUES (1, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776992910/minigarden/products/zxtfl1doyunq6korsocm.jpg', b'1', 'minigarden/products/zxtfl1doyunq6korsocm', 1, 1);
INSERT INTO `product_images` VALUES (2, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776992912/minigarden/products/vc59gt0qyq1nn13ouwpr.jpg', b'0', 'minigarden/products/vc59gt0qyq1nn13ouwpr', 2, 1);
INSERT INTO `product_images` VALUES (3, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776993087/minigarden/products/rslfz7bw8bec0aksm5pv.jpg', b'1', 'minigarden/products/rslfz7bw8bec0aksm5pv', 1, 2);
INSERT INTO `product_images` VALUES (4, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776993273/minigarden/products/v12nwio2uwbb9hl2fzm2.jpg', b'1', 'minigarden/products/v12nwio2uwbb9hl2fzm2', 1, 3);
INSERT INTO `product_images` VALUES (5, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776993274/minigarden/products/fcfakhbnggg4ullmy6sv.jpg', b'0', 'minigarden/products/fcfakhbnggg4ullmy6sv', 2, 3);
INSERT INTO `product_images` VALUES (6, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776993452/minigarden/products/yzwy4gfp1ber5m0n9nqj.webp', b'1', 'minigarden/products/yzwy4gfp1ber5m0n9nqj', 1, 4);
INSERT INTO `product_images` VALUES (7, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776993608/minigarden/products/we9k3kfqhaw3nttitmzu.webp', b'1', 'minigarden/products/we9k3kfqhaw3nttitmzu', 1, 5);
INSERT INTO `product_images` VALUES (8, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776993611/minigarden/products/m2uigtiyyuuleltivkvt.jpg', b'0', 'minigarden/products/m2uigtiyyuuleltivkvt', 2, 5);
INSERT INTO `product_images` VALUES (9, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776993878/minigarden/products/xbsmczdgzrdijdorqn9j.jpg', b'1', 'minigarden/products/xbsmczdgzrdijdorqn9j', 1, 6);
INSERT INTO `product_images` VALUES (11, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994067/minigarden/products/k0twx8x4yzatkczgovau.webp', b'1', 'minigarden/products/k0twx8x4yzatkczgovau', 1, 7);
INSERT INTO `product_images` VALUES (12, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994070/minigarden/products/d52bcoa9tcquj2trjtou.webp', b'0', 'minigarden/products/d52bcoa9tcquj2trjtou', 2, 7);
INSERT INTO `product_images` VALUES (13, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994223/minigarden/products/pnflfdix1otg5kx5f4ph.png', b'1', 'minigarden/products/pnflfdix1otg5kx5f4ph', 1, 8);
INSERT INTO `product_images` VALUES (14, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994226/minigarden/products/reyaxzzwkjx4riwed7nj.png', b'0', 'minigarden/products/reyaxzzwkjx4riwed7nj', 2, 8);
INSERT INTO `product_images` VALUES (15, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994231/minigarden/products/h5soq3wze9nyudhbtxiu.png', b'0', 'minigarden/products/h5soq3wze9nyudhbtxiu', 3, 8);
INSERT INTO `product_images` VALUES (16, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994234/minigarden/products/zzbsq0zrzwg9fliuljwe.png', b'0', 'minigarden/products/zzbsq0zrzwg9fliuljwe', 4, 8);
INSERT INTO `product_images` VALUES (17, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994238/minigarden/products/lnnlmgyqm8wdbatbg13y.png', b'0', 'minigarden/products/lnnlmgyqm8wdbatbg13y', 5, 8);
INSERT INTO `product_images` VALUES (18, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994381/minigarden/products/xbekmra4pcnlx7u5u8cb.jpg', b'1', 'minigarden/products/xbekmra4pcnlx7u5u8cb', 1, 9);
INSERT INTO `product_images` VALUES (19, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994567/minigarden/products/te6oaleziutmz2kmvxaa.webp', b'1', 'minigarden/products/te6oaleziutmz2kmvxaa', 1, 10);
INSERT INTO `product_images` VALUES (20, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994882/minigarden/products/fwwwumfietiyzyvyswbi.png', b'1', 'minigarden/products/fwwwumfietiyzyvyswbi', 1, 11);
INSERT INTO `product_images` VALUES (21, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994885/minigarden/products/qgjtrlklggtwl9hivagj.png', b'0', 'minigarden/products/qgjtrlklggtwl9hivagj', 2, 11);
INSERT INTO `product_images` VALUES (22, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776994888/minigarden/products/vyfmjokdlqlpvxveikpq.png', b'0', 'minigarden/products/vyfmjokdlqlpvxveikpq', 3, 11);
INSERT INTO `product_images` VALUES (23, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776995276/minigarden/products/bfgtytafrdeldtfuoox6.webp', b'1', 'minigarden/products/bfgtytafrdeldtfuoox6', 1, 12);
INSERT INTO `product_images` VALUES (24, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776995278/minigarden/products/pkvzlpb9mkr7w73mhwb9.webp', b'0', 'minigarden/products/pkvzlpb9mkr7w73mhwb9', 2, 12);
INSERT INTO `product_images` VALUES (25, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776995600/minigarden/products/l9wtyppaqyzjgqzj1l57.jpg', b'1', 'minigarden/products/l9wtyppaqyzjgqzj1l57', 1, 13);
INSERT INTO `product_images` VALUES (26, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776995905/minigarden/products/de6ollijinzsaspugsnk.webp', b'1', 'minigarden/products/de6ollijinzsaspugsnk', 1, 14);
INSERT INTO `product_images` VALUES (27, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776995908/minigarden/products/kxu2ggynlt9qtakypevq.webp', b'0', 'minigarden/products/kxu2ggynlt9qtakypevq', 2, 14);
INSERT INTO `product_images` VALUES (28, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776995911/minigarden/products/qryfbwmwbezeazmnyol5.webp', b'0', 'minigarden/products/qryfbwmwbezeazmnyol5', 3, 14);
INSERT INTO `product_images` VALUES (29, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776995913/minigarden/products/bzqvmf6lrbnue744dfjg.webp', b'0', 'minigarden/products/bzqvmf6lrbnue744dfjg', 4, 14);
INSERT INTO `product_images` VALUES (30, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996133/minigarden/products/wb3gynz14sikxtxoyk9c.webp', b'1', 'minigarden/products/wb3gynz14sikxtxoyk9c', 1, 15);
INSERT INTO `product_images` VALUES (31, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996136/minigarden/products/k8niyfde2tfesxob1trv.webp', b'0', 'minigarden/products/k8niyfde2tfesxob1trv', 2, 15);
INSERT INTO `product_images` VALUES (32, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996139/minigarden/products/txyjeybemm83b1em5seq.webp', b'0', 'minigarden/products/txyjeybemm83b1em5seq', 3, 15);
INSERT INTO `product_images` VALUES (33, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996449/minigarden/products/rg466ujytfzv1etpm9tf.png', b'1', 'minigarden/products/rg466ujytfzv1etpm9tf', 1, 16);
INSERT INTO `product_images` VALUES (34, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996651/minigarden/products/efbsndz3mv76vtwkywlv.png', b'1', 'minigarden/products/efbsndz3mv76vtwkywlv', 1, 17);
INSERT INTO `product_images` VALUES (35, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996655/minigarden/products/klg2comca8wijsfycwxy.png', b'0', 'minigarden/products/klg2comca8wijsfycwxy', 2, 17);
INSERT INTO `product_images` VALUES (36, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996659/minigarden/products/yzii0lpbpkn6wa33tov1.png', b'0', 'minigarden/products/yzii0lpbpkn6wa33tov1', 3, 17);
INSERT INTO `product_images` VALUES (37, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996663/minigarden/products/xmw03qzmjw2pck8jk2qx.png', b'0', 'minigarden/products/xmw03qzmjw2pck8jk2qx', 4, 17);
INSERT INTO `product_images` VALUES (38, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776996915/minigarden/products/lpxifxnz0wz5x1xalos7.webp', b'1', 'minigarden/products/lpxifxnz0wz5x1xalos7', 1, 18);
INSERT INTO `product_images` VALUES (39, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776997313/minigarden/products/b8fz41wckazxqybx0dcl.jpg', b'1', 'minigarden/products/b8fz41wckazxqybx0dcl', 1, 19);
INSERT INTO `product_images` VALUES (40, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776997683/minigarden/products/zmrc4lyoa1b7tful8hja.jpg', b'1', 'minigarden/products/zmrc4lyoa1b7tful8hja', 1, 20);
INSERT INTO `product_images` VALUES (41, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776998393/minigarden/products/q0eoqi49qengwpejzyvc.png', b'1', 'minigarden/products/q0eoqi49qengwpejzyvc', 1, 21);
INSERT INTO `product_images` VALUES (42, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776998396/minigarden/products/etrukp4xfqk3odpztqjc.png', b'0', 'minigarden/products/etrukp4xfqk3odpztqjc', 2, 21);
INSERT INTO `product_images` VALUES (43, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776998702/minigarden/products/kayndrt8rahbbfdb2eml.webp', b'1', 'minigarden/products/kayndrt8rahbbfdb2eml', 1, 22);
INSERT INTO `product_images` VALUES (44, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776998704/minigarden/products/nf4reabxlxc1sc1xnu5o.webp', b'0', 'minigarden/products/nf4reabxlxc1sc1xnu5o', 2, 22);
INSERT INTO `product_images` VALUES (45, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776998888/minigarden/products/lhh34f01t7z5exqjnapy.jpg', b'1', 'minigarden/products/lhh34f01t7z5exqjnapy', 1, 23);
INSERT INTO `product_images` VALUES (46, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776999102/minigarden/products/nrla6lrpn1pn7abxllhc.jpg', b'1', 'minigarden/products/nrla6lrpn1pn7abxllhc', 1, 24);
INSERT INTO `product_images` VALUES (47, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1776999454/minigarden/products/qhyxcn5uiu77x8rfq6eq.webp', b'1', 'minigarden/products/qhyxcn5uiu77x8rfq6eq', 1, 25);
INSERT INTO `product_images` VALUES (48, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1777996808/minigarden/products/kchoxsarfm67wz0jbv5q.jpg', b'1', 'minigarden/products/kchoxsarfm67wz0jbv5q', 1, 28);
INSERT INTO `product_images` VALUES (49, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1777996811/minigarden/products/q3guhvbt6jpkcnwcgd8k.jpg', b'0', 'minigarden/products/q3guhvbt6jpkcnwcgd8k', 2, 28);
INSERT INTO `product_images` VALUES (50, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1777996813/minigarden/products/pk5ocjgxx23tif8uorjz.jpg', b'0', 'minigarden/products/pk5ocjgxx23tif8uorjz', 3, 28);
INSERT INTO `product_images` VALUES (51, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1777996815/minigarden/products/pd1ulbmckn5gcezz40xt.jpg', b'0', 'minigarden/products/pd1ulbmckn5gcezz40xt', 4, 28);
INSERT INTO `product_images` VALUES (52, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1777998145/minigarden/products/mjsswytyh6utonjo7uje.jpg', b'1', 'minigarden/products/mjsswytyh6utonjo7uje', 1, 29);
INSERT INTO `product_images` VALUES (53, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1777998147/minigarden/products/g6uzbjkesfflyfkjekdy.jpg', b'0', 'minigarden/products/g6uzbjkesfflyfkjekdy', 2, 29);
INSERT INTO `product_images` VALUES (54, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1777998149/minigarden/products/sdc52m8e8c6ghrled1oe.jpg', b'0', 'minigarden/products/sdc52m8e8c6ghrled1oe', 3, 29);
INSERT INTO `product_images` VALUES (55, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778817254/minigarden/products/bv96w1anxkjstcn607xs.jpg', b'1', 'minigarden/products/bv96w1anxkjstcn607xs', 1, 30);
INSERT INTO `product_images` VALUES (56, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778817256/minigarden/products/kibeyilowzfqypfyh04a.jpg', b'0', 'minigarden/products/kibeyilowzfqypfyh04a', 2, 30);
INSERT INTO `product_images` VALUES (57, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778818204/minigarden/products/nwqswbuug17q8zhb0rrn.jpg', b'1', 'minigarden/products/nwqswbuug17q8zhb0rrn', 1, 32);
INSERT INTO `product_images` VALUES (58, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778818206/minigarden/products/lfewfatysrwdlfegi0yk.jpg', b'0', 'minigarden/products/lfewfatysrwdlfegi0yk', 2, 32);
INSERT INTO `product_images` VALUES (59, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778818209/minigarden/products/eetw6l0z39wfulwmigkl.jpg', b'0', 'minigarden/products/eetw6l0z39wfulwmigkl', 3, 32);
INSERT INTO `product_images` VALUES (60, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778818574/minigarden/products/wrsr4p5nhhilgwvec4mf.jpg', b'1', 'minigarden/products/wrsr4p5nhhilgwvec4mf', 1, 33);
INSERT INTO `product_images` VALUES (61, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778818576/minigarden/products/nr04edqkediqelwy3lmk.jpg', b'0', 'minigarden/products/nr04edqkediqelwy3lmk', 2, 33);
INSERT INTO `product_images` VALUES (62, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778818577/minigarden/products/ftyv38zgfzhtwxlaz3ds.jpg', b'0', 'minigarden/products/ftyv38zgfzhtwxlaz3ds', 3, 33);
INSERT INTO `product_images` VALUES (63, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778818579/minigarden/products/ld0hc9zakszzsevfx8sl.jpg', b'0', 'minigarden/products/ld0hc9zakszzsevfx8sl', 4, 33);
INSERT INTO `product_images` VALUES (64, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778819139/minigarden/products/jdc5jud7sfognuux3hlo.jpg', b'1', 'minigarden/products/jdc5jud7sfognuux3hlo', 1, 34);
INSERT INTO `product_images` VALUES (65, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778819141/minigarden/products/njuaufve0rasnyov2xwn.jpg', b'0', 'minigarden/products/njuaufve0rasnyov2xwn', 2, 34);
INSERT INTO `product_images` VALUES (66, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778819143/minigarden/products/eirqj5u3ehxigwotpp9p.jpg', b'0', 'minigarden/products/eirqj5u3ehxigwotpp9p', 3, 34);
INSERT INTO `product_images` VALUES (67, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778819565/minigarden/products/thcpyn1xzsjjc5fdu3pa.jpg', b'1', 'minigarden/products/thcpyn1xzsjjc5fdu3pa', 1, 35);
INSERT INTO `product_images` VALUES (68, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778819567/minigarden/products/c1gu7ies1tsal4zheymc.jpg', b'0', 'minigarden/products/c1gu7ies1tsal4zheymc', 2, 35);
INSERT INTO `product_images` VALUES (69, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778819569/minigarden/products/iwtd9ssbxd88zrx2sasc.jpg', b'0', 'minigarden/products/iwtd9ssbxd88zrx2sasc', 3, 35);
INSERT INTO `product_images` VALUES (70, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778820313/minigarden/products/rfr8md6gyg2z0vmurtea.jpg', b'1', 'minigarden/products/rfr8md6gyg2z0vmurtea', 1, 36);
INSERT INTO `product_images` VALUES (71, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778820315/minigarden/products/mgnzscwqbdvbkcexdlm2.jpg', b'0', 'minigarden/products/mgnzscwqbdvbkcexdlm2', 2, 36);
INSERT INTO `product_images` VALUES (72, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778820318/minigarden/products/hepeexzh0zdawjrcjkas.jpg', b'0', 'minigarden/products/hepeexzh0zdawjrcjkas', 3, 36);
INSERT INTO `product_images` VALUES (73, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778828593/minigarden/products/lk4dapajmmbnml8f2mtl.jpg', b'1', 'minigarden/products/lk4dapajmmbnml8f2mtl', 1, 37);
INSERT INTO `product_images` VALUES (74, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778828595/minigarden/products/hqvyxkykkcyqitkawqbn.jpg', b'0', 'minigarden/products/hqvyxkykkcyqitkawqbn', 2, 37);
INSERT INTO `product_images` VALUES (75, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778828597/minigarden/products/ml5x3barrzbza9vm2zos.jpg', b'0', 'minigarden/products/ml5x3barrzbza9vm2zos', 3, 37);
INSERT INTO `product_images` VALUES (76, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778828599/minigarden/products/agfpan6x2vaabwgzazhk.jpg', b'0', 'minigarden/products/agfpan6x2vaabwgzazhk', 4, 37);
INSERT INTO `product_images` VALUES (77, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778829168/minigarden/products/b8gs08bhut1j7pffe38m.jpg', b'1', 'minigarden/products/b8gs08bhut1j7pffe38m', 1, 38);
INSERT INTO `product_images` VALUES (78, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778829170/minigarden/products/t1ybnlojjwcdudwrxkkf.jpg', b'0', 'minigarden/products/t1ybnlojjwcdudwrxkkf', 2, 38);
INSERT INTO `product_images` VALUES (79, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778829172/minigarden/products/cdsp7rhbicba59rwrmlg.jpg', b'0', 'minigarden/products/cdsp7rhbicba59rwrmlg', 3, 38);
INSERT INTO `product_images` VALUES (80, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778838281/minigarden/products/edb8cwjdhvxgimiccacy.jpg', b'1', 'minigarden/products/edb8cwjdhvxgimiccacy', 1, 39);
INSERT INTO `product_images` VALUES (81, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778838284/minigarden/products/egi6x1ribbsnyxpa0yq4.jpg', b'0', 'minigarden/products/egi6x1ribbsnyxpa0yq4', 2, 39);
INSERT INTO `product_images` VALUES (82, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778839530/minigarden/products/xvozke6pmulawzntujbc.jpg', b'1', 'minigarden/products/xvozke6pmulawzntujbc', 1, 40);
INSERT INTO `product_images` VALUES (83, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778839532/minigarden/products/iqufsfncpvwishywljde.jpg', b'0', 'minigarden/products/iqufsfncpvwishywljde', 2, 40);
INSERT INTO `product_images` VALUES (84, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778839534/minigarden/products/a52whbeeoprgbjchbi00.jpg', b'0', 'minigarden/products/a52whbeeoprgbjchbi00', 3, 40);
INSERT INTO `product_images` VALUES (85, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778839537/minigarden/products/cyefvkq1fs4ihj8znstg.jpg', b'0', 'minigarden/products/cyefvkq1fs4ihj8znstg', 4, 40);
INSERT INTO `product_images` VALUES (86, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036280/minigarden/products/xip6ml43rscyttj5gywd.jpg', b'1', 'minigarden/products/xip6ml43rscyttj5gywd', 1, 41);
INSERT INTO `product_images` VALUES (87, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036282/minigarden/products/wlgho6ka4o1hw40dz7qy.jpg', b'0', 'minigarden/products/wlgho6ka4o1hw40dz7qy', 2, 41);
INSERT INTO `product_images` VALUES (88, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036284/minigarden/products/xwsvumlk3n6kus3ykamk.jpg', b'0', 'minigarden/products/xwsvumlk3n6kus3ykamk', 3, 41);
INSERT INTO `product_images` VALUES (89, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036520/minigarden/products/oxw2fdfesikygle6ivgp.jpg', b'1', 'minigarden/products/oxw2fdfesikygle6ivgp', 1, 42);
INSERT INTO `product_images` VALUES (90, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036522/minigarden/products/ib7w0zq2bqrrfchrpvik.jpg', b'0', 'minigarden/products/ib7w0zq2bqrrfchrpvik', 2, 42);
INSERT INTO `product_images` VALUES (91, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036524/minigarden/products/lfbtznrkoavu43f1jqn6.jpg', b'0', 'minigarden/products/lfbtznrkoavu43f1jqn6', 3, 42);
INSERT INTO `product_images` VALUES (92, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036802/minigarden/products/eplb1kmg4kaddorclgc2.jpg', b'1', 'minigarden/products/eplb1kmg4kaddorclgc2', 1, 43);
INSERT INTO `product_images` VALUES (93, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036804/minigarden/products/iqtiqmbwybqvxzvehper.jpg', b'0', 'minigarden/products/iqtiqmbwybqvxzvehper', 2, 43);
INSERT INTO `product_images` VALUES (94, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036806/minigarden/products/femlohhl9pseestowmbj.jpg', b'0', 'minigarden/products/femlohhl9pseestowmbj', 3, 43);
INSERT INTO `product_images` VALUES (95, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779036809/minigarden/products/pukdvdjonyyjlhy3nakh.jpg', b'0', 'minigarden/products/pukdvdjonyyjlhy3nakh', 4, 43);
INSERT INTO `product_images` VALUES (96, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779037083/minigarden/products/wfmbw9zdoayagz2jc0re.jpg', b'1', 'minigarden/products/wfmbw9zdoayagz2jc0re', 1, 44);
INSERT INTO `product_images` VALUES (97, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779037085/minigarden/products/suuryhmn9loglvhjchne.jpg', b'0', 'minigarden/products/suuryhmn9loglvhjchne', 2, 44);
INSERT INTO `product_images` VALUES (98, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779037087/minigarden/products/b5rvsywovew7vioqq85w.jpg', b'0', 'minigarden/products/b5rvsywovew7vioqq85w', 3, 44);
INSERT INTO `product_images` VALUES (99, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779037823/minigarden/products/urc4h1hgsiw0msflwrtk.jpg', b'1', 'minigarden/products/urc4h1hgsiw0msflwrtk', 1, 45);
INSERT INTO `product_images` VALUES (100, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779037825/minigarden/products/ep3rlphwjexbmdr6omwy.jpg', b'0', 'minigarden/products/ep3rlphwjexbmdr6omwy', 2, 45);
INSERT INTO `product_images` VALUES (101, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779038022/minigarden/products/lesvpyesn4lcwitksykd.jpg', b'1', 'minigarden/products/lesvpyesn4lcwitksykd', 1, 46);
INSERT INTO `product_images` VALUES (102, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779038024/minigarden/products/iek0cbdh0bg5wlikn3xi.jpg', b'0', 'minigarden/products/iek0cbdh0bg5wlikn3xi', 2, 46);
INSERT INTO `product_images` VALUES (103, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779038258/minigarden/products/ycm4btp9auhrloq0jwti.jpg', b'1', 'minigarden/products/ycm4btp9auhrloq0jwti', 1, 47);
INSERT INTO `product_images` VALUES (104, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779038261/minigarden/products/hlwxivvdqaoombhz8qaw.jpg', b'0', 'minigarden/products/hlwxivvdqaoombhz8qaw', 2, 47);
INSERT INTO `product_images` VALUES (105, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779038507/minigarden/products/wszjjuvekixoz7pxxovc.jpg', b'1', 'minigarden/products/wszjjuvekixoz7pxxovc', 1, 48);
INSERT INTO `product_images` VALUES (106, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779038509/minigarden/products/vbbvhungpgiipxjwwqiy.jpg', b'0', 'minigarden/products/vbbvhungpgiipxjwwqiy', 2, 48);
INSERT INTO `product_images` VALUES (107, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779038817/minigarden/products/rid9loohanh0gzagoa05.jpg', b'1', 'minigarden/products/rid9loohanh0gzagoa05', 1, 49);
INSERT INTO `product_images` VALUES (108, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779038819/minigarden/products/gdqox84fuunz4qrwqrtd.jpg', b'0', 'minigarden/products/gdqox84fuunz4qrwqrtd', 2, 49);
INSERT INTO `product_images` VALUES (109, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779039122/minigarden/products/bcn8x9nwomtz1tyn1r2d.jpg', b'1', 'minigarden/products/bcn8x9nwomtz1tyn1r2d', 1, 50);
INSERT INTO `product_images` VALUES (110, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779039124/minigarden/products/yndsld23ldcggmnzwbvp.jpg', b'0', 'minigarden/products/yndsld23ldcggmnzwbvp', 2, 50);
INSERT INTO `product_images` VALUES (111, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779039659/minigarden/products/mdlxzpexp4ahfyzvlqsy.jpg', b'1', 'minigarden/products/mdlxzpexp4ahfyzvlqsy', 1, 51);
INSERT INTO `product_images` VALUES (112, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779039660/minigarden/products/eyevzkmarwpmft2t4bls.jpg', b'0', 'minigarden/products/eyevzkmarwpmft2t4bls', 2, 51);
INSERT INTO `product_images` VALUES (113, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779040030/minigarden/products/abeujesnc8wjtihrgilx.jpg', b'1', 'minigarden/products/abeujesnc8wjtihrgilx', 1, 52);
INSERT INTO `product_images` VALUES (114, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779040032/minigarden/products/vzxpr9ddjnycw7yzx3ub.jpg', b'0', 'minigarden/products/vzxpr9ddjnycw7yzx3ub', 2, 52);
INSERT INTO `product_images` VALUES (115, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779040305/minigarden/products/nwbrw9qy0eee7almxkzr.jpg', b'1', 'minigarden/products/nwbrw9qy0eee7almxkzr', 1, 53);
INSERT INTO `product_images` VALUES (116, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779040307/minigarden/products/ki7ndsqkfwfaiw7vc44u.jpg', b'0', 'minigarden/products/ki7ndsqkfwfaiw7vc44u', 2, 53);
INSERT INTO `product_images` VALUES (117, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779040309/minigarden/products/zaiqfmiuegvonbxz06k5.jpg', b'0', 'minigarden/products/zaiqfmiuegvonbxz06k5', 3, 53);
INSERT INTO `product_images` VALUES (118, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1779040311/minigarden/products/wspoen6ceklvwhc4tpks.jpg', b'0', 'minigarden/products/wspoen6ceklvwhc4tpks', 4, 53);

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `quantity` int NOT NULL,
  `status` bit(1) NOT NULL,
  `updated_at` datetime(6) NULL DEFAULT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKo61fmio5yukmmiqgnxf8pnavn`(`name` ASC) USING BTREE,
  INDEX `FKog2rp4qthbtt2lfyhfo32lsw9`(`category_id` ASC) USING BTREE,
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 54 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, '2026-04-24 01:07:55.000000', 'Cây có những chiếc lá tròn căng mọng, mũm mĩm như những viên sỏi, màu hồng phấn và được bao phủ bởi một lớp phấn trắng.', 'Sen đá sỏi hồng', 26000.00, 10, b'1', NULL, 3);
INSERT INTO `products` VALUES (2, '2026-04-24 01:10:51.000000', 'Hệ sinh thái thu nhỏ trong bình thủy tinh hình quả cầu có lỗ hổng (hệ mở), tái hiện một góc rừng xanh mướt với rêu tươi, cây lá màu và phụ kiện Totoro, gỗ lũa tự nhiên.', 'Terrarium tròn treo Totoro', 485000.00, 1, b'1', '2026-05-17 07:57:07.000000', 1);
INSERT INTO `products` VALUES (3, '2026-04-24 01:13:58.000000', 'Cây có lá lớn, hình tim thuôn dài. Lá non có màu đỏ sẫm hoặc nâu đỏ, khi già chuyển sang màu xanh đen đậm bóng bẩy. Thân cây mập mạp, mọc thành bụi.', 'Trầu bà đế vương đỏ', 350000.00, 3, b'1', '2026-05-17 07:57:07.000000', 2);
INSERT INTO `products` VALUES (4, '2026-04-24 01:16:55.000000', 'Cây mọc thành cụm dạng hoa hồng với các lá nhỏ, thon dài, màu xanh bạc pha chút hồng ở đầu lá. Cây thường xuyên đâm ra các nhánh con vươn dài xung quanh trông rất sinh động.', 'Sen đá Echeveria Prolifica (Sen đá nhánh)', 45000.00, 6, b'1', '2026-05-17 07:57:07.000000', 3);
INSERT INTO `products` VALUES (5, '2026-04-24 01:19:34.000000', 'Cây mọc thành bụi thấp, lá nhỏ mọng nước hình bầu dục thuôn dài. Bề mặt lá thường có lớp lông mịn li ti tạo hiệu ứng như có những hạt sương đọng lại. Màu sắc thay đổi từ xanh vàng sang cam đỏ tùy vào độ nắng.', 'Sen đá kẹo bọc đường', 30000.00, 2, b'1', '2026-05-17 15:44:27.000000', 3);
INSERT INTO `products` VALUES (6, '2026-04-24 01:24:01.000000', 'Cây thân thảo mềm mại, mọc dạng rủ với nhiều nhánh nhỏ. Lá có hình bầu dục, trông giống như những hạt dưa, bề mặt lá mọng nước và có lớp phấn trắng nhẹ giúp cây chịu hạn tốt.', 'Lan hạt dưa', 120000.00, 6, b'1', '2026-05-17 06:15:28.000000', 2);
INSERT INTO `products` VALUES (7, '2026-04-24 01:26:42.000000', 'Cây mọc dạng đài hoa hồng với các lớp lá xếp chồng khít nhau. Lá có màu xanh bạc đặc trưng, viền lá và đỉnh lá có màu hồng cánh sen rực rỡ, bao phủ bởi một lớp phấn trắng mỏng mịn.', 'Sen đá Blue Minima', 45000.00, 7, b'1', '2026-05-17 07:57:07.000000', 3);
INSERT INTO `products` VALUES (8, '2026-04-24 01:30:01.000000', 'Tác phẩm mô phỏng một khu rừng già với điểm nhấn là gốc gỗ lũa lớn, rêu xanh mướt và các loại cây lá màu nhỏ. Sự kết hợp giữa các mảnh thủy tinh ghép đa diện tạo nên vẻ đẹp sang trọng và huyền ảo.', 'Terrarium \"Khu rừng cổ tích\"', 2500000.00, 5, b'1', NULL, 1);
INSERT INTO `products` VALUES (9, '2026-04-24 01:32:25.000000', 'Cây mọc dạng đài hoa hồng với các lá xếp chồng khít nhau. Lá có màu xanh lục bảo, đầu lá hơi nhọn và có thể chuyển sang màu đỏ nhẹ nếu được tiếp xúc với nắng gắt và nhiệt độ thấp.', 'Sen đá đất xanh', 30000.00, 9, b'1', '2026-04-24 01:44:20.000000', 3);
INSERT INTO `products` VALUES (10, '2026-04-24 01:35:31.000000', 'Cây nổi bật với những chiếc lá to bản, màu hồng rực rỡ chiếm phần lớn diện tích lá, viền lá có màu xanh lục sẫm. Thân cây mềm, mọc thành bụi, mang lại vẻ đẹp sinh động và ấm áp cho không gian.', 'Cây vạn lộc hồng (Cây gấm đỏ)', 180000.00, 4, b'1', NULL, 2);
INSERT INTO `products` VALUES (11, '2026-04-24 01:40:52.000000', 'Một hệ sinh thái thu nhỏ mô phỏng khu rừng già với bố cục theo chiều dọc. Tác phẩm sử dụng gỗ lũa tự nhiên làm trục chính, bao phủ bởi các loại rêu tươi, cây Cẩm Nhung, và dương xỉ nhỏ, tạo nên không gian xanh sâu thẳm và thư thái.', 'Terrarium vạn phúc', 2350000.00, 7, b'1', NULL, 1);
INSERT INTO `products` VALUES (12, '2026-04-24 01:47:22.000000', 'Cây mọc dạng đài hoa hồng hoàn hảo với các lớp lá xếp chồng khít, đối xứng. Lá có màu xanh ngọc bích nhạt, được phủ một lớp phấn trắng mịn dày, tạo nên vẻ ngoài như được đúc từ bạc.', 'Sen đá sen bạc', 85000.00, 10, b'1', NULL, 3);
INSERT INTO `products` VALUES (13, '2026-04-24 01:52:43.000000', 'Cây thân thảo mọc bụi thấp. Điểm thu hút nhất là những chiếc lá nhỏ có hệ thống gân lá màu trắng chạy chằng chịt trên nền lá xanh mướt, trông giống như một tấm lưới hoặc thêu ren tinh xảo.', 'Cây cẩm nhung xanh', 85000.00, 7, b'1', NULL, 2);
INSERT INTO `products` VALUES (14, '2026-04-24 01:57:57.000000', 'Cây có các lá mọng nước hình bầu dục, thuôn nhọn ở đầu, xếp chồng lên nhau thành hình hoa sen. Điểm thu hút nhất là màu hồng phấn hoặc đỏ hồng rực rỡ bao phủ toàn bộ lá khi được \"ăn nắng\" đủ.', 'Sen đá hồng ngọc liên', 65000.00, 8, b'1', NULL, 3);
INSERT INTO `products` VALUES (15, '2026-04-24 02:01:43.000000', 'Cây mọc thành bụi với nhiều đầu nhỏ xinh xắn. Lá có dạng hình trứng, hơi bầu, đầu lá có màu hồng đào hoặc cam nhạt, phần thân lá màu trắng xanh tạo hiệu ứng loang màu rất đẹp. Bề mặt lá thường có một lớp phấn mỏng.', 'Sen đá Berry', 120000.00, 5, b'1', NULL, 3);
INSERT INTO `products` VALUES (16, '2026-04-24 02:06:53.000000', 'Cây mọc dạng bụi thấp, lá ngắn, bản rộng và cứng cáp. Lá có màu vàng chanh rực rỡ ở hai bên mép, ở giữa là các sọc xanh lục tạo nên sự tương phản bắt mắt. Cây phát triển theo dạng hình hoa hồng tỏa đều.', 'Cây lưỡi hổ thái lùn vàng', 110000.00, 3, b'1', '2026-05-17 06:15:28.000000', 2);
INSERT INTO `products` VALUES (17, '2026-04-24 02:10:26.000000', 'Tác phẩm mô phỏng một thung lũng nguyên sinh trong bình thủy tinh đa diện. Sự kết hợp giữa gỗ lũa cổ thụ, rêu tươi và các loại cây lá màu (Cẩm Nhung đỏ/xanh) tạo nên một hệ sinh thái thu nhỏ có chiều sâu và đầy sức sống.', 'Terrarium \"Thung lũng xanh\"', 3200000.00, 4, b'1', NULL, 1);
INSERT INTO `products` VALUES (18, '2026-04-24 02:14:39.000000', 'Cây có lá mọc thẳng đứng, thon dài và nhọn dần về phía đỉnh như móng vuốt. Trên bề mặt lá màu xanh đậm có các đường vân ngang màu trắng nổi bật, tạo cảm giác sần sùi và cứng cáp.', 'Sen đá móng rồng', 30000.00, 5, b'1', NULL, 3);
INSERT INTO `products` VALUES (19, '2026-04-24 02:21:17.000000', 'Cây thân thảo mọng nước, lá xanh thẫm, dày, mép lá có răng cưa lượn sóng. Hoa mọc thành chùm ở ngọn, mỗi bông hoa có nhiều lớp cánh xếp chồng lên nhau trông như những đóa hồng mini.', 'Cây sống đời', 95000.00, 7, b'1', NULL, 2);
INSERT INTO `products` VALUES (20, '2026-04-24 02:27:26.000000', 'Cây mọc dạng đài hoa hồng với các lớp lá dày, mọng nước xếp chồng khít. Điểm nổi bật nhất là màu sắc nâu đỏ sẫm như socola, đôi khi pha chút ánh tím hoặc xanh lục ở phần tim lá tùy vào lượng ánh sáng.', 'Sen đá Socola', 65000.00, 8, b'1', NULL, 3);
INSERT INTO `products` VALUES (21, '2026-04-24 02:39:20.000000', 'Một hệ sinh thái thu nhỏ mô phỏng phong cảnh sơn thủy hữu tình với điểm nhấn là một cây Bonsai dáng trực (thường là cây Linh Sam hoặc Tùng), kết hợp với rêu tươi, đá cảnh và phụ kiện ngôi chùa nhỏ, tạo cảm giác bình an và tĩnh lặng.', 'Terrarium bonsai \"Thiền định\"', 1500000.00, 8, b'1', NULL, 1);
INSERT INTO `products` VALUES (22, '2026-04-24 02:44:28.000000', 'Cây có lá hình tròn nhỏ (chỉ từ 0.8 - 1cm), bề mặt lá xanh đậm với hệ thống gân bạc nổi bật, mặt dưới lá thường có màu đỏ tía hoặc hồng nhạt. Cây mọc thành cụm thấp và vươn ra các \"ngó\" (stolons) để nhân giống tự nhiên.', 'Hải đường mini', 75000.00, 7, b'1', NULL, 2);
INSERT INTO `products` VALUES (23, '2026-04-24 02:47:32.000000', 'Cây có các lớp lá mỏng xếp chồng khít lên nhau, cuộn tròn lại tạo thành hình dáng y hệt một nụ hoa hồng. Màu sắc chủ đạo là xanh lục bảo, phần tâm đối với dòng này thường có màu trắng hoặc xanh nhạt rất thanh khiết.', 'Sen đá hoa hồng trắng', 150000.00, 4, b'1', NULL, 3);
INSERT INTO `products` VALUES (24, '2026-04-24 02:51:05.000000', 'Cây có thân vươn thẳng, mập mạp ở gốc và thon dần về ngọn. Lá kép đối xứng, màu xanh lục đậm, bóng mướt và dày dặn, trông rất khỏe khoắn và đầy sức sống.', 'Cây kim tiền', 200000.00, 6, b'1', NULL, 2);
INSERT INTO `products` VALUES (25, '2026-04-24 02:56:58.000000', 'Cây mọc dạng đài hoa với các lá mọng nước hình bầu dục, đầu lá tròn và có độ trong suốt cao (thường gọi là \"cửa sổ\" ánh sáng), cho phép ánh sáng xuyên thấu qua tạo hiệu ứng lấp lánh như những viên ngọc quý.', 'Sen đá kim cương', 55000.00, 6, b'1', NULL, 3);
INSERT INTO `products` VALUES (28, '2026-05-05 16:00:16.000000', 'Terrarium sen đá mini mang đến vẻ đẹp xanh mát, tinh tế cho không gian sống và làm việc. Thiết kế nhỏ gọn, dễ chăm sóc, phù hợp trang trí bàn làm việc hoặc làm quà tặng ý nghĩa. 🌿', 'Terrarium Sen đá ', 300000.00, 10, b'1', NULL, 1);
INSERT INTO `products` VALUES (29, '2026-05-05 16:22:30.000000', 'Cây hồng môn mini với sắc đỏ nổi bật, tượng trưng cho may mắn và tài lộc. Phù hợp trang trí bàn làm việc, không gian sống hoặc làm quà tặng ý nghĩa.🌸', 'Hoa hồng môn đỏ mini', 100000.00, 17, b'1', '2026-05-17 06:37:39.000000', 2);
INSERT INTO `products` VALUES (30, '2026-05-15 03:54:21.000000', 'Cây trầu bà mini là loại cây cảnh để bàn được yêu thích nhờ lá xanh mướt, dễ chăm sóc và khả năng sống tốt trong môi trường máy lạnh. Cây phù hợp đặt ở bàn học, bàn làm việc hoặc kệ trang trí nhỏ🌱', 'Cây trầu bà mini', 40000.00, 10, b'1', NULL, 2);
INSERT INTO `products` VALUES (32, '2026-05-15 04:10:14.000000', 'Hoa hồng mini là dòng hoa cảnh nhỏ gọn với nhiều màu sắc nổi bật như đỏ, hồng, vàng, cam hoặc trắng. Cây thích hợp đặt trên bàn làm việc, bàn học, quầy lễ tân hoặc làm quà tặng trang trí tinh tế 🌹', 'Hoa hồng đỏ mini', 50000.00, 5, b'1', NULL, 2);
INSERT INTO `products` VALUES (33, '2026-05-15 04:16:25.000000', 'Hoa cúc mini là loại hoa để bàn nhỏ gọn với màu sắc tươi sáng, mang lại cảm giác nhẹ nhàng và thư giãn cho không gian. Cây phù hợp đặt ở bàn học, bàn làm việc, quầy thu ngân hoặc decor quán cà phê, spa.🌼', 'Hoa Cúc Mini', 40000.00, 4, b'1', NULL, 2);
INSERT INTO `products` VALUES (34, '2026-05-15 04:25:48.000000', 'ulip mini là dòng hoa để bàn mang phong cách nhẹ nhàng, hiện đại và sang trọng. Với form hoa thanh thoát cùng màu sắc pastel tinh tế, tulip mini rất phù hợp để decor bàn học, bàn làm việc, quầy lễ tân hoặc không gian phong cách Hàn Quốc.🌷', 'Tulip Màu Hồng Mini Để Bàn', 45000.00, 2, b'1', NULL, 2);
INSERT INTO `products` VALUES (35, '2026-05-15 04:32:55.000000', 'Tulip mini là dòng hoa để bàn mang phong cách nhẹ nhàng, hiện đại và sang trọng. Với form hoa thanh thoát cùng màu sắc pastel tinh tế, tulip mini rất phù hợp để decor bàn học, bàn làm việc, quầy lễ tân hoặc không gian phong cách Hàn Quốc.🌷', 'Tulip Màu Đỏ Mini Để Bàn', 45000.00, 2, b'1', NULL, 2);
INSERT INTO `products` VALUES (36, '2026-05-15 04:45:23.000000', 'Tulip mini là dòng hoa để bàn mang phong cách nhẹ nhàng, hiện đại và sang trọng. Với form hoa thanh thoát cùng màu sắc pastel tinh tế, tulip mini rất phù hợp để decor bàn học, bàn làm việc, quầy lễ tân hoặc không gian phong cách Hàn Quốc.🌷', 'Tulip Màu Vàng Mini Để Bàn', 45000.00, 9, b'1', '2026-05-17 07:56:25.000000', 2);
INSERT INTO `products` VALUES (37, '2026-05-15 07:03:25.000000', 'Hoa đồng tiền mini là loại hoa cảnh nhỏ gọn với màu sắc rực rỡ và tươi sáng, thường được dùng để trang trí bàn học, bàn làm việc, quầy lễ tân hoặc không gian spa. Cây mang vẻ đẹp hiện đại, trẻ trung và tạo cảm giác vui vẻ cho không gian.🌼', ' Hoa Đồng Tiền Mini Để Bàn', 50000.00, 7, b'1', '2026-05-17 06:46:59.000000', 2);
INSERT INTO `products` VALUES (38, '2026-05-15 07:12:57.000000', 'Cây hồng môn mini với sắc hồng nổi bật, tượng trưng cho may mắn và tài lộc. Phù hợp trang trí bàn làm việc, không gian sống hoặc làm quà tặng ý nghĩa.🌸', 'Hoa hồng mônmini', 100000.00, 3, b'1', '2026-05-17 05:33:39.000000', 2);
INSERT INTO `products` VALUES (39, '2026-05-15 09:44:49.000000', 'ây lan tim là loại cây dây rủ nổi bật với những chiếc lá nhỏ hình trái tim màu xanh pha tím độc đáo. Với vẻ ngoài nhẹ nhàng và mềm mại, cây rất được yêu thích trong phong cách decor Hàn Quốc, Pinterest và aesthetic.🌿', 'Cây Lan Tim Treo Aesthetic', 70000.00, 8, b'1', '2026-05-17 14:42:46.000000', 11);
INSERT INTO `products` VALUES (40, '2026-05-15 10:05:42.000000', 'Dương xỉ treo là loại cây cảnh nổi bật với tán lá xanh mềm mại và rủ tự nhiên, mang lại cảm giác thư giãn và tươi mát cho không gian. Cây rất phù hợp với phong cách decor Hàn Quốc, tropical hoặc Pinterest aesthetic, thường được treo ở ban công, cửa sổ, quán cà phê hay góc chill trong phòng.🌿', 'Dương Xỉ Treo Aesthetic', 100000.00, 7, b'1', '2026-05-17 02:55:15.000000', 11);
INSERT INTO `products` VALUES (41, '2026-05-17 16:44:45.000000', 'Cây thường xuân là loại cây dây leo rủ rất đẹp, nổi bật với những chiếc lá nhỏ hình tim hoặc răng cưa nhẹ, màu xanh tươi mát. Cây mang vibe tự nhiên, cổ điển nhưng vẫn rất hợp phong cách aesthetic, đặc biệt là decor kiểu Hàn Quốc, vintage hoặc Pinterest.🍃', 'Cây Thường Xuân', 130000.00, 10, b'1', NULL, 11);
INSERT INTO `products` VALUES (42, '2026-05-17 16:48:44.000000', 'Cây Philodendron Brazil là dòng trầu bà dây rủ rất được ưa chuộng trong decor hiện đại nhờ lá xanh pha vàng chanh đặc trưng, tạo hiệu ứng màu sắc nổi bật nhưng vẫn nhẹ nhàng. Cây rất hợp phong cách aesthetic, tropical nhẹ và không gian tối giản.🌿', 'Cây Philodendron Brazil (Trầu Bà Brazil)', 140000.00, 5, b'1', NULL, 11);
INSERT INTO `products` VALUES (43, '2026-05-17 16:53:29.000000', 'Peperomia dây rủ là dòng cây cảnh mini dạng dây, có lá nhỏ, mọng nước và mọc thành từng chuỗi rủ xuống rất đẹp. Cây mang vibe nhẹ nhàng, dễ thương và cực hợp phong cách aesthetic kiểu Hàn Quốc, decor bàn học, kệ sách hoặc chậu treo nhỏ.🌿', 'Peperomia Dây Rủ', 150000.00, 6, b'1', NULL, 11);
INSERT INTO `products` VALUES (44, '2026-05-17 16:58:07.000000', 'Lan Vanda là dòng lan cao cấp nổi bật với bộ rễ “treo lơ lửng” trong không khí thay vì trồng trong đất. Chính điểm này làm nó cực kỳ hợp phong cách aesthetic tropical / minimalist / studio decor, nhìn rất sang và độc lạ.', 'Lan Vanda treo', 100000.00, 10, b'1', NULL, 11);
INSERT INTO `products` VALUES (45, '2026-05-17 17:10:25.000000', 'Monstera Adansonii là loại cây dây leo nổi bật với những chiếc lá xanh có nhiều “lỗ tự nhiên” độc đáo. Khi trồng dạng treo, cây rủ xuống mềm mại tạo cảm giác rừng nhiệt đới thu nhỏ, rất hợp phong cách aesthetic, boho và tropical indoor.🌿', 'Monstera Adansonii (Swiss Cheese Vine)', 150000.00, 8, b'1', NULL, 11);
INSERT INTO `products` VALUES (46, '2026-05-17 17:13:45.000000', 'Hoya Carnosa là loại cây dây leo treo rất được ưa chuộng trong decor nội thất nhờ lá dày, bóng như sáp và dáng rủ mềm mại. Khi trưởng thành, cây còn có thể ra hoa dạng chùm nhỏ hình ngôi sao, nhìn rất “aesthetic” và có mùi thơm nhẹ.🌿', 'Hoya Carnosa (Hoya rủ) ', 140000.00, 4, b'1', NULL, 11);
INSERT INTO `products` VALUES (47, '2026-05-17 17:17:41.000000', 'String of Hearts Variegated là phiên bản “đặc biệt” của cây lan tim, nổi bật với lá hình trái tim nhỏ xinh có màu loang hồng – trắng – xanh. Khi rủ xuống, dây cây mềm mại tạo cảm giác cực kỳ romantic, Pinterest và aesthetic.🌸', 'String of Hearts Variegated (Lan Tim Variegated)', 100000.00, 5, b'1', NULL, 11);
INSERT INTO `products` VALUES (48, '2026-05-17 17:21:49.000000', 'Thài lài tím là loại cây dây rủ nổi bật với lá sọc tím – bạc – xanh rất bắt mắt. Khi treo lên, cây rủ xuống nhanh và dày, tạo cảm giác cực kỳ “full chậu”, rất hợp phong cách aesthetic, gen Z, Pinterest và decor ban công.🌿', 'Tradescantia Zebrina (Thài lài tím)', 200000.00, 3, b'1', NULL, 11);
INSERT INTO `products` VALUES (49, '2026-05-17 17:27:00.000000', 'Rhipsalis là một loại xương rồng đặc biệt mọc dạng dây rủ xuống, khác hoàn toàn với xương rồng truyền thống. Cây không có gai sắc nhọn, thân mềm và xanh mướt, tạo cảm giác minimal – lạ – rất “aesthetic” khi treo chậu.🌵', 'Rhipsalis (Xương rồng rủ)', 100000.00, 4, b'1', NULL, 11);
INSERT INTO `products` VALUES (50, '2026-05-17 17:32:04.000000', 'Hoa Mười Giờ là loại hoa rất quen thuộc, nổi bật với khả năng nở rực rỡ vào buổi sáng, đặc biệt khoảng 8–10 giờ là hoa nở đẹp nhất. Cây có nhiều màu sắc tươi tắn, rất hợp trang trí ban công, sân thượng hoặc chậu treo aesthetic.🌸', 'Hoa Mười Giờ (Portulaca grandiflora)', 50000.00, 10, b'1', NULL, 11);
INSERT INTO `products` VALUES (51, '2026-05-17 17:41:01.000000', 'Hoa Hồng Môn Trắng là cây cảnh nội thất nổi bật với hoa màu trắng tinh khôi hình trái tim và lá xanh bóng. Đây là loại cây rất được ưa chuộng trong decor hiện đại vì mang lại cảm giác sang trọng, sạch sẽ và tinh tế, phù hợp để bàn làm việc, phòng khách hoặc văn phòng.🌸', 'Hoa Hồng Môn Trắng (Anthurium White)', 100000.00, 10, b'1', NULL, 2);
INSERT INTO `products` VALUES (52, '2026-05-17 17:47:12.000000', 'Cây Sống Đời là loại cây mọng nước có hoa nhỏ mọc thành chùm, màu sắc rực rỡ như đỏ, hồng, vàng, cam. Cây vừa mang tính trang trí đẹp mắt, vừa rất dễ chăm, nên cực kỳ phù hợp để bàn học, bàn làm việc hoặc ban công.🌸', 'Cây Sống Đời Màu Hồng', 50000.00, 10, b'1', NULL, 2);
INSERT INTO `products` VALUES (53, '2026-05-17 17:51:51.000000', 'Hoa Lan Hồ Điệp hồng pastel là dòng lan rất được ưa chuộng trong decor nội thất nhờ màu hồng nhẹ nhàng, sang trọng và form hoa mềm mại. Đây là cây thuộc nhóm hoa để bàn cao cấp, thường dùng trong văn phòng, phòng khách hoặc làm quà tặng.🌸', 'Hoa Lan Hồ Điệp Hồng Pastel (Phalaenopsis Orchid)', 100000.00, 10, b'1', NULL, 11);

-- ----------------------------
-- Table structure for promotion_categories
-- ----------------------------
DROP TABLE IF EXISTS `promotion_categories`;
CREATE TABLE `promotion_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `promotion_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKp0nbbae54tpwwdt495e7j0cnd`(`promotion_id` ASC, `category_id` ASC) USING BTREE,
  INDEX `FKaqy93wdhopfuklq4l5o534xtv`(`category_id` ASC) USING BTREE,
  CONSTRAINT `FKaqy93wdhopfuklq4l5o534xtv` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKoynbpufptkiqhk4n10x25fp3o` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of promotion_categories
-- ----------------------------
INSERT INTO `promotion_categories` VALUES (5, 3, 6);

-- ----------------------------
-- Table structure for promotion_products
-- ----------------------------
DROP TABLE IF EXISTS `promotion_products`;
CREATE TABLE `promotion_products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `promotion_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK73eg5m7f9tw3p798co2esgxd2`(`promotion_id` ASC, `product_id` ASC) USING BTREE,
  INDEX `FK9rm5m4rnoamh56kxetmoe1kk9`(`product_id` ASC) USING BTREE,
  CONSTRAINT `FK9rm5m4rnoamh56kxetmoe1kk9` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKkn7hllhf1o8jjrolro4rqmxt7` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of promotion_products
-- ----------------------------
INSERT INTO `promotion_products` VALUES (5, 36, 10);

-- ----------------------------
-- Table structure for promotions
-- ----------------------------
DROP TABLE IF EXISTS `promotions`;
CREATE TABLE `promotions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `discount_type` enum('FIXED_AMOUNT','PERCENTAGE','FREE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `discount_value` decimal(10, 2) NOT NULL,
  `end_date` datetime(6) NULL DEFAULT NULL,
  `is_active` bit(1) NULL DEFAULT NULL,
  `max_discount` decimal(10, 2) NULL DEFAULT NULL,
  `min_order_value` decimal(10, 2) NULL DEFAULT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime(6) NULL DEFAULT NULL,
  `type` enum('CATEGORY','PRODUCT','SHIPPING','SHOP') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of promotions
-- ----------------------------
INSERT INTO `promotions` VALUES (1, '2026-05-13 09:47:23.000000', 'Giảm 10% cho đơn từ 200.000đ', 'PERCENTAGE', 20.00, '2026-05-20 02:45:00.000000', b'1', 40000.00, 20000.00, 'CATE200000PB609', '2026-05-13 02:45:00.000000', 'CATEGORY', 8);
INSERT INTO `promotions` VALUES (3, '2026-05-13 13:56:57.000000', 'Giảm 10% cho đơn từ 400.000đ', 'PERCENTAGE', 10.00, '2026-05-20 06:56:00.000000', b'1', 80000.00, 40000.00, 'CATE10P0F2F', '2026-05-13 06:56:00.000000', 'CATEGORY', NULL);
INSERT INTO `promotions` VALUES (5, '2026-05-14 15:20:58.000000', 'Giảm 10% cho đơn từ 200.000đ', 'PERCENTAGE', 10.00, '2026-05-30 08:20:00.000000', b'1', 30000.00, 200000.00, 'SALE10P5934', '2026-05-14 08:20:00.000000', 'SHOP', 9);
INSERT INTO `promotions` VALUES (6, '2026-05-14 15:22:18.000000', 'Giảm 10% cho sản phẩm của danh mục sen đá', 'PERCENTAGE', 10.00, '2026-05-21 08:21:00.000000', b'1', 20000.00, 40000.00, 'CATE10PC790', '2026-05-14 08:21:00.000000', 'CATEGORY', 9);
INSERT INTO `promotions` VALUES (7, '2026-05-14 15:29:23.000000', 'Giảm 10% cho sản phẩm Hải đường mini', 'PERCENTAGE', 10.00, '2026-05-21 08:28:00.000000', b'1', 20000.00, 50000.00, 'PROD10PCD68', '2026-05-14 08:28:00.000000', 'PRODUCT', NULL);
INSERT INTO `promotions` VALUES (8, '2026-05-17 01:45:52.000000', 'Giảm 20.000đ cho đơn từ 200.000đ', 'FIXED_AMOUNT', 20000.00, '2026-05-29 18:44:00.000000', b'1', 20000.00, 200000.00, 'SHIP207EF6', '2026-05-16 18:44:00.000000', 'SHIPPING', 10);
INSERT INTO `promotions` VALUES (9, '2026-05-17 02:43:07.000000', 'Miễn phí vận chuyển cho đơn từ 80.000đ', 'FREE', 0.00, '2026-05-23 19:42:00.000000', b'1', 0.00, 80000.00, 'SHIPFREED3F8', '2026-05-16 19:42:00.000000', 'SHIPPING', 5);
INSERT INTO `promotions` VALUES (10, '2026-05-17 07:31:52.000000', 'Giảm 5% cho hoa Tulip màu vàng', 'PERCENTAGE', 5.00, '2026-05-24 00:30:00.000000', b'1', 10000.00, 40000.00, 'PROD5P65AC', '2026-05-17 00:30:00.000000', 'PRODUCT', 7);
INSERT INTO `promotions` VALUES (11, '2026-05-17 16:39:48.000000', '', 'FIXED_AMOUNT', 5000.00, '2026-05-25 09:39:00.000000', b'1', 5000.00, 100000.00, 'SHIP5K7DC0', '2026-05-17 09:39:00.000000', 'SHIPPING', 10);

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `rating` int NOT NULL,
  `status` bit(1) NOT NULL,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKpl51cejpw4gy5swfar8br9ngi`(`product_id` ASC) USING BTREE,
  CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of reviews
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role` enum('ADMIN','USER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('ACTIVE','BANNED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` enum('FACEBOOK','GOOGLE','LOCAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reset_token_expiry` datetime(6) NULL DEFAULT NULL,
  `failed_login_attempts` int NULL DEFAULT NULL,
  `is_default` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK6dotkott2kjsp8vw4d0m25fb7`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, NULL, 'https://res.cloudinary.com/do1rmzt7f/image/upload/v1778513255/minigarden/avatars/vzahxyv3zovifii7eonu.jpg', '22130147@st.hcmuaf.edu.vn', 'ChanChan', '$2a$10$u.a8OMYrl2tqFiCHXP6.MuIYVE8ZZFVOOjIkcVVhoLtGrSletd4ue', NULL, 'ADMIN', 'ACTIVE', 'LOCAL', NULL, NULL, 0, NULL);
INSERT INTO `users` VALUES (2, NULL, NULL, '22130147@st.hcmuaf.du.vn', 'ChanChan', '$2a$10$FFL3RyYXh2uDEBlXTbWMCOSbwB7S3D1x7pKnstFXDZfN73GA2bBC.', NULL, 'USER', 'ACTIVE', 'LOCAL', NULL, NULL, 0, NULL);
INSERT INTO `users` VALUES (5, NULL, NULL, 'vongoclinh.l2019@gmail.com', 'Ngọc Linh', '', NULL, 'ADMIN', 'ACTIVE', 'GOOGLE', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
