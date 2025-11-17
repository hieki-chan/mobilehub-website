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
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán')
      return
    }
    navigate('/checkout', { state: { selectedItems } })
  }

  if (error) {
    return (
      <main className="cart-page-container">
        <div className="cart-page-empty">
          <i className="fa fa-exclamation-triangle" style={{ fontSize: 48, color: '#ef4444', marginBottom: 16 }}></i>
          <h2>Lỗi: {error}</h2>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </main>
    )
  }

  if (!cart || cart.length === 0) {
    return (
      <main className="cart-page-container">
        <div className="cart-page-empty">
          <i className="fa fa-shopping-cart" style={{ fontSize: 64, color: '#cbd5e1', marginBottom: 20 }}></i>
          <h2>Giỏ hàng của bạn trống</h2>
          <p className="muted">Chưa có sản phẩm nào trong giỏ. Hãy khám phá và thêm những sản phẩm yêu thích!</p>
          <div className="cart-page-empty-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
              <i className="fa fa-home"></i> Khám phá ngay
            </button>
          </div>
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
    <main className="cart-page-container">
      {/* Header */}
      <div className="cart-page-header">
        <h2 className="cart-page-title">
          <i className="fa fa-shopping-cart"></i>
          Giỏ hàng của bạn
        </h2>
        <span className="cart-page-count">{cart.length} sản phẩm</span>
      </div>

      {/* Select All Bar */}
      <div className="cart-page-select-bar">
        <label className="cart-page-checkbox-label">
          <input
            type="checkbox"
            className="cart-page-checkbox"
            checked={selectedItems.length === cart.length && cart.length > 0}
            onChange={toggleSelectAll}
          />
          <span>Chọn tất cả ({cart.length})</span>
        </label>

        {selectedItems.length > 0 && (
          <button
            className="cart-page-delete-selected"
            onClick={() => {
              if (confirm(`Xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
                selectedItems.forEach(id => {
                  const item = cart.find(i => i.id === id)
                  if (item) remove(item)
                })
                setSelectedItems([])
              }
            }}
          >
            <i className="fa fa-trash"></i>
            Xóa ({selectedItems.length})
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="cart-page-items-wrapper">
        {cart.map((item) => (
          <div key={item.id} className="cart-page-item-row">
            <input
              type="checkbox"
              className="cart-page-checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => toggleSelect(item.id)}
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
      </div>

      {/* Bottom padding for fixed bar */}
      <div className="cart-page-bottom-spacer"></div>

      {/* Fixed Bottom Summary Bar - Shopee Style */}
      <div className="cart-page-bottom-bar">
        <div className="cart-page-bottom-bar-inner">
          {/* Left: Select All */}
          <div className="cart-page-bottom-left">
            <label className="cart-page-checkbox-label">
              <input
                type="checkbox"
                className="cart-page-checkbox"
                checked={selectedItems.length === cart.length && cart.length > 0}
                onChange={toggleSelectAll}
              />
              <span>Tất cả</span>
            </label>

            {selectedItems.length > 0 && (
              <button
                className="cart-page-link-btn"
                onClick={() => {
                  if (confirm(`Xóa ${selectedItems.length} sản phẩm?`)) {
                    selectedItems.forEach(id => {
                      const item = cart.find(i => i.id === id)
                      if (item) remove(item)
                    })
                    setSelectedItems([])
                  }
                }}
              >
                Xóa
              </button>
            )}
          </div>

          {/* Right: Total & Checkout */}
          <div className="cart-page-bottom-right">
            <div className="cart-page-total-info">
              <div className="cart-page-total-label">
                Tổng thanh toán ({selectedItems.length} sản phẩm):
              </div>
              <div className="cart-page-total-price">
                {formatPrice(cartTotal)}
              </div>
              <div className="cart-page-total-in-words">
                {totalInWordsFormatted} đồng
              </div>
            </div>

            <button
              className="cart-page-checkout-btn"
              disabled={loading || selectedItems.length === 0}
              onClick={checkout}
            >
              {loading ? 'Đang xử lý...' : 'Mua hàng'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}