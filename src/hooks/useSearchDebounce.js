import { useState, useEffect, useRef } from 'react'
import { searchProductsByName } from '../api/productApi'

export function useSearchDebounce(query, delay = 300) {
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setIsSearching(true)

    timerRef.current = setTimeout(async () => {
      const term = query.trim()
      
      try {
        // Gọi API tìm kiếm theo tên
        const data = await searchProductsByName({ name: term, limit: 6 })
        
        if (Array.isArray(data)) {
          // Map dữ liệu từ API (có nested defaultVariant) sang cấu trúc phẳng cho UI hiển thị
          const mappedResults = data.map(product => ({
            id: product.id,
            name: product.name,
            // Ưu tiên lấy giá và ảnh từ biến thể mặc định
            price: product.defaultVariant?.price || product.price,
            image: product.defaultVariant?.imageUrl || product.image || (product.images && product.images[0]) || '/no-image.png'
          }))
          setSuggestions(mappedResults)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [query, delay])

  return { suggestions, isSearching }
}