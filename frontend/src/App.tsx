import type { CSSProperties } from "react";
import { products } from "./data/products";

const stats = [
  { value: "500+", label: "Khách hàng" },
  { value: "120+", label: "Sản phẩm" },
  { value: "95%", label: "Hài lòng" },
];

const features = [
  "Cây cảnh mini đa dạng",
  "Dễ chăm sóc và trang trí",
  "Giao diện thân thiện",
  "Thích hợp cho học sinh, sinh viên",
];

function App() {
  return (
    <div className="page">
      <header className="header">
        <div className="container header__inner">
          <a className="logo" href="#top">
            <span>Mini</span>Garden
          </a>
          <nav className="nav">
            <a href="#san-pham">Sản phẩm</a>
            <a href="#tinh-nang">Tính năng</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero container" id="top">
          <div className="hero__content">
            <p className="eyebrow">Cây cảnh mini</p>
            <h1>MiniGarden - Không gian xanh trong tầm tay bạn</h1>
            <p className="hero__text">
              MiniGarden cung cấp các loại cây cảnh mini, sen đá, xương rồng và cây trang trí
              giúp không gian sống thêm xanh, thư giãn và gần gũi thiên nhiên.
            </p>

            <div className="hero__actions">
              <a className="btn btn--primary" href="#san-pham">
                Xem sản phẩm
              </a>
              <a className="btn btn--ghost" href="#tinh-nang">
                Tính năng
              </a>
            </div>
          </div>

          <div className="hero__card">
            <h2>Khởi tạo nhanh</h2>
            <p>
              Template React + Vite cho MiniGarden, dễ dàng phát triển thêm giỏ hàng, đăng nhập và quản trị.
            </p>
            <div className="hero__mini-grid">
              {stats.map((item) => (
                <div className="mini-stat" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container section" id="san-pham">
          <div className="section__head">
            <div>
              <p className="eyebrow">Sản phẩm nổi bật</p>
              <h2>Danh sách cây cảnh mini</h2>
            </div>
          </div>

          <div className="grid">
            {products.map((product) => {
              const cardStyle = { "--accent": product.accent } as CSSProperties;

              return (
                <article className="card" key={product.id} style={cardStyle}>
                  <div className="card__media">{product.emoji}</div>
                  <div className="card__body">
                    <span className="badge">{product.tag}</span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="card__footer">
                      <strong>{product.price}</strong>
                      <button type="button">Liên hệ</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container section" id="tinh-nang">
          <div className="section__head">
            <div>
              <p className="eyebrow">Tính năng</p>
              <h2>Điểm mạnh của MiniGarden</h2>
            </div>
          </div>

          <div className="feature-list">
            {features.map((feature) => (
              <div className="feature" key={feature}>
                {feature}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>MiniGarden • Website bán cây cảnh mini cho không gian sống xanh</p>
        </div>
      </footer>
    </div>
  );
}

export default App;