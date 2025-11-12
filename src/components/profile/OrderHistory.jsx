import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import '../../styles/components/profile/order-history.css'

export default function OrderHistory() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const sorted = storedOrders.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
    setOrders(sorted)
  }, [])

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Chờ xác nhận', class: 'status-pending' },
      confirmed: { label: 'Đã xác nhận', class: 'status-confirmed' },
      shipping: { label: 'Đang giao', class: 'status-shipping' },
      delivered: { label: 'Đã giao', class: 'status-delivered' },
      cancelled: { label: 'Đã hủy', class: 'status-cancelled' }
    }
    const info = statusMap[status] || statusMap.pending
    return <span className={`order-status ${info.class}`}>{info.label}</span>
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (orders.length === 0) {
    return (
      <div>
        <h3>Lịch sử đơn hàng</h3>
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

  return (
    <div>
      <h3>Lịch sử đơn hàng ({orders.length})</h3>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <div className="order-id">
                  <strong>Mã đơn:</strong> {order.id}
                </div>
                <div className="order-date">{formatDate(order.createdAt)}</div>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="order-items">
              {order.items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="order-item-preview">
                  <img src={item.image || '/no-image.png'} alt={item.name} />
                  <div className="order-item-info">
                    <div className="order-item-name">{item.name}</div>
                    <div className="order-item-meta">
                      {item.capacity && <span>{item.capacity}</span>}
                      {item.color && <span> • {item.color}</span>}
                      <span> • SL: {item.qty}</span>
                    </div>
                  </div>
                  <div className="order-item-price">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
              {order.items.length > 2 && (
                <div className="order-more-items">
                  và {order.items.length - 2} sản phẩm khác
                </div>
              )}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Tổng tiền:</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedOrder(order)}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="modal-overlay open" onClick={() => setSelectedOrder(null)}>
          <div className="modal order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
            <div className="modal-body">
              <h3>Chi tiết đơn hàng</h3>
              
              <div className="order-detail-section">
                <h4>Thông tin đơn hàng</h4>
                <div className="order-detail-row">
                  <span>Mã đơn:</span>
                  <strong>{selectedOrder.id}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Ngày đặt:</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="order-detail-row">
                  <span>Trạng thái:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <div className="order-detail-section">
                <h4>Thông tin người nhận</h4>
                <div className="order-detail-row">
                  <span>Họ tên:</span>
                  <span>{selectedOrder.customerInfo.fullName}</span>
                </div>
                <div className="order-detail-row">
                  <span>Số điện thoại:</span>
                  <span>{selectedOrder.customerInfo.phone}</span>
                </div>
                <div className="order-detail-row">
                  <span>Email:</span>
                  <span>{selectedOrder.customerInfo.email}</span>
                </div>
                <div className="order-detail-row">
                  <span>Địa chỉ:</span>
                  <span>{selectedOrder.customerInfo.address}</span>
                </div>
              </div>

              <div className="order-detail-section">
                <h4>Sản phẩm</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="order-detail-item">
                    <img src={item.image || '/no-image.png'} alt={item.name} />
                    <div className="order-detail-item-info">
                      <div className="order-detail-item-name">{item.name}</div>
                      <div className="order-detail-item-meta">
                        {item.capacity && <span>{item.capacity}</span>}
                        {item.color && <span> • {item.color}</span>}
                      </div>
                      <div>SL: {item.qty}</div>
                    </div>
                    <div className="order-detail-item-price">
                      {formatPrice(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-detail-section">
                <h4>Thanh toán</h4>
                <div className="order-detail-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="order-detail-row">
                  <span>Phí vận chuyển:</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'Miễn phí' : formatPrice(selectedOrder.shippingFee)}</span>
                </div>
                <div className="order-detail-row order-detail-total">
                  <span>Tổng cộng:</span>
                  <strong>{formatPrice(selectedOrder.total)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
