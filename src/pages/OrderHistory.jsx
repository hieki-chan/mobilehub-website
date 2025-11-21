import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cancelOrder, getOrders } from '../api/orderApi';
import { createRating, getProductRating, updateRating } from '../api/ratingApi';
import ReviewForm from '../components/review/ReviewForm';
import '../styles/pages/order-history.css';

export default function OrderHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeStatus, setActiveStatus] = useState('ALL');
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [reviewingItem, setReviewingItem] = useState(null);
  const [userRatings, setUserRatings] = useState({});

  // Load orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // Load rating cho từng sản phẩm
  useEffect(() => {
    async function loadRatings() {
      const map = {};

      for (const order of orders) {
        for (const item of order.items) {
          try {
            const rating = await getProductRating(item.productId);
            map[item.productId] = rating; // null nếu chưa rating
          } catch {
            map[item.productId] = null;
          }
        }
      }
      setUserRatings(map);
    }

    if (orders.length > 0) loadRatings();
  }, [orders]);

  if (loading) return <div>Đang tải đơn hàng...</div>;

  const statusTextMap = {
    PENDING: 'Chờ xác nhận',
    PAID: 'Đã thanh toán',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    FAILED: 'Giao hàng thất bại'
  };

  const statusColorMap = {
    PENDING: '#ff9800',
    PAID: '#2196f3',
    SHIPPED: '#2196f3',
    DELIVERED: '#26aa99',
    CANCELLED: '#f44336',
    FAILED: '#f44336'
  };

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'SHIPPED', label: 'Đang giao' },
    { key: 'DELIVERED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' }
  ];

  const filteredOrders =
    activeStatus === 'ALL'
      ? orders
      : orders.filter(o => o.status === activeStatus);

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleCancel = async orderId => {
    try {
      await cancelOrder(orderId, cancelReason);
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, status: 'CANCELLED' } : o
        )
      );
      setCancelingOrderId(null);
      setCancelReason('');
    } catch (err) {
      console.error('Hủy đơn thất bại', err);
    }
  };

  return (
    <div className="order-container">
      <div className="order-header">
        {tabs.map(tab => (
          <div
            key={tab.key}
            className={activeStatus === tab.key ? 'order-nav-active' : 'order-nav'}
            onClick={() => setActiveStatus(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {sortedOrders.length === 0 ? (
        <div className="no-orders">Không có đơn hàng nào</div>
      ) : (
        sortedOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-status-box">
              <ShoppingCart size={16} color="#26aa99" />
              <span
                className="order-status"
                style={{ color: statusColorMap[order.status] }}
              >
                {statusTextMap[order.status]}
              </span>
            </div>

            {order.items.map(item => {
              const userRating = userRatings[item.productId];

              return (
                <div key={item.productId} className="order-product-box">
                  <div className="order-product-img-wrapper">
                    <img src={item.thumbnailUrl} className="order-product-img" />

                    {order.status === 'DELIVERED' && (
                      <button
                        className="order-review"
                        style={{ marginTop: '8px', width: '100%' }}
                        onClick={() =>
                          setReviewingItem({
                            ...item,
                            existingRating: userRating
                          })
                        }
                      >
                        {userRating ? 'Xem đánh giá' : 'Đánh giá'}
                      </button>
                    )}
                  </div>

                  <div
                    className="order-product-info"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <h3 className="order-product-name">{item.productName}</h3>
                    <p className="order-product-variant">
                      Loại hàng: {item.productVariant}
                    </p>
                    <p className="order-qty">x{item.quantity}</p>
                  </div>

                  <div className="order-price-box">
                    <span className="order-old-price">
                      {item.originalPrice?.toLocaleString('vi-VN') + '₫'}
                    </span>
                    <span className="order-current-price">
                      {item.finalPrice?.toLocaleString('vi-VN') + '₫'}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="order-info">
              <div className="order-info-box">
                <p className="order-shipping-address">
                  Địa chỉ: {order.shippingAddress}
                </p>
                <p className="order-payment-method">
                  Phương thức thanh toán: {order.paymentMethod}
                </p>
              </div>

              <div className="order-total-box">
                <span className="order-total-label">Thành tiền:</span>
                <span className="order-total">
                  {order.totalPrice?.toLocaleString('vi-VN') + '₫'}
                </span>
              </div>
            </div>

            <div className="order-actions">
              <button className="order-buy-again">Mua Lại</button>

              {order.status === 'PENDING' && (
                <>
                  {!cancelingOrderId && (
                    <button
                      className="order-cancel"
                      onClick={() => setCancelingOrderId(order.id)}
                      style={{
                        marginLeft: '8px',
                        backgroundColor: '#f44336',
                        color: '#fff'
                      }}
                    >
                      Hủy đơn
                    </button>
                  )}

                  {cancelingOrderId === order.id && (
                    <div className="cancel-form">
                      <input
                        type="text"
                        placeholder="Nhập lý do hủy..."
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        className="cancel-input"
                      />
                      <button
                        className="cancel-ok"
                        onClick={() => handleCancel(order.id)}
                        disabled={!cancelReason.trim()}
                      >
                        OK
                      </button>
                      <button
                        className="cancel-cancel"
                        onClick={() => {
                          setCancelingOrderId(null);
                          setCancelReason('');
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))
      )}

      {reviewingItem && (
        <ReviewForm
          product={reviewingItem}
          existingRating={reviewingItem.existingRating}
          onSubmit={async data => {
            try {
              let ratingResponse;
              if (reviewingItem.existingRating) {
                ratingResponse = await updateRating({
                  ratingId: reviewingItem.existingRating.id,
                  stars: data.rating,
                  comment: data.content
                });
              } else {
                ratingResponse = await createRating({
                  productId: reviewingItem.productId,
                  stars: data.rating,
                  comment: data.content
                });
              }

              setUserRatings(prev => ({
                ...prev,
                [reviewingItem.productId]: ratingResponse
              }));

              setReviewingItem(null);
              alert('Đánh giá thành công!');
            } catch (err) {
              console.error('Lỗi đánh giá:', err);
              alert('Không gửi được đánh giá!');
            }
          }}
          onClose={() => setReviewingItem(null)}
        />
      )}
    </div>
  );
}
