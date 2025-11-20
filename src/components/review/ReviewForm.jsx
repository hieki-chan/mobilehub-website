import React, { useState, useEffect } from "react";
import "../../styles/components/review/review-form.css";

export default function ReviewForm({ product, existingRating, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.stars);
      setContent(existingRating.comment);
    }
  }, [existingRating]);

  return (
    <div className="rf-overlay">
      <div className="rf-box">
        <div className="rf-header">
          <img src={product.thumbnailUrl} className="rf-img" />
          <div className="rf-info">
            <h3 className="rf-name">{product.productName}</h3>
            <p className="rf-variant">Loại hàng: {product.productVariant}</p>
          </div>
        </div>

        <div className="rf-stars">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              className={rating >= n ? "rf-star-active" : "rf-star"}
              onClick={() => setRating(n)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          className="rf-input"
          placeholder="Chia sẻ cảm nhận của bạn..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <div className="rf-actions">
          <button
            className="rf-submit"
            disabled={!rating || !content.trim()}
            onClick={() => onSubmit({ rating, content })}
          >
            {existingRating ? "Cập nhật đánh giá" : "Gửi đánh giá"}
          </button>
          <button className="rf-cancel" onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
