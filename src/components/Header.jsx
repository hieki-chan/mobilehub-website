import React, { useEffect, useState, useRef } from 'react' // Thêm useRef
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import useCart from '../hooks/useCart'
import '../styles/components/header.css'

export default function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Refs cho timers
  const megaMenuTimerRef = useRef(null);
  const userMenuTimerRef = useRef(null); // Ref cho timer của user menu

  // ✅ FIX: Gọi hook NGOÀI try-catch theo React Rules of Hooks
  const cart = useCart()

  // ✅ Safe cart count với fallback
  const cartCount = React.useMemo(() => {
    try {
      if (cart && typeof cart.count === 'function') {
        return cart.count()
      }
      return 0
    } catch (error) {
      console.error('Error getting cart count:', error)
      return 0
    }
  }, [cart])

  // Load user từ localStorage
  useEffect(() => {
    const readUser = () => {
      const raw = localStorage.getItem('user')
      if (raw) {
        try {
          const parsedUser = JSON.parse(raw)
          // ✅ Validate user object
          if (parsedUser && typeof parsedUser === 'object') {
            setUser(parsedUser)
          } else {
            console.warn('Invalid user data in localStorage')
            setUser(null)
          }
        } catch (error) {
          console.error('Error parsing user from localStorage:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    readUser()

    // Listen to storage changes
    const handleStorageChange = () => readUser()
    const handleUserChanged = () => readUser()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('user-changed', handleUserChanged)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('user-changed', handleUserChanged)
    }
  }, [])

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('token')

      // ✅ Clear cart safely
      if (cart && typeof cart.clear === 'function') {
        cart.clear()
      }

      // Dispatch events
      window.dispatchEvent(new Event('user-changed'))
      window.dispatchEvent(new Event('cart-changed'))

      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error during logout:', error)
      // Still navigate even if cleanup fails
      navigate('/', { replace: true })
    }
  }

  // Phone categories for mega menu
  const phoneCategories = [
    { label: 'iPhone', path: '/search?q=iPhone' },
    { label: 'Samsung', path: '/search?q=Samsung' },
    { label: 'Oppo', path: '/search?q=Oppo' },
    { label: 'Xiaomi', path: '/search?q=Xiaomi' },
    { label: 'Vivo', path: '/search?q=Vivo' },
    { label: 'Realme', path: '/search?q=Realme' },
  ]

  // ✅ Get user display name safely
  const getUserDisplayName = () => {
    if (!user) return 'Bạn'
    return user.name || user.email || 'Bạn'
  }

  // --- Handlers cho User Menu (Thêm delay) ---
  const handleUserMenuEnter = () => {
    if (userMenuTimerRef.current) {
      clearTimeout(userMenuTimerRef.current);
    }
    setIsUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimerRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 200); // 200ms delay
  };

  // --- Handlers cho Mega Menu (Thêm delay) ---
  const handleMegaMenuEnter = () => {
    if (megaMenuTimerRef.current) {
      clearTimeout(megaMenuTimerRef.current);
    }
    setMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimerRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200); // 200ms delay
  };


  return (
    <>
      <header className="topbar" id="topbar" role="banner">
        <div className="container topbar-inner">
          <Link to="/" className="logo" aria-label="MobileHub - Trang chủ">
            <svg className="logo-mark" width="48" height="48" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="120" height="120" rx="18" fill="#DD0000" />
              <g transform="translate(14,18)" fill="#ffffff">
                <circle cx="10" cy="10" r="6"></circle>
                <circle cx="34" cy="10" r="6"></circle>
                <circle cx="58" cy="10" r="6"></circle>
                <rect x="6" y="40" width="62" height="12" rx="6"></rect>
              </g>
            </svg>
            <div className="logo-text">
              <div className="brand">MobileHub</div>
              <div className="brand-sub">Điện thoại • Phụ kiện</div>
            </div>
          </Link>

          <div className="search-wrap" role="search" aria-label="Tìm sản phẩm">
            <SearchBar />
          </div>

          <nav className="top-actions" aria-label="Tài khoản và giỏ hàng">
            {user ? (
              // Bọc nút "Xin chào" và dropdown trong một container
              <div
                className="action-container user-menu-container"
                onMouseEnter={handleUserMenuEnter} // Quay lại onHover
                onMouseLeave={handleUserMenuLeave} // Quay lại onHover
              >
                <button
                  className="action"
                  onClick={() => navigate('/profile')} // Giữ onClick để đi tới profile
                  title="Xem hồ sơ"
                  aria-label={`Xem hồ sơ của ${getUserDisplayName()}`}
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                >
                  <i className="fa fa-user"></i>
                  <span className="action-label">
                    Xin chào, {getUserDisplayName()}
                  </span>
                  {/* Thêm icon chevron */}
                  <i className="fa fa-chevron-down" style={{ fontSize: '10px', marginLeft: '6px', opacity: 0.8 }}></i>
                </button>

                {/* Menu dropdown */}
                {isUserMenuOpen && (
                  <div
                    className="user-dropdown-menu"
                    role="menu"
                    onMouseEnter={handleUserMenuEnter} // Thêm vào để giữ menu mở
                    onMouseLeave={handleUserMenuLeave} // Thêm vào để đóng menu
                  >
                    <Link
                      to="/profile"
                      className="user-dropdown-item"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)} // Đóng menu khi click
                    >
                      <i className="fa fa-user-pen"></i>
                      <span>Thông tin tài khoản</span>
                    </Link>
                    <Link
                      to="/order-history"
                      className="user-dropdown-item"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)} // Đóng menu khi click
                    >
                      <i className="fa-solid fa-box"></i>
                      <span>Lịch sử đơn hàng</span>
                    </Link>
                    <button
                      className="user-dropdown-item logout"
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <i className="fa fa-right-from-bracket"></i>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Giữ nguyên logic khi chưa đăng nhập
              <Link
                to="/login"
                className="action"
                title="Đăng nhập"
                aria-label="Đăng nhập"
              >
                <i className="fa fa-user"></i>
                <span className="action-label">Đăng nhập</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="action"
              aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            >
              <i className="fa fa-shopping-cart"></i>
              <span className="action-label">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="cart-badge" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <nav className="main-nav" id="mainNav" role="navigation" aria-label="Main navigation">
        <div className="container nav-inner">
          <ul className="menu" role="menubar" aria-label="Danh mục">
            <li
              className="menu-item-with-submenu"
              onMouseEnter={handleMegaMenuEnter} // Giữ nguyên hover + delay
              onMouseLeave={handleMegaMenuLeave} // Giữ nguyên hover + delay
            >
              <div className="nav-item-wrapper">
                <Link to="/search?q=Điện thoại" className="nav-item">
                  <i className="fa fa-mobile-screen-button"></i>
                  <span>Điện thoại</span>
                  <i className="fa fa-chevron-down" style={{ fontSize: 10, marginLeft: 4 }}></i>
                </Link>

                {megaMenuOpen && (
                  <div
                    className="mega-menu"
                    onMouseEnter={handleMegaMenuEnter} // Giữ nguyên hover + delay
                    onMouseLeave={handleMegaMenuLeave} // Giữ nguyên hover + delay
                  >
                    <div className="mega-menu-content">
                      <div className="mega-menu-section">
                        <h4>Thương hiệu</h4>
                        <ul>
                          {phoneCategories.map((cat, idx) => (
                            <li key={idx}>
                              <Link to={cat.path} onClick={() => setMegaMenuOpen(false)}>
                                {cat.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>

            <li><Link to="/search?q=Tablet" className="nav-item"><i className="fa fa-tablet"></i><span>Tablet</span></Link></li>
            <li><Link to="/search?q=Phụ kiện" className="nav-item"><i className="fa fa-headphones"></i><span>Phụ kiện</span></Link></li>
            <li><Link to="/search?q=Sạc Pin" className="nav-item"><i className="fa fa-bolt"></i><span>Sạc &amp; Pin</span></Link></li>
            <li><Link to="/search?q=Khuyến mãi" className="nav-item"><i className="fa fa-tags"></i><span>Khuyến mãi</span></Link></li>
            <li><Link to="/search?q=Dịch vụ" className="nav-item"><i className="fa fa-cog"></i><span>Dịch vụ</span></Link></li>
          </ul>
        </div>
      </nav>
    </>
  )
}