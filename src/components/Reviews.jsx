import React, { useEffect, useState } from 'react'
import { getRatingsByProduct } from '../api/ratingApi'

export default function Reviews({ productId }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRatings() {
      try {
        const data = await getRatingsByProduct({ productId, page: 0, size: 10 })
        setList(data.items || [])
      } catch (err) {
        console.error('Lỗi load đánh giá:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRatings()
  }, [productId])

  if (loading) return <div>Đang tải đánh giá...</div>

  const formatDate = (iso) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const renderAvatar = (name) => {
    const char = name?.[0]?.toUpperCase() || '?'
    return (
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: '#26aa99',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 'bold'
      }}>
        {char}
      </div>
    )
  }

  return (
    <div className="reviews">
      <h3>Đánh giá</h3>
      <div id="reviewsList">
        {!list.length ? <div className="muted">Chưa có đánh giá nào.</div> :
          list.map((r, i) => (
            <div key={i} style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 6px 18px rgba(16,24,40,0.04)', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {renderAvatar(r.username || `Người dùng ${r.userId}`)}
                <strong>{r.username || `Người dùng ${r.userId}`}</strong>
                <div className="muted" style={{ fontSize: 13 }}> - {'★'.repeat(r.stars)}</div>
                <div className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{formatDate(r.createdAt)}</div>
              </div>
              <div className="muted" style={{ marginTop: 6 }}>{r.comment}</div>
              {r.reply && (
                <div style={{ marginTop: 6, padding: 8, background: '#f5f5f5', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {renderAvatar(r.reply.adminName || 'Admin')}
                  <div>
                    <strong>{r.reply.adminName || 'Admin'}:</strong> {r.reply.content} <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>({formatDate(r.reply.createdAt)})</span>
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}
