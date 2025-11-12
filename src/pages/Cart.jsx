import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCart from '../hooks/useCart'
import { formatPrice } from '../utils/formatPrice'
import CartItem from '../components/cart/CartItem'
import '../styles/pages/cart.css'
import { getText } from 'number-to-text-vietnamese'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, remove, updateQty, updateVariant, clear, loading, error } = useCart()
  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    document.title = 'Giỏ hàng | MobileHub'
  }, [])

  const toggleSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) setSelectedItems([])
    else setSelectedItems(cart.map((item) => item.id))
  }

  const selectedTotal = cart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => {
      const variant = item.variants?.find((v) => v.id === item.variantId)
      if (!variant) return sum
      const price = variant.price * (1 - (item.discountInPercent || 0) / 100)
      return sum + price * (item.quantity || 1)
    }, 0)

  const cartTotal = Math.round(selectedTotal * 100) / 100

  function checkout() {
    navigate('/checkout', { state: { selectedItems } })
  }

  if (error) {
    return (
      <main className="cart-container" style={{ padding: 28, textAlign: 'center' }}>
        <h2>Lỗi: {error}</h2>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </main>
    )
  }

  if (!cart || cart.length === 0) {
    return (
      <main className="cart-container" style={{ padding: 28, textAlign: 'center' }}>
        <h2>Giỏ hàng của bạn trống</h2>
        <p className="muted">Chưa có sản phẩm nào trong giỏ. Hãy thêm vài món bạn thích.</p>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            Quay về trang chủ
          </button>
          <button className="btn" onClick={() => navigate(-1)}>
            Tiếp tục xem
          </button>
        </div>
      </main>
    )
  }

  let totalInWords = ''
  const [intPart, decimalPart] = cartTotal.toString().split('.')
  totalInWords = getText(parseInt(intPart))
  if (decimalPart && parseInt(decimalPart) > 0) {
    const decimalText = decimalPart
      .split('')
      .map((d) => getText(parseInt(d)))
      .join(' ')
    totalInWords += ' phẩy ' + decimalText
  }
  const totalInWordsFormatted = totalInWords
    ? totalInWords.charAt(0).toUpperCase() + totalInWords.slice(1)
    : 'Không có sản phẩm nào được chọn'

  return (
    <main className="cart-container" style={{ padding: 20, position: 'relative' }}>
      <h3 className="section-title">Giỏ hàng ({cart.length} sản phẩm)</h3>

      <div style={{ marginBottom: 10 }}>
        <label style={{ cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={selectedItems.length === cart.length}
            onChange={toggleSelectAll}
            style={{ marginRight: 8 }}
          />
          Chọn tất cả
        </label>
      </div>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => toggleSelect(item.id)}
              style={{ width: 18, height: 18 }}
            />
            <CartItem
              item={item}
              loading={loading}
              remove={remove}
              updateQty={updateQty}
              updateVariant={updateVariant}
            />
          </div>
        ))}

        <div className="cart-summary-wrapper">
          <div className="cart-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="muted">Tạm tính ({selectedItems.length} sản phẩm được chọn)</div>
              <div>{formatPrice(cartTotal)}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="muted">Phí vận chuyển</div>
              <div className="muted">Miễn phí</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 750, fontSize: 18 }}>
              <div>Tổng cộng</div>
              <div>{formatPrice(cartTotal)}</div>
            </div>

            <div style={{ marginTop: 8, fontStyle: 'italic', color: '#555', fontSize: 14 }}>
              ({totalInWordsFormatted} đồng)
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                className="btn btn-primary btn-xl"
                style={{ width: '100%', height: '40px' }}
                disabled={loading || selectedItems.length === 0}
                onClick={checkout}
              >
                {loading ? 'Đang xử lý...' : `Thanh toán (${formatPrice(cartTotal)})`}
              </button>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button
                className="btn"
                style={{ flex: 1 }}
                disabled={loading || cart.length === 0}
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) clear()
                }}
              >
                Xóa giỏ
              </button>

              <button
                className="btn"
                style={{ flex: 1 }}
                disabled={loading}
                onClick={() => navigate('/')}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
