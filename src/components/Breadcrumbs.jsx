import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa'; // Đảm bảo bạn đã cài react-icons
import '../styles/components/breadcrumbs.css';

const Breadcrumbs = ({ customLast }) => {
  const location = useLocation();
  
  // Tách URL ra thành mảng, loại bỏ phần tử rỗng
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Bộ từ điển map từ URL sang Tiếng Việt
  const breadcrumbNameMap = {
    'product': 'Sản phẩm',
    'cart': 'Giỏ hàng',
    'checkout': 'Thanh toán',
    'profile': 'Tài khoản',
    'order-history': 'Lịch sử đơn hàng',
    'search': 'Tìm kiếm',
    'login': 'Đăng nhập',
    'register': 'Đăng ký',
    'wishlist': 'Yêu thích',
    'address': 'Sổ địa chỉ',
    'installment': 'Trả góp'
  };

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      <ul className="breadcrumbs-list">
        {/* Luôn luôn hiện nút Trang chủ đầu tiên */}
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link home-icon">
            <FaHome />
          </Link>
          <FaChevronRight className="separator" />
        </li>

        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Lấy tên hiển thị: Nếu là phần tử cuối và có customLast thì dùng customLast
          // Nếu không thì tra từ điển, nếu không có trong từ điển thì giữ nguyên
          let displayName = breadcrumbNameMap[value] || value;

          // Xử lý trường hợp trang chi tiết sản phẩm (ẩn ID đi nếu có customLast)
          if (isLast && customLast) {
            displayName = customLast;
          }

          return (
            <li className="breadcrumb-item" key={to}>
              {isLast ? (
                <span className="breadcrumb-current" title={displayName}>
                  {displayName}
                </span>
              ) : (
                <>
                  <Link to={to} className="breadcrumb-link">
                    {displayName}
                  </Link>
                  <FaChevronRight className="separator" />
                </>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;