import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { getProductDetails } from '../api/productApi'
import { formatPrice } from '../utils/formatPrice'
import { getDefaultAddress } from '../api/addressApi'
import { getPlans, precheckApplication, createApplication } from '../api/installmentApi'
import { getVerificationStatus } from '../api/cccdVerifyApi'
import CCCDVerificationForm from '../components/cccd_verification/CCCDVerificationForm'
import '../styles/pages/installment.css'
import { useToast } from '../components/ToastProvider'

export default function Installment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const productId = searchParams.get("productId")
  const initialVariantId = location.state?.variantId

  // --- STATE CHUNG ---
  const [step, setStep] = useState(1)
  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [cccdData, setCccdData] = useState({ status: false, cccdNo: '' })
  const [showCCCDModal, setShowCCCDModal] = useState(false)
  const [personalIncome, setPersonalIncome] = useState(0)

  // --- STATE BƯỚC 1 ---
  const [selectedPlan, setSelectedPlan] = useState(null)

  // --- FILTER STATE ---
  const [filterDownPayment, setFilterDownPayment] = useState('all') // 'all' hoặc số %
  const [filterTenor, setFilterTenor] = useState('all') // 'all' hoặc số tháng

  // --- STATE BƯỚC 2: THÔNG TIN ---
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    idCard: '',
    dob: '',
    address: ''
  })

  // Fetch plans và sản phẩm
  useEffect(() => {
    const load = async () => {
      try {
        // Lấy danh sách plans
        const plansData = await getPlans()
        const activePlans = plansData.filter(p => p.active)
        setPlans(activePlans)

        // Kiểm tra trạng thái CCCD
        try {
          const cccdResponse = await getVerificationStatus()
          // Response:
          // { status, cccdNo, fullName, dateOfBirth, sex, placeOfResidence }

          setCccdData({
            status: cccdResponse.status || false,
            cccdNo: cccdResponse.cccdNo || ''
          })

          // Nếu đã xác thực thì autofill tất cả thông tin
          if (cccdResponse.status) {
            setUserInfo(prev => ({
              ...prev,
              idCard: cccdResponse.cccdNo || '',
              fullName: cccdResponse.fullName || prev.fullName,
              dob: cccdResponse.dateOfBirth || prev.dob,
              address: cccdResponse.placeOfResidence || prev.address
            }))
          }
        } catch (err) {
          console.error('Failed to get CCCD status:', err)
          setCccdData({ status: false, cccdNo: '' })
        }

        // Lấy thông tin sản phẩm
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
        // if (savedUser) {
        //   setUserInfo(prev => ({
        //     ...prev,
        //     fullName: savedUser.name || '',
        //     phone: savedUser.phone || '',
        //     address: savedUser.address || ''
        //   }))
        //   try {
        //     const defaultAddr = await getDefaultAddress()
        //     if (defaultAddr) {
        //       setUserInfo(prev => ({
        //         ...prev,
        //         address: [defaultAddr.addressDetail, defaultAddr.ward, defaultAddr.district, defaultAddr.province]
        //           .filter(Boolean).join(', ')
        //       }))
        //     }
        //   } catch { }
        // }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId, initialVariantId])

  // Tính giá
  const { originalPrice, finalPrice, hasDiscount } = useMemo(() => {
    if (!selectedVariant) return { originalPrice: 0, finalPrice: 0, hasDiscount: false }
    const price = selectedVariant.price
    const discount = product?.discount.valueInPercent || 0
    return {
      originalPrice: price,
      finalPrice: Math.round(price * (1 - discount / 100)),
      hasDiscount: discount > 0
    }
  }, [selectedVariant, product])

  // Nhóm plans theo partner và hiển thị tất cả tenors
  const groupedPlans = useMemo(() => {
    return plans
      .filter(plan => finalPrice >= plan.minPrice)
      .flatMap(plan => {
        const tenors = plan.allowedTenors?.split(',').map(t => parseInt(t.trim())) || []
        return tenors.map(tenor => ({
          ...plan,
          tenor
        }))
      })
      .filter(planItem => {
        // Lọc theo downPayment nếu có chọn
        if (filterDownPayment !== 'all' && planItem.downPaymentPercent !== parseInt(filterDownPayment)) {
          return false
        }
        // Lọc theo tenor nếu có chọn
        if (filterTenor !== 'all' && planItem.tenor !== parseInt(filterTenor)) {
          return false
        }
        return true
      })
  }, [plans, finalPrice, filterDownPayment, filterTenor])

  // Lấy các giá trị unique để làm options cho dropdown
  const availableDownPayments = useMemo(() => {
    const payments = new Set()
    plans.forEach(plan => payments.add(plan.downPaymentPercent))
    return Array.from(payments).sort((a, b) => a - b)
  }, [plans])

  const availableTenors = useMemo(() => {
    const tenors = new Set()
    plans.forEach(plan => {
      const tenorsList = plan.allowedTenors?.split(',').map(t => parseInt(t.trim())) || []
      tenorsList.forEach(t => tenors.add(t))
    })
    return Array.from(tenors).sort((a, b) => a - b)
  }, [plans])

  // Hàm load lại trạng thái CCCD
  const reloadCCCDStatus = async () => {
    try {
      const cccdResponse = await getVerificationStatus()

      setCccdData({
        status: cccdResponse.status || false,
        cccdNo: cccdResponse.cccdNo || ''
      })

      if (cccdResponse.status) {
        setUserInfo(prev => ({
          ...prev,
          idCard: cccdResponse.cccdNo || '',
          fullName: cccdResponse.fullName || prev.fullName,
          dob: cccdResponse.dateOfBirth || prev.dob,
          address: cccdResponse.placeOfResidence || prev.address
        }))

      }
    } catch (err) {
      console.error('Failed to reload CCCD status:', err)
    }
  }

  const handleSelectPackage = (plan) => {
    setSelectedPlan(plan)
    setStep(2)
    window.scrollTo(0, 0)
  }

  // Xử lý submit ở Bước 2
  const handleFinalSubmit = async (e) => {
    const toast = useToast()
    e.preventDefault();

    if (!cccdData.status) {
      alert('Vui lòng xác thực CCCD trước khi đăng ký trả góp!');
      setShowCCCDModal(true);
      return;
    }

    if (!userInfo.fullName || !userInfo.phone || !userInfo.address) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const calc = calculatePayment(selectedPlan, selectedPlan.selectedTenor);

    // BE yêu cầu loanAmount = finalPrice - trả trước
    const payload = {
      customerName: userInfo.fullName,
      customerPhone: userInfo.phone,
      productName: product.name,
      productPrice: finalPrice,
      loanAmount: calc.loanAmount,
      tenorMonths: selectedPlan.selectedTenor,
      planId: selectedPlan.id,
      customerAge: userInfo.dob ? new Date().getFullYear() - new Date(userInfo.dob).getFullYear() : null,
      monthlyIncome: Number(personalIncome) || 0
    };

    try {
      const res = await precheckApplication(payload);
      //console.log("Precheck response:", res);
      if (!res.eligible) {
        alert(res.message);
        return;
      }

    } catch (err) {
      console.error(err);
      alert("Bạn không đủ điều kiện để đặt trả góp!");
      return;
    }

    try {
      const res = await createApplication(payload);
      alert("Đặt trả góp thành công!");
      //console.log("installment:", res);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Đặt trả góp thất bại!");
    }
  };

  // Tính toán chi tiết tiền
  const calculatePayment = (plan, tenor) => {
    const prepayAmount = Math.round(finalPrice * plan.downPaymentPercent / 100)
    const loanAmount = finalPrice - prepayAmount

    const r = plan.interestRate / 100 // interestRate (%) -> per month
    const n = tenor

    let monthlyPay

    if (r === 0) {
      // 0% lãi
      monthlyPay = Math.round(loanAmount / n)
    } else {
      // Annuity như BE
      const factor = Math.pow(1 + r, n)
      monthlyPay = Math.round(loanAmount * r * factor / (factor - 1))
    }

    const totalPay = monthlyPay * n
    const priceDiff = totalPay - loanAmount

    return {
      prepayAmount,
      loanAmount,
      monthlyPay,
      totalPay,
      priceDiff,
      months: n
    }
  }

  if (loading || !product || !selectedVariant) {
    return <div className="loading-spinner">Đang tải...</div>
  }

  // --- RENDER BƯỚC 1: CHỌN GÓI ---
  const renderStep1 = () => (
    <div className="install-step-1 fade-in">
      <div className="product-summary-header">
        <img src={selectedVariant.imageUrl} alt={product.name} />
        <div className="prod-info">
          <h3>{product.name}</h3>
          <div className="prod-variant">
            Phiên bản: {selectedVariant.storage_cap}GB - {selectedVariant.color_label}
          </div>
          <div className="prod-price">
            {hasDiscount && (
              <span style={{
                textDecoration: 'line-through',
                color: '#9ca3af',
                fontSize: '14px',
                marginRight: '8px'
              }}>
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="price-text">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <span style={{
                marginLeft: '8px',
                padding: '2px 8px',
                background: '#ef4444',
                color: 'white',
                fontSize: '12px',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                -{product.discount.valueInPercent}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="filter-controls">
        <div className="info-box">
          <p>Chọn gói trả góp phù hợp với bạn. Tất cả các gói đều đã được duyệt và sẵn sàng áp dụng.</p>
        </div>

        <div className="filter-dropdowns" style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mức trả trước</label>
            <select
              value={filterDownPayment}
              onChange={(e) => setFilterDownPayment(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tất cả</option>
              {availableDownPayments.map(dp => (
                <option key={dp} value={dp}>{dp}%</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Kỳ hạn</label>
            <select
              value={filterTenor}
              onChange={(e) => setFilterTenor(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tất cả</option>
              {availableTenors.map(t => (
                <option key={t} value={t}>{t} tháng</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="companies-list">
        <h3>Gói trả góp khả dụng</h3>
        {groupedPlans.length === 0 ? (
          <div className="empty-result">
            Không có gói trả góp nào phù hợp với sản phẩm này.
            <br />Giá sản phẩm tối thiểu để áp dụng trả góp là 3.000.000đ.
          </div>
        ) : (
          <div className="company-grid">
            {groupedPlans.map((planItem, idx) => {
              const calc = calculatePayment(planItem, planItem.tenor)
              return (
                <div key={`${planItem.id}-${planItem.tenor}-${idx}`} className="company-card">
                  <div className="comp-header">
                    <div className="comp-name">{planItem.partnerName}</div>
                    <div className="comp-plan-name">{planItem.name}</div>
                  </div>
                  <div className="comp-body">
                    <div className="row-info">
                      <span>Mã gói</span>
                      <span>{planItem.code}</span>
                    </div>
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <div className="row-info">
                      <span>Kỳ hạn</span>
                      <span className="highlight">{planItem.tenor} tháng</span>
                    </div>
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <div className="row-info">
                      <span>Trả trước</span>
                      <span>{planItem.downPaymentPercent}% ({formatPrice(calc.prepayAmount)})</span>
                    </div>
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <div className="row-info">
                      <span>Góp mỗi tháng</span>
                      <span className="highlight">{formatPrice(calc.monthlyPay)}</span>
                    </div>
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <div className="row-info">
                      <span>Lãi suất/tháng</span>
                      <span>{planItem.interestRate === 0 ? '0%' : `${planItem.interestRate}%`}</span>
                    </div>
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <div className="row-info" style={{ fontWeight: '600', fontSize: '15px' }}>
                      <span>Tổng tiền phải trả</span>
                      <span className="highlight">{formatPrice(calc.totalPay + calc.prepayAmount)}</span>
                    </div>
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <div className="row-info">
                      <span>Chênh lệch giá</span>
                      <span>{formatPrice(calc.priceDiff)}</span>
                    </div>
                  </div>
                  <div className="comp-footer">
                    <button
                      className="btn btn-primary btn-full"
                      onClick={() => handleSelectPackage({ ...planItem, selectedTenor: planItem.tenor })}
                    >
                      ĐẶT MUA
                    </button>
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
    if (!selectedPlan) return null
    const calc = calculatePayment(selectedPlan, selectedPlan.selectedTenor)

    return (
      <div className="install-step-2 fade-in">
        <button className="btn-back-step" onClick={() => setStep(1)}>
          <i className="fa fa-arrow-left"></i> Quay lại chọn gói
        </button>

        <div className="layout-2-col">
          <div className="form-section">
            <h3>Thông tin người mua</h3>
            <form onSubmit={handleFinalSubmit}>
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  required
                  value={userInfo.fullName}
                  onChange={e => setUserInfo({ ...userInfo, fullName: e.target.value })}
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
                    onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                    placeholder="0912xxxxxx"
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    value={userInfo.dob}
                    onChange={e => setUserInfo({ ...userInfo, dob: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Số CMND/CCCD *</label>
                {cccdData.status ? (
                  // Đã xác thực: hiện input disabled với số CCCD
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      required
                      style={{ flex: 1 }}
                      value={cccdData.cccdNo}
                      disabled
                      placeholder="12 số căn cước"
                    />
                    <span style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      background: '#dcfce7',
                      color: '#166534'
                    }}>
                      ✅ Đã xác thực
                    </span>
                  </div>
                ) : (
                  // Chưa xác thực: hiện button xác thực
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowCCCDModal(true)}
                      style={{ width: '100%', padding: '12px' }}
                    >
                      <i className="fa fa-id-card"></i> Xác thực CCCD để tiếp tục
                    </button>
                    <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '8px', marginBottom: 0 }}>
                      ❌ Bạn cần xác thực CCCD để đăng ký trả góp
                    </p>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Địa chỉ nhận hàng / hộ khẩu *</label>
                <textarea
                  required
                  rows="3"
                  value={userInfo.address}
                  onChange={e => setUserInfo({ ...userInfo, address: e.target.value })}
                  placeholder="Số nhà, đường, phường/xã..."
                ></textarea>
              </div>
              <div className="form-group">
                <label>Thu nhập cá nhân</label>
                <input
                  type="number"
                  className="form-control"
                  value={personalIncome}
                  min={0}
                  onChange={(e) => setPersonalIncome(e.target.value)}
                  placeholder="Nhập thu nhập cá nhân"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-xl btn-full" style={{ marginTop: 20 }}>
                GỬI HỒ SƠ TRẢ GÓP
              </button>
              <p className="term-note">
                Bằng cách ấn vào nút gửi hồ sơ, bạn đồng ý với các điều khoản của {selectedPlan.partnerName} và MobileHub.
              </p>
            </form>
          </div>

          <div className="summary-section">
            <div className="summary-card">
              <div className="sum-header">
                <img src={product.imageUrl || selectedVariant.imageUrl} alt="" width="60" />
                <div>
                  <h4>{product.name}</h4>
                  <div className="v-name">{selectedVariant.storage_cap}GB - {selectedVariant.color_label}</div>
                </div>
              </div>
              <div className="divider"></div>
              {hasDiscount && (
                <>
                  <div className="sum-row">
                    <span>Giá gốc:</span>
                    <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>
                      {formatPrice(originalPrice)}
                    </span>
                  </div>
                  <div className="sum-row">
                    <span>Giảm giá:</span>
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>
                      -{product.discount.valueInPercent}%
                    </span>
                  </div>
                </>
              )}
              <div className="sum-row">
                <span>Giá sản phẩm:</span>
                <b style={{ color: '#ef4444', fontWeight: '600' }}>{formatPrice(finalPrice)}</b>
              </div>
              <div className="sum-row">
                <span>Gói trả góp:</span>
                <b>{selectedPlan.name}</b>
              </div>
              <div className="sum-row">
                <span>Đơn vị tài chính:</span>
                <b>{selectedPlan.partnerName}</b>
              </div>
              <div className="sum-row">
                <span>Kỳ hạn:</span>
                <b>{selectedPlan.selectedTenor} tháng</b>
              </div>
              <div className="sum-row">
                <span>Lãi suất:</span>
                <b>{selectedPlan.interestRate === 0 ? '0%' : `${selectedPlan.interestRate}%`}/tháng</b>
              </div>
              <div className="sum-row">
                <span>Trả trước ({selectedPlan.downPaymentPercent}%):</span>
                <b>{formatPrice(calc.prepayAmount)}</b>
              </div>
              <div className="sum-row">
                <span>Góp mỗi tháng:</span>
                <span className="highlight">{formatPrice(calc.monthlyPay)}</span>
              </div>
              <div className="sum-row">
                <span>Tổng tiền góp:</span>
                <b className="highlight">{formatPrice(calc.totalPay + calc.prepayAmount)}</b>
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
      {showCCCDModal && (
        <CCCDVerificationForm
          onClose={() => setShowCCCDModal(false)}
          onSuccess={async () => {
            // Callback khi xác thực thành công
            setShowCCCDModal(false)

            // Load lại trạng thái CCCD từ API
            await reloadCCCDStatus()

            //alert('Xác thực CCCD thành công!')
          }}
        />
      )}

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