import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { searchProducts } from '../api/productApi'
import ProductCard from '../components/home/ProductCard'
import QuickViewModal from '../components/home/QuickViewModal'
import '../styles/pages/search-results.css'
import { useToast } from '../components/ToastProvider'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function SearchResults() {
  const navigate = useNavigate()
  const query = useQuery()

  // --- URL params ---
  const q = query.get('q') || ''
  const priceRangeParam = query.get('priceRange') || 'all'
  const sortByParam = query.get('sortBy') || 'default'
  const pageParam = parseInt(query.get('page') || '0', 10)
  const brandsParam = query.get('brands') ? query.get('brands').split(',') : []
  const discountOnlyParam = query.get('discountOnly') === 'true'

  // --- State ---
  const [pageData, setPageData] = useState({ content: [], totalPages: 1, number: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(pageParam)
  const [size] = useState(10)
  const [priceRange, setPriceRange] = useState(priceRangeParam)
  const [brands, setBrands] = useState(brandsParam)
  const [discountOnly, setDiscountOnly] = useState(discountOnlyParam)
  const [sortBy, setSortBy] = useState(sortByParam)

  // Quick View
  const [modalOpen, setModalOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)

  // --- Update URL params ---
  const updateParams = (updates) => {
    const params = new URLSearchParams(window.location.search)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','))
      } else {
        params.set(key, value)
      }
    })
    navigate({ search: params.toString() })
  }

  // --- Fetch products ---
  const fetchProducts = async (pageToFetch = page) => {
    setLoading(true)
    try {
      const res = await searchProducts({
        q,
        page: pageToFetch,
        size,
        priceRange,
        brands,
        discountOnly,
        sortBy,
      })
      setPageData(res)
      setPage(res.number)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getSortedProducts = () => {
    if (!pageData.content) return []
    const sorted = [...pageData.content]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.defaultVariant.price - b.defaultVariant.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.defaultVariant.price - a.defaultVariant.price)
        break
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        break
    }
    return sorted
  }

  useEffect(() => {
    fetchProducts(0)
  }, [q, size, priceRange, brands, discountOnly, sortBy])

  // --- Handlers ---
  const handlePriceChange = (value) => {
    setPriceRange(value)
    updateParams({ priceRange: value, page: 0 })
    fetchProducts(0)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    updateParams({ sortBy: value, page: 0 })
    fetchProducts(0)
  }

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage })
    fetchProducts(newPage)
  }

  const handleResetFilters = () => {
    setPriceRange('all')
    setSortBy('default')
    setBrands([])
    setDiscountOnly(false)
    updateParams({ priceRange: 'all', sortBy: 'default', brands: [], discountOnly: false, page: 0 })
    fetchProducts(0)
  }
  const toast = useToast()
  const openQuickView = (id) => {
    const p = pageData.content.find((x) => String(x.id) === String(id));
    if (!p) return toast.error("Không tìm thấy sản phẩm");
    setModalProduct(p);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  }

  const closeQuickView = () => {
    setModalOpen(false)
    setModalProduct(null)
    document.body.style.overflow = ''
  }

  const formatPrice = (v) => {
    if (!v && v !== 0) return ''
    try { return new Intl.NumberFormat('vi-VN').format(Number(v)) + '₫' }
    catch { return v + '₫' }
  }

  return (
    <main className="search-results-page">
      <div className="container">

        {/* HEADER */}
        <div className="search-header">
          <div>
            <h3 className="section-title">Kết quả tìm kiếm</h3>
            <p className="muted">
              Tìm cho: <strong>"{q}"</strong> · {pageData.totalElements || pageData.content.length} kết quả
            </p>
          </div>
        </div>

        <div className="search-content">

          {/* SIDEBAR FILTER */}
          <aside className="filters-sidebar">

            {/* Sort */}
            <div className="filter-section">
              <h4 className="filter-title">
                <i className="fa fa-sort"></i> Sắp xếp
              </h4>
              <div className="filter-options">
                {['default', 'price-asc', 'price-desc', 'name-asc', 'name-desc'].map(v => (
                  <label key={v} className="filter-option">
                    <input type="radio" name="sort" value={v} checked={sortBy === v} onChange={e => handleSortChange(e.target.value)} />
                    <span>{v === 'default' ? 'Mặc định' : v === 'price-asc' ? 'Giá thấp đến cao' : v === 'price-desc' ? 'Giá cao đến thấp' : v === 'name-asc' ? 'Tên A-Z' : 'Tên Z-A'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="filter-section">
              <h4 className="filter-title">
                <i className="fa fa-dollar-sign"></i> Khoảng giá
              </h4>
              <div className="filter-options">
                {[{ v: 'all', label: 'Tất cả' }, { v: 'under5', label: 'Dưới 5 triệu' }, { v: '5to10', label: '5 - 10 triệu' }, { v: '10to20', label: '10 - 20 triệu' }, { v: '20to30', label: '20 - 30 triệu' }, { v: 'over30', label: 'Trên 30 triệu' }].map(opt => (
                  <label key={opt.v} className="filter-option">
                    <input type="radio" name="price" value={opt.v} checked={priceRange === opt.v} onChange={e => handlePriceChange(e.target.value)} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {(priceRange !== 'all' || sortBy !== 'default') && (
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={handleResetFilters}>
                <i className="fa fa-refresh"></i> Xóa bộ lọc
              </button>
            )}

          </aside>

          {/* PRODUCTS GRID */}
          <div className="results-grid-container">
            {loading ? (
              <p>Đang tải...</p>
            ) : pageData.content.length === 0 ? (
              <div className="no-results">
                <i className="fa fa-search"></i>
                <h3>Không tìm thấy sản phẩm</h3>
                <p className="muted">Không có sản phẩm nào phù hợp với "{q}"</p>
              </div>
            ) : (
              <section className="products-grid">
                {getSortedProducts().map((p) => (
                  <ProductCard
                    key={p.id}
                    p={{
                      id: p.id,
                      name: p.name,
                      price: p.defaultVariant.price,
                      imageUrl: p.defaultVariant.imageUrl,
                      discountInPercent: p.discountInPercent,
                    }}
                    onQuickView={openQuickView}
                  />
                ))}
              </section>
            )}

            {/* Pagination */}
            {pageData.content.length > 0 && (
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <button
                  className="btn btn-secondary"
                  disabled={pageData.number <= 0}
                  onClick={() => handlePageChange(pageData.number - 1)}
                >
                  Prev
                </button>

                <span style={{ margin: '0 12px' }}>
                  Trang {pageData.number + 1} / {pageData.totalPages}
                </span>

                <button
                  className="btn btn-secondary"
                  disabled={pageData.number + 1 >= pageData.totalPages}
                  onClick={() => handlePageChange(pageData.number + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick View */}
        {modalOpen && (
          <QuickViewModal
            product={modalProduct}
            onClose={closeQuickView}
          />
        )}
      </div>
    </main>
  )
}
