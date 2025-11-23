import React, { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getPaymentStatus } from "../api/paymentApi"
import "../styles/pages/CheckoutReturn.css"

export default function CheckoutReturn() {
  const navigate = useNavigate()
  const location = useLocation()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const orderCode = params.get("orderCode")

  const [status, setStatus] = useState("LOADING") // LOADING | PENDING | CAPTURED | FAILED | CANCELED | ERROR
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(null)

  const attemptsRef = useRef(0)
  const intervalRef = useRef(null)

  const isFinalStatus = (st) =>
    st === "CAPTURED" || st === "FAILED" || st === "CANCELED"

  const fetchStatus = async () => {
    if (!orderCode) return
    try {
      const data = await getPaymentStatus(orderCode)
      setPayment(data)

      const st = data?.status || "PENDING"
      if (isFinalStatus(st)) {
        setStatus(st)
        clearInterval(intervalRef.current)
        intervalRef.current = null
      } else {
        setStatus("PENDING")
      }
    } catch (e) {
      console.error(e)
      setError("Không lấy được trạng thái thanh toán. Vui lòng thử lại.")
      setStatus("ERROR")
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (!orderCode) {
      setError("Thiếu orderCode trên URL. Không thể xác nhận thanh toán.")
      setStatus("ERROR")
      return
    }

    // gọi lần đầu
    fetchStatus()

    // poll tối đa 60s (30 lần * 2s)
    intervalRef.current = setInterval(async () => {
      attemptsRef.current += 1
      if (attemptsRef.current >= 30) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        if (!isFinalStatus(payment?.status)) {
          setStatus("PENDING")
        }
        return
      }
      await fetchStatus()
    }, 2000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode])

  const renderContent = () => {
    if (status === "LOADING") {
      return (
        <>
          <div className="cr-icon spin">⏳</div>
          <h2>Đang xác nhận thanh toán…</h2>
          <p>Vui lòng đợi trong giây lát.</p>
        </>
      )
    }

    if (status === "PENDING") {
      return (
        <>
          <div className="cr-icon">🕒</div>
          <h2>Đang chờ PayOS xác nhận</h2>
          <p>
            Nếu bạn đã thanh toán, hệ thống sẽ tự cập nhật trong vài giây.
            Bạn có thể bấm “Thử lại”.
          </p>
          <button className="cr-btn cr-btn-outline" onClick={fetchStatus}>
            Thử lại
          </button>
        </>
      )
    }

    if (status === "CAPTURED") {
      return (
        <>
          <div className="cr-icon success">✅</div>
          <h2>Thanh toán thành công!</h2>
          <p>Đơn hàng của bạn đã được ghi nhận.</p>
        </>
      )
    }

    if (status === "FAILED") {
      return (
        <>
          <div className="cr-icon fail">❌</div>
          <h2>Thanh toán thất bại</h2>
          <p>Vui lòng thử lại hoặc chọn phương thức khác.</p>
        </>
      )
    }

    if (status === "CANCELED") {
      return (
        <>
          <div className="cr-icon cancel">⚠️</div>
          <h2>Bạn đã huỷ thanh toán</h2>
          <p>Đơn hàng chưa được thanh toán.</p>
        </>
      )
    }

    // ERROR
    return (
      <>
        <div className="cr-icon fail">❌</div>
        <h2>Không thể xác nhận thanh toán</h2>
        <p>{error}</p>
      </>
    )
  }

  return (
    <main className="checkout-return-wrap">
      <div className="checkout-return-card">
        {renderContent()}

        <div className="cr-meta">
          <div><b>Mã đơn:</b> {orderCode || "N/A"}</div>
          {payment?.amount != null && (
            <div><b>Số tiền:</b> {Number(payment.amount).toLocaleString("vi-VN")} đ</div>
          )}
          {payment?.providerPaymentId && (
            <div><b>Mã PayOS:</b> {payment.providerPaymentId}</div>
          )}
          {payment?.status && (
            <div><b>Trạng thái:</b> {payment.status}</div>
          )}
        </div>

        <div className="cr-actions">
          <button className="cr-btn" onClick={() => navigate("/")}>
            Về trang chủ
          </button>
          <button
            className="cr-btn cr-btn-outline"
            onClick={() => navigate("/orders")}
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </main>
  )
}
