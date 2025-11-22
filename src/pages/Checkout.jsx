import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useCart from '../hooks/useCart'
import CheckoutItems from '../components/checkout/CheckoutItems'
import AddressPopup from '../components/address/AddressPopup'
import { formatPrice } from '../utils/formatPrice'
import { getDefaultAddress } from "../api/addressApi"
import { createOrder } from "../api/orderApi"
import '../styles/pages/checkout.css'
import { getText } from 'number-to-text-vietnamese'
import { useToast } from '../components/ToastProvider'

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedItems = location.state?.selectedItems || []
  const { cart: fullCart, clear } = useCart()

  const cart = fullCart.filter(item => selectedItems.includes(item.id))

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressPopup, setShowAddressPopup] = useState(false)

  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [note, setNote] = useState("")

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedItems.length) {
      navigate('/cart')
      return
    }

    // Fetch địa chỉ mặc định
    const fetchDefault = async () => {
      try {
        const res = await getDefaultAddress()
        setSelectedAddress(res)
      } catch (e) { }
    }
    fetchDefault()
  }, [])

  const shippingFee = shippingMethod === 'express' ? 50000 : 0

  const subtotal = cart.reduce((sum, item) => {
    const variant = item.variants?.find(v => v.id === item.variantId)
    if (!variant) return sum

    const price = variant.price * (1 - (item.discountInPercent || 0) / 100)
    return sum + price * item.quantity
  }, 0)

  const total = subtotal + shippingFee

  const roundedTotal = Math.round(total * 100) / 100

  let totalInWords = ''
  const [intPart, decimalPart] = roundedTotal.toString().split('.')

  totalInWords = getText(parseInt(intPart))

  if (decimalPart && parseInt(decimalPart) > 0) {
    const decimalText = decimalPart
      .split('')
      .map((d) => getText(parseInt(d)))
      .join(' ')
    totalInWords += ' phẩy ' + decimalText
  }

  const totalInWordsFormatted =
    totalInWords.charAt(0).toUpperCase() + totalInWords.slice(1)

  const toast = useToast()
  const handleSubmit = async () => {
    if (!selectedAddress) {
      toast.warning("Vui lòng chọn địa chỉ giao hàng")
      return
    }

    const order = {
      paymentMethod: paymentMethod.toUpperCase(),
      shippingMethod: shippingMethod.toUpperCase(),
      note: note,
      addressId: selectedAddress.id,
      items: cart.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      }))
    }

    try {
      setLoading(true)
      await createOrder(order)

      toast.success("Đặt hàng thành công!")
      navigate("/")

    } catch (error) {
      console.error(error)
      toast.error("Đặt hàng thất bại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="checkout-wrap">
      {showAddressPopup && (
        <AddressPopup
          selectedId={selectedAddress?.id}
          onClose={() => setShowAddressPopup(false)}
          onSelect={(addr) => {
            setSelectedAddress(addr)
            setShowAddressPopup(false)
          }}
        />
      )}

      <div className="checkout-left">
        <h2 className="checkout-title">Giỏ hàng của bạn</h2>

        <div className="checkout-address">
          <div className="address-label">Địa chỉ giao hàng</div>

          {selectedAddress ? (
            <div className="address-box">
              <div className="name">
                {selectedAddress.fullName} | {selectedAddress.phoneNumber}
                {selectedAddress.isDefault && (
                  <span className="checkout-default-badge">Mặc định</span>
                )}
              </div>

              <div className="text">
                {[selectedAddress.addressDetail, selectedAddress.ward, selectedAddress.district, selectedAddress.province]
                  .filter(Boolean).join(', ')}
              </div>

              <button className="change-btn" onClick={() => setShowAddressPopup(true)}>
                Thay đổi
              </button>
            </div>
          ) : (
            <button className="select-btn" onClick={() => setShowAddressPopup(true)}>
              Chọn địa chỉ giao hàng
            </button>
          )}
        </div>

        <CheckoutItems items={cart} />

        <div className="ship-box">
          <div className="ship-title">Phương thức giao hàng</div>

          <label className="ship-option">
            <input
              type="radio"
              name="ship"
              value="standard"
              checked={shippingMethod === 'standard'}
              onChange={() => setShippingMethod('standard')}
            />
            <div className="ship-info">
              <div className="ship-name">Giao hàng tiêu chuẩn</div>
              <div className="ship-desc">3–5 ngày</div>
            </div>
            <div className="ship-price">Miễn phí</div>
          </label>

          <label className="ship-option">
            <input
              type="radio"
              name="ship"
              value="express"
              checked={shippingMethod === 'express'}
              onChange={() => setShippingMethod('express')}
            />
            <div className="ship-info">
              <div className="ship-name">Giao nhanh</div>
              <div className="ship-desc">1–2 ngày</div>
            </div>
            <div className="ship-price">{formatPrice(50000)}</div>
          </label>
        </div>

        <div className="pay-box">
          <div className="ship-title">Phương thức thanh toán</div>

          <label className="pay-option">
            <input
              type="radio"
              name="pay"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
            />
            <div className="pay-name">Thanh toán khi nhận hàng (COD)</div>
          </label>

          <label className="pay-option">
            <input
              type="radio"
              name="pay"
              value="bank"
              checked={paymentMethod === 'bank'}
              onChange={() => setPaymentMethod('bank')}
            />
            <div className="pay-name">Chuyển khoản ngân hàng</div>
          </label>
        </div>

        <div className="note-box">
          <label>Ghi chú đơn hàng</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Nhập ghi chú nếu cần..."
          />
        </div>
      </div>

      <div className="checkout-right">
        <h3 className="summary-title">Đơn hàng</h3>

        <div className="summary-row">
          <span>Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="summary-row">
          <span>Phí vận chuyển</span>
          <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
        </div>

        <div className="summary-total">
          <span>Tổng cộng</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div style={{ marginTop: 8, fontStyle: 'italic', color: '#555', fontSize: 14 }}>
          ({totalInWordsFormatted} đồng)
        </div>

        <button className="btn-checkout" disabled={loading} onClick={handleSubmit}>
          {loading ? 'Đang xử lý...' : 'Thanh toán'}
        </button>

        <button className="btn-back" onClick={() => navigate('/cart')}>
          Quay lại giỏ hàng
        </button>
      </div>
    </main>
  )
}
