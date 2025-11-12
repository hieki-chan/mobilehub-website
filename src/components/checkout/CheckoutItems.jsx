import React from 'react'
import { formatPrice } from '../../utils/formatPrice'

export default function CheckoutItems({ items = [] }) {
  if (!items.length) {
    return <p className="muted">Không có sản phẩm nào được chọn.</p>
  }

  return (
    <div className="summary-items">
      {items.map((item, idx) => {
        const selectedVariant =
          item.variants?.find(v => v.id === item.variantId) || item.variants?.[0]

        if (!selectedVariant) return null

        const hasDiscount = item.discountInPercent > 0
        const originalPrice = selectedVariant.price
        const discountedPrice =
          originalPrice * (1 - (item.discountInPercent || 0) / 100)

        const subtotal = discountedPrice * (item.quantity || 1)

        return (
          <div key={idx} className="summary-item">
            <img
              src={selectedVariant.imageUrl || '/no-image.png'}
              alt={item.name}
            />

            <div className="summary-item-info">
              <div className="summary-item-name">{item.name}</div>

              <div className="muted">
                {selectedVariant.color_label &&
                  `${selectedVariant.color_label} - `}
                {selectedVariant.storage_cap &&
                  `${selectedVariant.storage_cap}GB - `}
                {selectedVariant.ram && `${selectedVariant.ram}GB RAM`}
              </div>

              <div className="muted">SL: {item.quantity || 1}</div>
            </div>

            <div className="summary-item-price" style={{ textAlign: 'right' }}>
              {hasDiscount && (
                <div
                  style={{
                    fontSize: 13,
                    color: '#888',
                    textDecoration: 'line-through',
                    marginBottom: 2,
                  }}
                >
                  {formatPrice(originalPrice * item.quantity)}
                </div>
              )}
              <div
                style={{
                  fontWeight: 600,
                  color: hasDiscount ? '#e53935' : '#000',
                }}
              >
                {formatPrice(subtotal)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
