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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductDetails(id)
        setProduct(data)

        // Chọn variant mặc định
        const defaultVariant = data.variants?.find(v => v.id === data.defaultVariantId) || data.variants?.[0]
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

  // Lấy danh sách options
  const storageOptions = [...new Set(p.variants?.map(v => v.storage_cap) || [])]
  const colors = (p.variants || []).map(v => ({ 
    label: v.color_label, 
    value: v.color_label, 
    hex: v.color_hex 
  }))
  
  // Xác định variant đang chọn
  const selectedVariant =
    p.variants?.find(v => v.storage_cap === storageCap && v.color_label === color) ||
    p.variants?.find(v => v.id === p.defaultVariantId) ||
    p.variants?.[0]

  const galleryImages = selectedVariant
    ? [selectedVariant.imageUrl, ...(selectedVariant.subImageUrls || [])]
    : p.images || [p.image]

  const groupedSpecs = getGroupedSpecs(p.spec, selectedVariant)
  const toast = useToast()
  
  // --- LOGIC TÍNH GIÁ (Giống hệt ProductCard) ---
  const discountPercent = p.discount.valueInPercent || 0;
  const originalPrice = selectedVariant?.price || p.price || 0;
  
  // Tính giá sau giảm
  const finalPrice = discountPercent > 0 
    ? originalPrice * (1 - discountPercent / 100) 
    : originalPrice

  const handleAddToCart = async (isBuyNow = false) => {
    if (adding || !selectedVariant) return
    setAdding(true)
    try {
      await add({
        productId: p.id,
        variantId: selectedVariant.id,
        quantity: qty,
        capacity: storageCap,
        color: color
      })
      
      if (isBuyNow) {
        navigate('/cart')
      } else {
        toast.success('Đã thêm vào giỏ hàng')
      }
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi thêm vào giỏ')
    } finally {
      setAdding(false)
    }
  }

  const handleInstallment = () => {
    if (!selectedVariant) return
    navigate(`/installment?productId=${p.id}`, {
      state: { variantId: selectedVariant.id }
    });
  }

  return (
    <main className="pdp-container" id="mainContent">
      <ProductGallery images={galleryImages} />

      <aside className="pdp-info" aria-label="Thông tin sản phẩm">
        <div className="muted">SKU: <strong id="skuVal">{selectedVariant?.id || 'N/A'}</strong></div>

        <h1 id="pTitle">{p.name}</h1>

        <div className="rating">
          <div id="stars" style={{color: '#facc15'}}>★★★★★</div>
          <div className="muted" id="reviewCount">(4.9 · Đã bán 2.1k)</div>
        </div>

        {/* --- PHẦN HIỂN THỊ GIÁ (Đã sửa) --- */}
        <div className="price-row" style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: '12px', 
          marginTop: '12px',
          flexWrap: 'wrap' 
        }}>
          {/* Giá cuối cùng (To, Đỏ) */}
          <div className="price" style={{ 
            fontSize: '22px', 
            color: '#d00000', 
            fontWeight: '700', 
            lineHeight: 1 
          }}>
            {formatPrice(finalPrice)}
          </div>

          {/* Nếu có giảm giá thì hiện giá gốc gạch ngang + Badge */}
          {discountPercent > 0 && (
            <>
              <div className="old" style={{ 
                textDecoration: 'line-through', 
                color: '#888', 
                fontSize: '16px',
                 
              }}>
                {formatPrice(originalPrice)}
              </div>
              
              <div className="badge sale" style={{ 
                background: '#ffebeb', 
                color: '#d00000', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '12px', 
                fontWeight: '700', 
                marginBottom: '6px',
                border: '1px solid #d00000' 
              }}>
                -{discountPercent}%
              </div>
            </>
          )}
        </div>

        <div className="muted" id="pShort" style={{marginTop: 16, lineHeight: '1.5'}}>{p.description}</div>

        <CapacitySelector capacities={storageOptions} value={storageCap} onChange={setStorageCap} />
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
          <div className="muted" id="stockInfo">
            Tình trạng: <strong id="stockVal" style={{color: '#10b981'}}>
              {p.status === 'coming_soon' ? 'Sắp có hàng' : (selectedVariant ? 'Còn hàng' : 'Hết hàng')}
            </strong>
          </div>

          <div className="social-actions">
            <button
              className={`social-btn favorite-btn ${isFav(p.id) ? 'active' : ''}`}
              onClick={() => toggle(p.id)}
            >
              <i className={isFav(p.id) ? 'fa fa-heart' : 'fa-regular fa-heart'}></i>
            </button>

            <button
              className="social-btn share-btn"
              onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Đã sao chép liên kết'))
              }}
            >
              <i className="fa fa-share-nodes"></i>
            </button>
          </div>
        </div>
      </aside>

      <section style={{ gridColumn: '1 / -1' }}>
        <div className="desc">
          <h3>Mô tả sản phẩm</h3>
          <p id="longDesc" style={{whiteSpace: 'pre-line', lineHeight: '1.6'}}>{p.description}</p>
        </div>

        <ProductSpecs specs={groupedSpecs} />
        <Reviews productId={p.id} />
        <RelatedProducts products={[]} currentId={p.id} />
      </section>
    </main>
  )
}