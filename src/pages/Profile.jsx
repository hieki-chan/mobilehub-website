import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/authApi'
import useCart from '../hooks/useCart'
import UserInfo from '../components/profile/UserInfo'
import OrderHistory from '../components/profile/OrderHistory'
import Wishlist from '../components/profile/Wishlist'
import AddressBook from '../components/profile/AddressBook'
import ConfirmModal from '../components/ConfirmModal'
import '../styles/pages/profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const { clear } = useCart()
  const [user, setUser] = useState(null)
  const [view, setView] = useState('info')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (raw) try { setUser(JSON.parse(raw)) } catch { }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login', { replace: true })
  }, [navigate])

  const onLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    clear()
    window.dispatchEvent(new Event('user-changed'))
    navigate('/', { replace: true })
    setShowLogoutConfirm(false)
  }

  if (!user) {
    return (
      <main className="container main-content" style={{ paddingTop: 20, textAlign: 'center' }}>
        <div className="loading-spinner">
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 32 }}></i>
          <div style={{ marginTop: 12 }}>Đang tải...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <aside className="profile-sidebar">
        <div className="welcome">
          <strong>Xin chào,</strong>
          <div className="muted">{user.name || user.email}</div>
        </div>
        <ul className="profile-nav">
          <li>
            <button className={view === 'info' ? 'active' : ''} onClick={() => setView('info')}>
              <i className="fa fa-user"></i> Thông tin tài khoản
            </button>
          </li>
          <li>
            <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')}>
              <i className="fa fa-receipt"></i> Quản lý đơn hàng
            </button>
          </li>
          <li>
            <button className={view === 'wishlist' ? 'active' : ''} onClick={() => setView('wishlist')}>
              <i className="fa fa-heart"></i> Sản phẩm yêu thích
            </button>
          </li>
          <li>
            <button className={view === 'AddressBook' ? 'active' : ''} onClick={() => setView('AddressBook')}>
              <i className="fa fa-location-dot"></i> Địa chỉ
            </button>
          </li>
          <li>
            <button className="logout" onClick={onLogoutClick}>
              <i className="fa fa-right-from-bracket"></i> Đăng xuất
            </button>
          </li>
        </ul>
      </aside>

      <section className="profile-content">
        {view === 'info' && <UserInfo user={user} onUpdateUser={setUser} />}
        {view === 'orders' && <OrderHistory />}
        {view === 'wishlist' && <Wishlist />}
        {view === 'AddressBook' && <AddressBook />}
      </section>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        confirmText="Đăng xuất"
        isDanger={true}
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </main>
  )
}