import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "../styles/pages/CheckoutReturn.css" // dùng chung style return nếu muốn

export default function CheckoutCancel() {
  const nav = useNavigate()
  const params = new URLSearchParams(useLocation().search)
  const orderCode = params.get("orderCode")

  return (
    <main className="checkout-return-wrap">
      <div className="checkout-return-card">
        <div className="cr-icon cancel">⚠️</div>
        <h2>Bạn đã huỷ thanh toán</h2>
        <p>Đơn hàng chưa được thanh toán.</p>

        <div className="cr-meta">
          <div><b>Mã đơn:</b> {orderCode || "N/A"}</div>
        </div>

        <div className="cr-actions">
          <button className="cr-btn" onClick={() => nav("/cart")}>
            Quay lại giỏ hàng
          </button>
          <button className="cr-btn cr-btn-outline" onClick={() => nav("/order-history")}>
            Xem đơn hàng
          </button>
        </div>
      </div>
    </main>
  )
}
