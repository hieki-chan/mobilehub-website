import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders } from '../../api/orderApi'
import { formatPrice } from '../../utils/formatPrice'
import '../../styles/components/profile/order-history.css'

export default function OrderHistory() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  // Số lượng đơn hàng hiển thị tối đa ở bản xem trước
  const PREVIEW_LIMIT = 3

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders()
        if (Array.isArray(data)) {
          // Sắp xếp đơn mới nhất lên đầu
          setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        } else {
          setOrders([])
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xác nhận', class: 'status-pending' },
      CONFIRMED: { label: 'Đã xác nhận', class: 'status-confirmed' },
      SHIPPING: { label: 'Đang giao', class: 'status-shipping' },
      DELIVERED: { label: 'Giao thành công', class: 'status-delivered' },
      CANCELLED: { label: 'Đã hủy', class: 'status-cancelled' },
      FAILED: { label: 'Thất bại', class: 'status-cancelled' }
    }
    const info = statusMap[status] || { label: status, class: '' }
    return <span className={`order-status ${info.class}`}>{info.label}</span>
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: 24 }}></i>
        <div style={{ marginTop: 10 }}>Đang tải hoạt động gần đây...</div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div>
        <h3>Đơn hàng gần đây</h3>
        <div className="empty-state">
          <i className="fa fa-receipt"></i>
          <div>Bạn chưa có đơn hàng nào</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Khám phá sản phẩm
          </button>
        </div>
      </div>
    )
  }

  // Chỉ lấy ra danh sách preview
  const visibleOrders = orders.slice(0, PREVIEW_LIMIT)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0 }}>Đơn hàng gần đây</h3>
        {/* Link text nhỏ cho gọn */}
        {orders.length > PREVIEW_LIMIT && (
            <span 
                onClick={() => navigate('/order-history')}
                style={{ cursor: 'pointer', color: 'var(--brand-primary)', fontSize: 14, fontWeight: 600 }}
            >
                Xem tất cả ({orders.length}) <i className="fa fa-angle-right"></i>
            </span>
        )}
      </div>

      <div className="orders-list">
        {visibleOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <div className="order-id">
                  <strong>#{order.id}</strong>
                </div>
                <div className="order-date">{formatDate(order.createdAt)}</div>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="order-items">
              {order.items?.slice(0, 2).map((item, idx) => (
                <div key={idx} className="order-item-preview">
                  <img 
                    src={item.thumbnailUrl || item.productImage || '/no-image.png'} 
                    alt={item.productName} 
                    onError={e => e.target.src='/no-image.png'} 
                  />
                  <div className="order-item-info">
                    <div className="order-item-name">{item.productName}</div>
                    <div className="order-item-meta">
                       {item.productVariant && <span>{item.productVariant} • </span>}
                       <span>SL: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="order-item-price">
                    {formatPrice(item.finalPrice || item.price)}
                  </div>
                </div>
              ))}
              
              {order.items?.length > 2 && (
                <div className="order-more-items">
                  và {order.items.length - 2} sản phẩm khác
                </div>
              )}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Tổng tiền:</span>
                <strong>{formatPrice(order.totalPrice || order.totalAmount)}</strong>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedOrder(order)}
              >
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Nút lớn Xem tất cả ở dưới cùng nếu danh sách dài */}
      {orders.length > PREVIEW_LIMIT && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button 
                className="btn btn-outline" 
                style={{ minWidth: 200 }}
                onClick={() => navigate('/order-history')}
            >
                Xem toàn bộ lịch sử đơn hàng
            </button>
        </div>
      )}

      {/* Modal Chi Tiết Đơn Hàng - Giữ nguyên logic cũ */}
      {selectedOrder && (
        <div className="modal-overlay open" onClick={() => setSelectedOrder(null)}>
          <div className="modal order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
            <div className="modal-body">
              <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              
              <div className="order-detail-section">
                <h4>Thông tin chung</h4>
                <div className="order-detail-row">
                  <span>Ngày đặt:</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="order-detail-row">
                  <span>Trạng thái:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="order-detail-row">
                  <span>Phương thức thanh toán:</span>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
                <div className="order-detail-row">
                  <span>Ghi chú:</span>
                  <span>{selectedOrder.note || 'Không có'}</span>
                </div>
              </div>

              <div className="order-detail-section">
                <h4>Địa chỉ nhận hàng</h4>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.5 }}>
                  {selectedOrder.shippingAddress || selectedOrder.address}
                </p>
              </div>

              <div className="order-detail-section">
                <h4>Sản phẩm</h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="order-detail-item">
                    <img 
                      src={item.thumbnailUrl || item.productImage || '/no-image.png'} 
                      alt={item.productName}
                      onError={e => e.target.src='/no-image.png'} 
                    />
                    <div className="order-detail-item-info">
                      <div className="order-detail-item-name">{item.productName}</div>
                      <div className="order-detail-item-meta">
                        {item.productVariant}
                      </div>
                      <div>SL: {item.quantity}</div>
                    </div>
                    <div className="order-detail-item-price">
                      {formatPrice((item.finalPrice || item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-detail-section">
                <h4>Thanh toán</h4>
                <div className="order-detail-row order-detail-total">
                  <span>Tổng cộng:</span>
                  <strong>{formatPrice(selectedOrder.totalPrice || selectedOrder.totalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}