import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFav from '../../hooks/useFav'
import { getProductDetails } from '../../api/productApi' // Import API
import { formatPrice } from '../../utils/formatPrice'
import '../../styles/components/profile/wishlist.css'

export default function Wishlist() {
  const navigate = useNavigate()
  const { fav, toggle } = useFav() // fav là mảng chứa các ID sản phẩm [1, 2, 3...]
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch chi tiết sản phẩm dựa trên danh sách ID yêu thích
  useEffect(() => {
    const fetchFavProducts = async () => {
      if (fav.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Tạo mảng các promise để gọi API cho từng ID
        const requests = fav.map(id => 
          getProductDetails(id).catch(() => null) // Nếu lỗi 1 sp thì trả về null để không crash cả list
        )
        
        const results = await Promise.all(requests)
        // Lọc bỏ các sản phẩm null (lỗi hoặc đã bị xóa)
        setProducts(results.filter(p => p !== null))
      } catch (error) {
        console.error("Lỗi tải wishlist:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavProducts()
  }, [fav]) // Chạy lại khi danh sách fav thay đổi

  if (loading) return <div className="loading-text">Đang tải sản phẩm yêu thích...</div>

  if (products.length === 0) {
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
      <h3>Sản phẩm yêu thích ({products.length})</h3>
      <div className="wishlist-grid">
        {products.map(p => {
          // Lấy giá và ảnh từ variant mặc định hoặc variant đầu tiên
          const defaultVariant = p.variants?.find(v => v.id === p.defaultVariantId) || p.variants?.[0]
          const displayPrice = defaultVariant ? defaultVariant.price : p.price
          const displayImage = defaultVariant ? defaultVariant.imageUrl : (p.images?.[0] || '/no-image.png')

          return (
            <div key={p.id} className="wishlist-item">
              <button 
                className="wishlist-remove"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(p.id) // Xóa khỏi fav -> trigger useEffect -> reload list
                }}
                title="Bỏ yêu thích"
              >
                <i className="fa fa-times"></i>
              </button>
              <img 
                src={displayImage} 
                alt={p.name}
                onClick={() => navigate(`/product/${p.id}`)}
                onError={e => e.target.src='/no-image.png'}
              />
              <div className="wishlist-info">
                <div 
                  className="wishlist-name"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  {p.name}
                </div>
                <div className="wishlist-price">
                  {displayPrice ? formatPrice(displayPrice) : 'Liên hệ'}
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  Xem sản phẩm
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}