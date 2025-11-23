import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductGallery from '../components/ProductGallery'
import { CapacitySelector, ColorSelector } from '../components/VariantSelector'
import QuantitySelector from '../components/QuantitySelector'
import ActionButtons from '../components/ActionButtons'
import ProductSpecs from '../components/ProductSpecs'
import Reviews from '../components/Reviews'
import RelatedProducts from '../components/RelatedProducts'
import useCart from '../hooks/useCart'
import useFav from '../hooks/useFav'
import { formatPrice } from '../utils/formatPrice'
import '../styles/pages/product-detail.css'
import { getProductDetails } from '../api/productApi'
import { getGroupedSpecs } from '../data/products'
import { useToast } from '../components/ToastProvider'
import Breadcrumbs from '../components/Breadcrumbs';

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [p, setProduct] = useState(null)
  const [storageCap, setStorageCap] = useState(null)
  const [color, setColor] = useState(null)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  const { add } = useCart()
  const { isFav, toggle } = useFav()
  const toast = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductDetails(id)
        setProduct(data)

        // Chọn variant mặc định
        const defaultVariant =
          data.variants?.find((v) => v.id === data.defaultVariantId) ||
          data.variants?.[0]

        if (defaultVariant) {
          setStorageCap(defaultVariant.storage_cap)
          setColor(defaultVariant.color_label)
        }

        document.title = data.name + ' | MobileHub'
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [id])

  if (!p) return <div className="loading">Đang tải...</div>

  // Lấy options
  const storageOptions = [...new Set(p.variants?.map((v) => v.storage_cap) || [])]

  const colors = (p.variants || []).map((v) => ({
    label: v.color_label,
    value: v.color_label,
    hex: v.color_hex,
  }))

  // Variant đang chọn
  const selectedVariant =
    p.variants?.find(
      (v) => v.storage_cap === storageCap && v.color_label === color
    ) ||
    p.variants?.find((v) => v.id === p.defaultVariantId) ||
    p.variants?.[0]

  const galleryImages = selectedVariant
    ? [selectedVariant.imageUrl, ...(selectedVariant.subImageUrls || [])]
    : p.images || [p.image]

  const groupedSpecs = getGroupedSpecs(p.spec, selectedVariant)

  // --- LOGIC TÍNH GIÁ (ĐÃ FIX) ---
  const discountPercent = p?.discount?.valueInPercent ?? 0

  const originalPrice =
    selectedVariant?.price ??
    p?.price ??
    0

  const finalPrice =
    discountPercent > 0
      ? originalPrice * (1 - discountPercent / 100)
      : originalPrice

  // --- Add to Cart ---
  const handleAddToCart = async (isBuyNow = false) => {
    if (adding || !selectedVariant) return
    setAdding(true)
    try {
      await add({
        productId: p.id,
        variantId: selectedVariant.id,
        quantity: qty,
        capacity: storageCap,
        color: color,
      })

      if (isBuyNow) navigate('/cart')
      else toast.success('Đã thêm vào giỏ hàng')
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi thêm vào giỏ hàng')
    } finally {
      setAdding(false)
    }
  }

  // --- Trả góp ---
  const handleInstallment = () => {
    if (!selectedVariant) return

    navigate(`/installment?productId=${p.id}`, {
      state: { variantId: selectedVariant.id },
    })
  }

  return (
    <main className="pdp-container" id="mainContent">
      <div style={{ gridColumn: '1 / -1', width: '100%' }}>
        <Breadcrumbs customLast={p.name} />
      </div>
      <ProductGallery images={galleryImages} />

      <aside className="pdp-info">
        <div className="muted">
          SKU: <strong>{selectedVariant?.id || 'N/A'}</strong>
        </div>

        <h1>{p.name}</h1>

        <div className="rating">
          <div style={{ color: '#facc15' }}>★★★★★</div>
          <div className="muted">(4.9 · Đã bán {p.sold})</div>
        </div>

        {/* GIÁ */}
        <div
          className="price-row"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            marginTop: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div
            className="price"
            style={{
              fontSize: '22px',
              color: '#d00000',
              fontWeight: 700,
            }}
          >
            {formatPrice(finalPrice)}
          </div>

          {discountPercent > 0 && (
            <>
              <div
                className="old"
                style={{
                  textDecoration: 'line-through',
                  color: '#888',
                }}
              >
                {formatPrice(originalPrice)}
              </div>

              <div
                className="badge sale"
                style={{
                  background: '#ffebeb',
                  color: '#d00000',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid #d00000',
                }}
              >
                -{discountPercent}%
              </div>
            </>
          )}
        </div>

        <div className="muted" style={{ marginTop: 16 }}>
          {p.description}
        </div>

        <CapacitySelector
          capacities={storageOptions}
          value={storageCap}
          onChange={setStorageCap}
        />

        <ColorSelector colors={colors} value={color} onChange={setColor} />

        <QuantitySelector qty={qty} setQty={setQty} />

        <ActionButtons
          product={p}
          qty={qty}
          capacity={storageCap}
          color={color}
          onAddCart={() => handleAddToCart(false)}
          onBuyNow={() => handleAddToCart(true)}
          onInstallmentBuy={handleInstallment}
          disabled={adding || !selectedVariant}
        />

        <div className="stock-info-row">
          <div className="muted">
            Tình trạng:{' '}
            <strong style={{ color: '#10b981' }}>
              {p.status === 'coming_soon'
                ? 'Sắp có hàng'
                : selectedVariant
                ? 'Còn hàng'
                : 'Hết hàng'}
            </strong>
          </div>

          <div className="social-actions">
            <button
              className={`social-btn favorite-btn ${
                isFav(p.id) ? 'active' : ''
              }`}
              onClick={() => toggle(p.id)}
            >
              <i className={isFav(p.id) ? 'fa fa-heart' : 'fa-regular fa-heart'}></i>
            </button>

            <button
              className="social-btn share-btn"
              onClick={() =>
                navigator.clipboard
                  ?.writeText(window.location.href)
                  .then(() => toast.success('Đã sao chép liên kết'))
              }
            >
              <i className="fa fa-share-nodes"></i>
            </button>
          </div>
        </div>
      </aside>

      <section style={{ gridColumn: '1 / -1' }}>
        <div className="desc">
          <h3>Mô tả sản phẩm</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{p.description}</p>
        </div>

        <ProductSpecs specs={groupedSpecs} />
        <Reviews productId={p.id} />
        <RelatedProducts products={[]} currentId={p.id} />
      </section>
    </main>
  )
}
