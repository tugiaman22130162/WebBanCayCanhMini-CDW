// export type Product = {
//   id: number;
//   emoji: string;
//   tag: string;
//   name: string;
//   price: string;
//   description: string;
//   accent: string;
// };

// export const products: Product[] = [
//   {
//     id: 1,
//     emoji: "🌵",
//     tag: "Bán chạy",
//     name: "Xương rồng mini",
//     price: "45.000đ",
//     description: "Cây nhỏ dễ chăm sóc, phù hợp đặt bàn làm việc và trang trí góc học tập.",
//     accent: "#22c55e",
//   },
//   {
//     id: 2,
//     emoji: "🪴",
//     tag: "Mới về",
//     name: "Sen đá mix chậu",
//     price: "60.000đ",
//     description: "Sen đá nhiều màu sắc, mang ý nghĩa may mắn và tài lộc.",
//     accent: "#84cc16",
//   },
//   {
//     id: 3,
//     emoji: "🌿",
//     tag: "Giá tốt",
//     name: "Cây kim tiền mini",
//     price: "120.000đ",
//     description: "Loại cây phong thủy giúp thu hút tài lộc, thích hợp để trong nhà.",
//     accent: "#16a34a",
//   },
//   {
//     id: 4,
//     emoji: "🍀",
//     tag: "Ưu đãi",
//     name: "Cây cỏ may mắn",
//     price: "35.000đ",
//     description: "Cây nhỏ xinh tượng trưng cho sự may mắn và năng lượng tích cực.",
//     accent: "#4ade80",
//   },
// ];


export type Product = {
  id: number;
  name: string;
  category: string;
  price: string | number;
  image: string;
};