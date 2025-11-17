import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { getProductDetails } from '../api/productApi'
import { formatPrice } from '../utils/formatPrice'
import '../styles/pages/installment.css'

const financialPartners = [
  {
    id: 'home_credit',
    name: 'Home Credit',
    logo: 'https://via.placeholder.com/80x40?text=HC',
    terms: [6, 9, 12, 18],
    interestRate: 0,
    requireCard: false,
    description: 'Duyệt nhanh 5 phút, không cần thẻ tín dụng'
  },
  {
    id: 'fe_credit',
    name: 'FE Credit',
    logo: 'https://via.placeholder.com/80x40?text=FE',
    terms: [6, 9, 12, 15, 18],
    interestRate: 0,
    requireCard: false,
    description: 'Lãi suất 0%, duyệt nhanh online'
  },
  {
    id: 'mcredit',
    name: 'MCredit',
    logo: 'https://via.placeholder.com/80x40?text=MC',
    terms: [6, 9, 12],
    interestRate: 0,
    requireCard: false,
    description: 'Trả góp 0% qua app MCredit'
  },
  {
    id: 'kredivo',
    name: 'Kredivo',
    logo: 'https://via.placeholder.com/80x40?text=KRD',
    terms: [3, 6, 12],
    interestRate: 0,
    requireCard: false,
    description: 'Mua trước trả sau linh hoạt'
  },
  {
    id: 'visa',
    name: 'Thẻ tín dụng Visa',
    logo: 'https://via.placeholder.com/80x40?text=VISA',
    terms: [3, 6, 9, 12],
    interestRate: 0,
    requireCard: true,
    description: 'Trả góp 0% qua thẻ Visa các ngân hàng'
  },
  {
    id: 'mastercard',
    name: 'Thẻ tín dụng Mastercard',
    logo: 'https://via.placeholder.com/80x40?text=MC',
    terms: [3, 6, 9, 12],
    interestRate: 0,
    requireCard: true,
    description: 'Trả góp 0% qua thẻ Mastercard'
  },
  {
    id: 'jcb',
    name: 'Thẻ tín dụng JCB',
    logo: 'https://via.placeholder.com/80x40?text=JCB',
    terms: [3, 6, 9, 12],
    interestRate: 0,
    requireCard: true,
    description: 'Trả góp 0% qua thẻ JCB'
  }
]

export default function Installment() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const productId = searchParams.get("productId")


  const selectedVariantIdFromDetail = location.state?.variantId || null

  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  const [selectedPartner, setSelectedPartner] = useState(null)
  const [selectedTerm, setSelectedTerm] = useState(12)

  const [showPartnerDetail, setShowPartnerDetail] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idCard: '',
    address: '',
    acceptTerms: false
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductDetails(productId)
        setProduct(data)

        let variant = null

        if (selectedVariantIdFromDetail) {
          variant = data.variants?.find(v => v.id === selectedVariantIdFromDetail)
        }

        if (!variant) {
          variant = data.variants?.find(v => v.id === data.defaultVariantId)
        }

        if (!variant) {
          variant = data.variants?.[0]
        }

        setSelectedVariant(variant)
        setSelectedPartner(financialPartners[0])

      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [productId])

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) return
    try {
      const user = JSON.parse(u)
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }))
    } catch { }
  }, [])

  const getDiscountedPrice = () => {
    if (!selectedVariant) return 0

    const base = selectedVariant.price
    const discount = product?.discount?.valueInPercent || 0

    return Math.round(base * (1 - discount / 100))
  }


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const e = {}

    if (!formData.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên'
    if (!formData.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^[0-9]{10,11}$/.test(formData.phone)) e.phone = 'Số điện thoại không hợp lệ'

    if (!formData.email.trim()) e.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email không hợp lệ'

    if (!formData.idCard.trim()) e.idCard = 'Vui lòng nhập CMND/CCCD'
    else if (!/^[0-9]{9,12}$/.test(formData.idCard)) e.idCard = 'CMND/CCCD không hợp lệ'

    if (!formData.address.trim()) e.address = 'Vui lòng nhập địa chỉ'

    if (!formData.acceptTerms) e.acceptTerms = 'Vui lòng đồng ý điều khoản'
    if (!selectedPartner) e.partner = 'Vui lòng chọn hình thức trả góp'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return alert('Vui lòng điền đầy đủ thông tin')

    alert(`
Đã gửi hồ sơ trả góp!
Sản phẩm: ${product.name}
Variant: ${selectedVariant?.color_label} / ${selectedVariant?.storage_cap}GB
Hình thức: ${selectedPartner.name}
Kỳ hạn: ${selectedTerm} tháng
`)
    navigate('/')
  }

  const calculateInstallment = () => {
    if (!selectedVariant || !selectedTerm) return 0
    const price = getDiscountedPrice()
    const total = price * (1 + (selectedPartner?.interestRate || 0))
    return Math.ceil(total / selectedTerm)
  }


  if (!product || !selectedVariant) {
    return (
      <main className="container" style={{ padding: 40, textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: 32 }}></i>
        <div>Đang tải...</div>
      </main>
    )
  }

  const monthlyPayment = calculateInstallment()

  return (
    <main className="installment-page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a onClick={() => navigate('/')}>Trang chủ</a>
          <span> / </span>
          <a onClick={() => navigate(`/product/${product.id}`)}>{product.name}</a>
          <span> / Trả góp</span>
        </div>

        <div className="installment-content">

          {/* LEFT */}
          <div className="installment-left">
            <h2 className="page-title">
              <i className="fa fa-credit-card"></i> Đăng ký trả góp
            </h2>

            {/* Thông tin sản phẩm */}
            <section className="installment-section">
              <h3>Thông tin sản phẩm</h3>

              <div className="product-preview">
                <img
                  src={selectedVariant.imageUrl}
                  alt={product.name}
                />

                <div className="product-preview-info">
                  <div className="product-preview-name">
                    {product.name}
                  </div>

                  <div className="product-preview-price">
                    {product.discount?.valueInPercent > 0 ? (
                      <>
                        <span className="price-old">
                          {formatPrice(selectedVariant.price)}
                        </span>
                        <span className="price-new">
                          {formatPrice(getDiscountedPrice())}
                        </span>
                      </>
                    ) : (
                      <span className="price-new">
                        {formatPrice(selectedVariant.price)}
                      </span>
                    )}
                  </div>

                  {/* Variant selector */}
                  {product.variants && product.variants.length > 1 && (
                    <select
                      value={selectedVariant.id}
                      onChange={(e) => {
                        const variant = product.variants.find(v => v.id === parseInt(e.target.value))
                        setSelectedVariant(variant)
                      }}
                    >
                      {product.variants.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.color_label} - {v.storage_cap}GB
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </section>

            {/* Partner */}
            <section className="installment-section">
              <h3>Chọn hình thức trả góp</h3>

              <div className="partner-grid">
                {financialPartners.map(p => (
                  <div
                    key={p.id}
                    className={`partner-card ${selectedPartner?.id === p.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPartner(p)
                      setSelectedTerm(p.terms[0])
                    }}
                  >
                    <div className="partner-logo"><img src={p.logo} /></div>
                    <div className="partner-name">{p.name}</div>
                    <div className="partner-desc">{p.description}</div>

                    {p.requireCard && <div className="partner-badge">Cần thẻ tín dụng</div>}
                    {p.interestRate === 0 && <div className="partner-badge interest-free">0% lãi suất</div>}
                  </div>
                ))}
              </div>

              {selectedPartner && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPartnerDetail(true)}
                  style={{ marginTop: 12 }}
                >
                  <i className="fa fa-info-circle"></i> Xem điều kiện & thủ tục
                </button>
              )}
            </section>

            {/* Kỳ hạn */}
            {selectedPartner && (
              <section className="installment-section">
                <h3>Chọn kỳ hạn trả góp</h3>

                <div className="term-grid">
                  {selectedPartner.terms.map(term => (
                    <button
                      key={term}
                      className={`term-btn ${selectedTerm === term ? 'active' : ''}`}
                      onClick={() => setSelectedTerm(term)}
                    >
                      <div className="term-months">{term} tháng</div>
                      <div className="term-payment">
                        {formatPrice(Math.ceil(getDiscountedPrice() / term))}/tháng
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Form */}
            <section className="installment-section">
              <h3>Thông tin khách hàng</h3>

              <form onSubmit={handleSubmit}>

                <label className="field">
                  <div className="label">Họ và tên *</div>
                  <input name="fullName" value={formData.fullName} onChange={handleChange} />
                  {errors.fullName && <div className="field-error">{errors.fullName}</div>}
                </label>

                <div className="form-row-2">
                  <label className="field">
                    <div className="label">Số điện thoại *</div>
                    <input name="phone" value={formData.phone} onChange={handleChange} />
                    {errors.phone && <div className="field-error">{errors.phone}</div>}
                  </label>

                  <label className="field">
                    <div className="label">Email *</div>
                    <input name="email" value={formData.email} onChange={handleChange} />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                  </label>
                </div>

                <label className="field">
                  <div className="label">CMND/CCCD *</div>
                  <input name="idCard" value={formData.idCard} onChange={handleChange} />
                  {errors.idCard && <div className="field-error">{errors.idCard}</div>}
                </label>

                <label className="field">
                  <div className="label">Địa chỉ *</div>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
                  {errors.address && <div className="field-error">{errors.address}</div>}
                </label>

                <label className="checkbox-field">
                  <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />
                  <span>
                    Tôi đồng ý với{' '}
                    <a onClick={(e) => { e.preventDefault(); setShowPartnerDetail(true) }}>
                      điều khoản & điều kiện
                    </a>
                  </span>
                </label>
                {errors.acceptTerms && <div className="field-error">{errors.acceptTerms}</div>}

                <button className="btn btn-primary btn-xl" style={{ width: '100%', marginTop: 20 }}>
                  <i className="fa fa-paper-plane"></i> Gửi hồ sơ trả góp
                </button>

              </form>
            </section>
          </div>

          {/* RIGHT */}
          <div className="installment-right">
            <div className="installment-summary">
              <h3>Tóm tắt trả góp</h3>

              <div className="summary-item">
                <span>Giá sản phẩm:</span>
                <strong>{formatPrice(getDiscountedPrice())}</strong>
              </div>

              {selectedPartner && (
                <>
                  <div className="summary-item">
                    <span>Hình thức:</span>
                    <strong>{selectedPartner.name}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Kỳ hạn:</span>
                    <strong>{selectedTerm} tháng</strong>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-total">
                    <span>Trả mỗi tháng:</span>
                    <strong>{formatPrice(monthlyPayment)}</strong>
                  </div>

                  <div className="summary-note">
                    <i className="fa fa-info-circle"></i>
                    <div>
                      <strong>Lưu ý:</strong>
                      <ul>
                        <li>Miễn phí duyệt hồ sơ</li>
                        <li>Duyệt từ 5–30 phút</li>
                        <li>Yêu cầu CMND/CCCD</li>
                        {selectedPartner.requireCard && <li>Cần có thẻ tín dụng</li>}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {!selectedPartner && (
                <div className="summary-empty">
                  <i className="fa fa-hand-pointer"></i>
                  <p>Vui lòng chọn hình thức trả góp</p>
                </div>
              )}
            </div>

            <div className="installment-benefits">
              <h4><i className="fa fa-gift"></i> Ưu đãi</h4>
              <ul>
                <li><i className="fa fa-check-circle"></i> 0% lãi suất</li>
                <li><i className="fa fa-check-circle"></i> Duyệt nhanh</li>
                <li><i className="fa fa-check-circle"></i> Không cần thẻ tín dụng</li>
                <li><i className="fa fa-check-circle"></i> Nhận hàng ngay khi duyệt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showPartnerDetail && selectedPartner && (
        <div className="modal-overlay open" onClick={() => setShowPartnerDetail(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>

            <button className="modal-close" onClick={() => setShowPartnerDetail(false)}>&times;</button>

            <div className="modal-body">
              <h3>{selectedPartner.name}</h3>

              <div className="partner-detail-section">
                <h4>Điều kiện</h4>
                <ul>
                  <li>✓ Công dân Việt Nam từ 18 tuổi</li>
                  <li>✓ Có CMND/CCCD</li>
                  <li>✓ Có thu nhập ổn định</li>
                  {selectedPartner.requireCard && <li>✓ Có thẻ tín dụng</li>}
                </ul>
              </div>

              <div className="partner-detail-section">
                <h4>Thủ tục</h4>
                <ol>
                  <li>Điền thông tin</li>
                  <li>Chụp CMND/CCCD</li>
                  <li>Chụp chân dung</li>
                  {selectedPartner.requireCard && <li>Cung cấp thông tin thẻ tín dụng</li>}
                  <li>Duyệt hồ sơ 5–30 phút</li>
                </ol>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowPartnerDetail(false)}>
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
