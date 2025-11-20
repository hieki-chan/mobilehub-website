import React, { useState, useEffect } from 'react'
import { getUserProfile, updateProfile, uploadAvatar } from '../../api/authApi'
import '../../styles/components/profile/user-info.css'
import CCCDVerificationForm from '../cccd_verification/CCCDVerificationForm'
import { getVerificationStatus } from '../../api/cccdVerifyApi'

export default function UserInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cccdVerified, setCccdVerified] = useState(false)
  const [showCCCDModal, setShowCCCDModal] = useState(false)

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'other',
    dob: '', // Dùng dob (Date of Birth) cho ngắn gọn
    avatar: ''
  })

  const [previewAvatar, setPreviewAvatar] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  // 1. Tải dữ liệu user thật khi vào trang
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserProfile()
        if (user) {
          setFormData({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || 'other',
            dob: user.dob ? user.dob.split('T')[0] : '',
            avatar: user.avatar || '/assets/anime.jpg'
          })
        }

        // Gọi API CCCD trả true/false
        const verified = await getVerificationStatus()
        setCccdVerified(verified)
      } catch (error) {
        console.error("Lỗi tải thông tin:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Xử lý thay đổi input text & select
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Xử lý chọn ảnh
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate kích thước < 2MB
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.' })
        return
      }
      setSelectedFile(file)
      setPreviewAvatar(URL.createObjectURL(file)) // Xem trước ngay
    }
  }

  // Xử lý Lưu
  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      let newAvatarUrl = formData.avatar;

      // 1. Nếu có chọn ảnh mới thì upload trước
      if (selectedFile) {
        try {
          // Gọi API upload ảnh (nếu chưa có API upload thì bỏ qua bước này)
          newAvatarUrl = await uploadAvatar(selectedFile);
        } catch (err) {
          console.warn("Upload ảnh thất bại, vẫn lưu thông tin text.");
        }
      }

      // 2. Cập nhật thông tin cá nhân
      const payload = {
        name: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        avatar: newAvatarUrl
      }

      await updateProfile(payload)

      setFormData(prev => ({ ...prev, avatar: newAvatarUrl }))
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' })
      setIsEditing(false)

    } catch (error) {
      setMessage({ type: 'error', text: 'Cập nhật thất bại. Vui lòng thử lại sau.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-spinner">Đang tải thông tin...</div>

  return (
    <div className="user-info-container fade-in">
      <div className="info-header">
        <h3>Hồ sơ của tôi</h3>
        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      <div className="info-body">
        {/* CỘT TRÁI: AVATAR */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img
              src={previewAvatar || formData.avatar || '/assets/anime.jpg'}
              alt="Avatar"
              className="avatar-img"
              onError={e => e.target.src = '/assets/anime.jpg'}
            />
            {isEditing && (
              <label className="avatar-upload-btn" title="Đổi ảnh đại diện">
                <i className="fa fa-camera"></i>
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
            )}
          </div>
          <div className="avatar-note">
            {isEditing ? 'Dụng lượng file tối đa 2MB' : ''}
          </div>
        </div>

        {/* CỘT PHẢI: FORM THÔNG TIN */}
        <div className="info-form">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!isEditing}
              className={isEditing ? 'editable' : ''}
              placeholder="Nhập họ tên"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled={true} // Email thường không cho sửa
                className="disabled-input"
              />
              {isEditing && <span className="lock-icon"><i className="fa fa-lock"></i></span>}
            </div>
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={isEditing ? 'editable' : ''}
              placeholder="Thêm số điện thoại"
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className={`gender-select ${isEditing ? 'editable' : ''}`}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              disabled={!isEditing}
              className={isEditing ? 'editable' : ''}
            />
          </div>

          <div className="form-group">
            <label>Số CCCD</label>
            <span className={`cccd-status ${cccdVerified ? 'verified' : 'unverified'}`}>
              {cccdVerified ? 'Đã xác thực ✅' : 'Chưa xác thực ❌'}
            </span>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowCCCDModal(true)}
            >
              <i className="fa fa-id-card"></i> Xác thực căn cước
            </button>
          </div>

          {showCCCDModal && <CCCDVerificationForm onClose={() => setShowCCCDModal(false)} />}

          {/* Thông báo */}
          {message.text && (
            <div className={`message-box ${message.type}`}>
              {message.type === 'success' ? <i className="fa fa-check-circle"></i> : <i className="fa fa-exclamation-circle"></i>}
              {message.text}
            </div>
          )}

          {/* Nút bấm */}
          <div className="form-actions">
            {!isEditing ? (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Chỉnh sửa thông tin
              </button>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => {
                  setIsEditing(false);
                  setPreviewAvatar(null);
                  setMessage({ type: '', text: '' });
                  // Có thể gọi lại fetchUser() để reset data nếu cần
                }}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <i className="fa fa-spinner fa-spin"></i> : 'Lưu thay đổi'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 