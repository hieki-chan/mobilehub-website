import React, { useState } from 'react';
import { MessageCircle, Store, ShoppingCart } from 'lucide-react';
import '../styles/pages/orderhistory.css';

export default function ShopeeCart() {
  const [cartItems] = useState([
{
      id: 1,
      shopName: '@JULIDO',
      shopBadge: 'Yêu thích',
      productName: 'Bộ quần áo nam nữ cao cấp thoáng mát thông hơi cotton waffle menswear',
      variant: 'Phân loại hàng: Bộ trơnwaleNG777NAVLL 55-65KG',
      quantity: 1,
      originalPrice: '299.000₫',
      currentPrice: '119.000₫',
      image: 'https://via.placeholder.com/80',
      total: '95.200₫',
      status: 'HOÀN THÀNH',
      hasSuccessDelivery: true
    },
    {
      id: 2,
      shopName: 'Giầy Kuul - Thời trang giá rẻ',
      shopBadge: 'Yêu thích',
      productName: 'Dép đúc loufu nam nữ,unisex,Siêu bền êm đẹp 1185vs',
      variant: 'Phân loại hàng: Ghi,41',
      quantity: 1,
      originalPrice: '50.000₫',
      currentPrice: '25.000₫',
      image: 'https://via.placeholder.com/80',
      total: '15.000₫',
      status: 'ĐÁNH GIÁ',
      hasSuccessDelivery: true
    },
    {
      id: 3,
      shopName: 'TopGia Official',
      shopBadge: 'Mall',
      productName: 'Giấy ăn rút Top Gia, thùng 30 gói/16 gói 4 lớp cao cấp tiện lợi',
      variant: 'Phân loại hàng: 30 gói (MIX 3 MÀU)',
      quantity: 1,
      originalPrice: '199.000₫',
      currentPrice: '145.000₫',
      image: 'https://via.placeholder.com/80',
      total: '112.000₫',
      status: 'ĐÁNH GIÁ',
      hasSuccessDelivery: true
    }
    
  ]);

  return (
    <div className="shopee-container">

      <div className="shopee-header">
        <div className="nav-item">Tất cả</div>
        <div className="nav-item-inactive">Chờ xác nhận</div>
        <div className="nav-item-inactive">Vận chuyển</div>
        <div className="nav-item-inactive">Chờ giao hàng</div>
        <div className="nav-item-inactive">Hoàn thành</div>
        <div className="nav-item-inactive">Đã hủy</div>
        <div className="nav-item-inactive">Trả hàng/Hoàn tiền</div>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
        />
      </div>

      {cartItems.map((item) => (
        <div key={item.id} className="order-card">

          <div className="shop-header">
            <div className="shop-info">
              {item.shopBadge === 'Mall' ? (
                <span className="mall-badge">Mall</span>
              ) : (
                <span className="favorite-badge">{item.shopBadge}</span>
              )}
              <span className="shop-name">{item.shopName}</span>

              <button className="chat-btn">
                <MessageCircle size={14} />
                <span>Chat</span>
              </button>

              <button className="view-shop-btn">
                <Store size={14} />
                <span>Xem Shop</span>
              </button>
            </div>

            <div className="delivery-status">
              {item.hasSuccessDelivery && (
                <>
                  <ShoppingCart size={16} color="#26aa99" />
                  <span className="delivery-text">Giao hàng thành công</span>
                  <span className="status-badge">{item.status}</span>
                </>
              )}
            </div>
          </div>

          <div className="product-section">
            <img src={item.image} alt={item.productName} className="product-image" />
            <div className="product-details">
              <h3 className="product-name">{item.productName}</h3>
              <p className="product-variant">{item.variant}</p>
              <p className="quantity">x{item.quantity}</p>
            </div>

            <div className="price-section">
              <span className="original-price">{item.originalPrice}</span>
              <span className="current-price">{item.currentPrice}</span>
            </div>
          </div>

          <div className="order-footer">
            <div className="total-section">
              <span className="total-label">Thành tiền:</span>
              <span className="total-price">{item.total}</span>
            </div>
          </div>

          <div className="action-buttons">
            {item.status === 'HOÀN THÀNH' ? (
              <>
                <button className="buy-again-btn">Mua Lại</button>
                <button className="contact-seller-btn">Liên Hệ Người Bán</button>
              </>
            ) : (
              <>
                <button className="buy-again-btn">Mua Lại</button>
                <button className="contact-seller-btn">Liên Hệ Người Bán</button>
                <button className="review-btn">Xem Đánh Giá Shop</button>
              </>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
