import React from 'react'
import { useNavigate } from 'react-router-dom'
import useFav from '../../hooks/useFav'
import { products as mockProducts } from '../../data/products'
import { formatPrice } from '../../utils/formatPrice'
import '../../styles/components/profile/wishlist.css'

export default function Wishlist() {
  const navigate = useNavigate()
  const { fav, toggle } = useFav()
  const pool = (window.__MOCK_PRODUCTS__ && window.__MOCK_PRODUCTS__.length) ? window.__MOCK_PRODUCTS__ : mockProducts
  const favProducts = pool.filter(p => fav.includes(p.id))

  if (favProducts.length === 0) {
    return (
      <div>
        <h3>Sản phẩm yêu thích</h3>
        <div className="empty-state">
          <i className="fa fa-heart"></i>
          <div>Bạn chưa yêu thích sản phẩm nào</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Khám phá sản phẩm
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3>Sản phẩm yêu thích ({favProducts.length})</h3>
      <div className="wishlist-grid">
        {favProducts.map(p => (
          <div key={p.id} className="wishlist-item">
            <button 
              className="wishlist-remove"
              onClick={() => toggle(p.id)}
              title="Bỏ yêu thích"
            >
              <i className="fa fa-times"></i>
            </button>
            <img 
              src={p.image || p.images?.[0] || '/no-image.png'} 
              alt={p.name}
              onClick={() => navigate(`/product/${p.id}`)}
            />
            <div className="wishlist-info">
              <div 
                className="wishlist-name"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                {p.name}
              </div>
              <div className="wishlist-price">
                {p.price ? formatPrice(p.price) : 'Liên hệ'}
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                Xem sản phẩm
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
