import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { getProductDetails } from '../api/productApi'
import { formatPrice } from '../utils/formatPrice'
import { getDefaultAddress } from '../api/addressApi'
import '../styles/pages/installment.css'

// --- MOCK DATA CÔNG TY TÀI CHÍNH ---
// Mỗi công ty có quy định về trả trước (min-max) và kỳ hạn hỗ trợ
const FINANCE_COMPANIES = [
  {
    id: 'home_credit',
    name: 'Home Credit',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Home_Credit_logo.svg/2560px-Home_Credit_logo.svg.png',
    interestRate: 0.018, // 1.8% / tháng
    minPrepayPercent: 20,
    maxPrepayPercent: 80,
    supportedTerms: [6, 9, 12],
    requirements: 'CMND/CCCD + Bằng lái xe',
    approvalTime: '15 phút'
  },
  {
    id: 'fe_credit',
    name: 'FE Credit',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-FE-Credit-Red-White-835x1024.png',
    interestRate: 0.021, // 2.1% / tháng
    minPrepayPercent: 0,
    maxPrepayPercent: 70,
    supportedTerms: [3, 6, 9, 12, 15, 18, 24],
    requirements: 'CMND/CCCD + Hộ khẩu',
    approvalTime: '30 phút'
  },
  {
    id: 'mcredit',
    name: 'MCredit',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-MCredit.png',
    interestRate: 0.015, // 1.5% / tháng (ưu đãi)
    minPrepayPercent: 30,
    maxPrepayPercent: 90,
    supportedTerms: [6, 12],
    requirements: 'CMND/CCCD',
    approvalTime: '5 phút (Duyệt Online)'
  },
  {
    id: 'kredivo',
    name: 'Kredivo',
    logo: 'https://images.glints.com/unsafe/glints-dashboard.s3.amazonaws.com/company-logo/85434d850f42d817750d09c02e19130e.png',
    interestRate: 0, // 0% lãi suất cho kỳ hạn ngắn
    minPrepayPercent: 0,
    maxPrepayPercent: 0, // Không cần trả trước
    supportedTerms: [3], // Chỉ hỗ trợ 3 tháng
    requirements: 'Tài khoản Kredivo',
    approvalTime: 'Ngay lập tức'
  }
]

// Các mốc trả trước & kỳ hạn để hiển thị trên UI
const PREPAY_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
const TERM_OPTIONS = [3, 6, 9, 12, 15, 18, 24]

export default function Installment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  
  const productId = searchParams.get("productId")
  // Lấy variantId từ state khi navigate từ trang ProductDetail, nếu không có thì null
  const initialVariantId = location.state?.variantId

  // --- STATE CHUNG ---
  const [step, setStep] = useState(1) // 1: Chọn gói, 2: Thông tin
  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- STATE BƯỚC 1: CẤU HÌNH TRẢ GÓP ---
  const [prepayPercent, setPrepayPercent] = useState(30) // Mặc định trả trước 30%
  const [selectedTerm, setSelectedTerm] = useState(6)    // Mặc định 6 tháng
  const [selectedCompany, setSelectedCompany] = useState(null) // Công ty user chọn để sang bước 2

  // --- STATE BƯỚC 2: THÔNG TIN ---
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    idCard: '',
    dob: '',
    address: ''
  })

  // Fetch sản phẩm
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductDetails(productId)
        setProduct(data)
        
        // Xác định variant đang chọn
        let variant = null
        if (initialVariantId) {
          variant = data.variants?.find(v => v.id === initialVariantId)
        }
        if (!variant) {
          variant = data.variants?.find(v => v.id === data.defaultVariantId) || data.variants?.[0]
        }
        setSelectedVariant(variant)

        // Autofill user info nếu đã login
        const savedUser = JSON.parse(localStorage.getItem('user'))
        if (savedUser) {
          setUserInfo(prev => ({
            ...prev,
            fullName: savedUser.name || '',
            phone: savedUser.phone || '',
            address: savedUser.address || '' // Nếu user object có address
          }))
          // Nếu có API lấy địa chỉ mặc định, có thể gọi ở đây
          try {
             const defaultAddr = await getDefaultAddress()
             if(defaultAddr) {
               setUserInfo(prev => ({ ...prev, address: [defaultAddr.addressDetail, defaultAddr.ward, defaultAddr.district, defaultAddr.province].filter(Boolean).join(', ') }))
             }
          } catch {}
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId, initialVariantId])

  // Tính giá
  const finalPrice = useMemo(() => {
    if (!selectedVariant) return 0
    const price = selectedVariant.price
    const discount = product?.discountInPercent || 0
    return Math.round(price * (1 - discount / 100))
  }, [selectedVariant, product])

  // Lọc công ty phù hợp với cấu hình
  const availableCompanies = useMemo(() => {
    return FINANCE_COMPANIES.filter(company => {
      // 1. Kiểm tra trả trước có nằm trong khoảng hỗ trợ không
      if (prepayPercent < company.minPrepayPercent || prepayPercent > company.maxPrepayPercent) return false
      // 2. Kiểm tra kỳ hạn có hỗ trợ không
      if (!company.supportedTerms.includes(selectedTerm)) return false
      return true
    })
  }, [prepayPercent, selectedTerm])

  // Xử lý đặt mua ở Bước 1
  const handleSelectPackage = (company) => {
    setSelectedCompany(company)
    setStep(2)
    window.scrollTo(0, 0)
  }

  // Xử lý submit ở Bước 2
  const handleFinalSubmit = (e) => {
    e.preventDefault()
    if (!userInfo.fullName || !userInfo.phone || !userInfo.idCard || !userInfo.address) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    alert(`Đăng ký trả góp thành công!\nHồ sơ của bạn đang được ${selectedCompany.name} xét duyệt.\nChúng tôi sẽ liên hệ lại số ${userInfo.phone} trong ít phút.`)
    navigate('/')
  }

  // Tính toán chi tiết tiền nong
  const calculatePayment = (company) => {
    const prepayAmount = Math.round(finalPrice * prepayPercent / 100)
    const loanAmount = finalPrice - prepayAmount
    
    // Công thức đơn giản: (Gốc + Lãi) / Tháng
    // Lãi tính trên dư nợ ban đầu (flat rate) để demo đơn giản
    const totalInterest = loanAmount * company.interestRate * selectedTerm
    const totalPay = loanAmount + totalInterest
    const monthlyPay = Math.round(totalPay / selectedTerm)
    const priceDiff = totalPay - loanAmount // Chênh lệch so với mua thẳng (chỉ tính phần vay)

    return { prepayAmount, loanAmount, monthlyPay, totalPay, priceDiff }
  }

  if (loading || !product || !selectedVariant) return <div className="loading-spinner">Đang tải...</div>

  // --- RENDER BƯỚC 1: CHỌN GÓI ---
  const renderStep1 = () => (
    <div className="install-step-1 fade-in">
      <div className="product-summary-header">
        <img src={selectedVariant.imageUrl} alt={product.name} />
        <div className="prod-info">
            <h3>{product.name}</h3>
            <div className="prod-variant">Phiên bản: {selectedVariant.storage_cap}GB - {selectedVariant.color_label}</div>
            <div className="prod-price">
                Giá bán: <span className="price-text">{formatPrice(finalPrice)}</span>
            </div>
        </div>
      </div>

      <div className="filter-controls">
        <div className="control-group">
            <label>Chọn mức trả trước ({prepayPercent}%)</label>
            <div className="options-grid">
                {PREPAY_OPTIONS.map(p => (
                    <button 
                        key={p} 
                        className={`opt-btn ${prepayPercent === p ? 'active' : ''}`}
                        onClick={() => setPrepayPercent(p)}
                    >
                        {p}%
                    </button>
                ))}
            </div>
            <div className="money-preview">
                Số tiền trả trước: <strong>{formatPrice(Math.round(finalPrice * prepayPercent / 100))}</strong>
            </div>
        </div>

        <div className="control-group">
            <label>Chọn kỳ hạn (tháng)</label>
            <div className="options-grid">
                {TERM_OPTIONS.map(t => (
                    <button 
                        key={t} 
                        className={`opt-btn ${selectedTerm === t ? 'active' : ''}`}
                        onClick={() => setSelectedTerm(t)}
                    >
                        {t} tháng
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="companies-list">
        <h3>Công ty tài chính hỗ trợ</h3>
        {availableCompanies.length === 0 ? (
             <div className="empty-result">
                Không có công ty nào hỗ trợ mức trả trước {prepayPercent}% trong {selectedTerm} tháng. 
                <br/>Vui lòng thử thay đổi mức trả trước hoặc kỳ hạn.
             </div>
        ) : (
            <div className="company-grid">
                {availableCompanies.map(comp => {
                    const calc = calculatePayment(comp)
                    return (
                        <div key={comp.id} className="company-card">
                            <div className="comp-header">
                                <img src={comp.logo} alt={comp.name} className="comp-logo"/>
                                <div className="comp-name">{comp.name}</div>
                            </div>
                            <div className="comp-body">
                                <div className="row-info">
                                    <span>Góp mỗi tháng</span>
                                    <span className="highlight">{formatPrice(calc.monthlyPay)}</span>
                                </div>
                                <div className="row-info">
                                    <span>Lãi suất thực/tháng</span>
                                    <span>{comp.interestRate === 0 ? '0%' : `${(comp.interestRate * 100).toFixed(1)}%`}</span>
                                </div>
                                <div className="row-info">
                                    <span>Tổng tiền phải trả</span>
                                    <span>{formatPrice(calc.totalPay + calc.prepayAmount)}</span>
                                </div>
                                <div className="row-info">
                                    <span>Chênh lệch giá</span>
                                    <span>{formatPrice(calc.priceDiff)}</span>
                                </div>
                                <div className="requirements-box">
                                    <i className="fa fa-id-card"></i> {comp.requirements}
                                </div>
                            </div>
                            <div className="comp-footer">
                                <button className="btn btn-primary btn-full" onClick={() => handleSelectPackage(comp)}>
                                    ĐẶT MUA
                                </button>
                                <div className="approve-time">Duyệt hồ sơ: {comp.approvalTime}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  )

  // --- RENDER BƯỚC 2: ĐIỀN THÔNG TIN ---
  const renderStep2 = () => {
    if (!selectedCompany) return null
    const calc = calculatePayment(selectedCompany)

    return (
        <div className="install-step-2 fade-in">
            <button className="btn-back-step" onClick={() => setStep(1)}>
                <i className="fa fa-arrow-left"></i> Quay lại chọn gói
            </button>

            <div className="layout-2-col">
                {/* Form Trái: Thông tin khách hàng */}
                <div className="form-section">
                    <h3>Thông tin người mua</h3>
                    <form onSubmit={handleFinalSubmit}>
                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input 
                                required
                                value={userInfo.fullName} 
                                onChange={e => setUserInfo({...userInfo, fullName: e.target.value})}
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                        <div className="row-2">
                            <div className="form-group">
                                <label>Số điện thoại *</label>
                                <input 
                                    required
                                    type="tel"
                                    value={userInfo.phone} 
                                    onChange={e => setUserInfo({...userInfo, phone: e.target.value})}
                                    placeholder="0912xxxxxx"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày sinh</label>
                                <input 
                                    type="date"
                                    value={userInfo.dob} 
                                    onChange={e => setUserInfo({...userInfo, dob: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Số CMND/CCCD *</label>
                            <input 
                                required
                                value={userInfo.idCard} 
                                onChange={e => setUserInfo({...userInfo, idCard: e.target.value})}
                                placeholder="12 số căn cước"
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ nhận hàng / hộ khẩu *</label>
                            <textarea 
                                required
                                rows="3"
                                value={userInfo.address} 
                                onChange={e => setUserInfo({...userInfo, address: e.target.value})}
                                placeholder="Số nhà, đường, phường/xã..."
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary btn-xl btn-full" style={{marginTop: 20}}>
                            GỬI HỒ SƠ TRẢ GÓP
                        </button>
                        <p className="term-note">Bằng cách ấn vào nút gửi hồ sơ, bạn đồng ý với các điều khoản của {selectedCompany.name} và MobileHub.</p>
                    </form>
                </div>

                {/* Cột Phải: Tóm tắt gói */}
                <div className="summary-section">
                    <div className="summary-card">
                        <div className="sum-header">
                            <img src={product.imageUrl || selectedVariant.imageUrl} alt="" width="60"/>
                            <div>
                                <h4>{product.name}</h4>
                                <div className="v-name">{selectedVariant.storage_cap}GB - {selectedVariant.color_label}</div>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="sum-row">
                            <span>Giá sản phẩm:</span>
                            <b>{formatPrice(finalPrice)}</b>
                        </div>
                        <div className="sum-row">
                            <span>Đơn vị tài chính:</span>
                            <b>{selectedCompany.name}</b>
                        </div>
                        <div className="sum-row">
                            <span>Kỳ hạn:</span>
                            <b>{selectedTerm} tháng</b>
                        </div>
                        <div className="sum-row">
                            <span>Trả trước ({prepayPercent}%):</span>
                            <b>{formatPrice(calc.prepayAmount)}</b>
                        </div>
                         <div className="sum-row">
                            <span>Góp mỗi tháng:</span>
                            <b className="highlight">{formatPrice(calc.monthlyPay)}</b>
                        </div>
                        <div className="sum-row">
                            <span>Tổng tiền góp:</span>
                            <span className="muted">{formatPrice(calc.totalPay)}</span>
                        </div>
                        <div className="sum-row">
                            <span>Chênh lệch:</span>
                            <span className="muted">{formatPrice(calc.priceDiff)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
  }

  return (
    <main className="installment-page">
        <div className="container">
            <div className="stepper">
                <div className={`step-item ${step >= 1 ? 'active' : ''}`}>1. Chọn gói trả góp</div>
                <div className="step-line"></div>
                <div className={`step-item ${step >= 2 ? 'active' : ''}`}>2. Thông tin hồ sơ</div>
            </div>
            
            {step === 1 ? renderStep1() : renderStep2()}
        </div>
    </main>
  )
}