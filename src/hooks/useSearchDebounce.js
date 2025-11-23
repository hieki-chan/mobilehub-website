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
        const data = await searchProductsByName({ name: term, limit: 6 })
        
        // --- SỬA ĐOẠN NÀY: Xử lý linh hoạt cấu trúc trả về từ API ---
        let resultsArray = []
        if (Array.isArray(data)) {
          resultsArray = data
        } else if (data && Array.isArray(data.content)) {
          resultsArray = data.content
        } else if (data && Array.isArray(data.result)) {
          resultsArray = data.result
        }
        // -----------------------------------------------------------

        if (resultsArray.length > 0) {
          const mappedResults = resultsArray.map(product => ({
            id: product.id,
            name: product.name,
            // Fallback an toàn để tránh lỗi null
            price: product.defaultVariant?.price || product.price || 0,
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