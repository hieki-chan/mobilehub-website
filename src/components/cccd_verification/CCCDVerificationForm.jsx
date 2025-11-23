import React, { useState, useRef } from 'react';
import { verifyCCCD } from '../../api/cccdVerifyApi';
import './cccd-verification.css';
import { useToast } from '../ToastProvider';

export default function CCCDVerificationForm({ onClose, onSuccess }) {
  // State quản lý ảnh
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs cho input file
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Xử lý khi chọn ảnh
  const handleImageChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    // Tạo URL preview
    const previewUrl = URL.createObjectURL(file);

    if (side === 'front') {
      setFrontImage(previewUrl);
      setFrontFile(file);
    } else {
      setBackImage(previewUrl);
      setBackFile(file);
    }
  };

  // Xóa ảnh để chọn lại
  const handleRemoveImage = (e, side) => {
    e.stopPropagation(); // Ngăn click lan sang label cha
    if (side === 'front') {
      setFrontImage(null);
      setFrontFile(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      setBackImage(null);
      setBackFile(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  // Gửi dữ liệu
  const toast = useToast()
  const handleSubmit = async () => {
    if (!frontFile || !backFile) return;

    setIsSubmitting(true);
    try {
      // Gọi API (giả định hàm verifyCCCD nhận vào 2 file object)
      await verifyCCCD(frontFile, backFile);
      
      toast.success('Gửi xác thực thành công! Hệ thống đang xử lý.');
      onSuccess();
      onClose(); // Đóng modal
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xác thực. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cccd-v2-overlay" onClick={onClose}>
      <div className="cccd-v2-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="cccd-v2-header">
          <h2 className="cccd-v2-title">
            <i className="fa fa-id-card"></i> Xác thực CCCD
          </h2>
          <button className="cccd-v2-close-btn" onClick={onClose} title="Đóng">
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="cccd-v2-body">
          {isSubmitting ? (
            <div className="cccd-v2-loading">
              <div className="cccd-v2-spinner"></div>
              <p>Đang tải ảnh lên và phân tích...</p>
            </div>
          ) : (
            <>
              <p className="cccd-v2-instruction">
                Vui lòng chụp hoặc tải lên ảnh **mặt trước** và **mặt sau** của thẻ Căn cước công dân (CCCD) gắn chip. 
                <br/>Đảm bảo ảnh rõ nét, không bị mất góc.
              </p>

              <div className="cccd-v2-upload-grid">
                {/* MẶT TRƯỚC */}
                <div 
                  className={`cccd-v2-upload-zone ${frontImage ? 'has-image' : ''}`}
                  onClick={() => !frontImage && frontInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    ref={frontInputRef}
                    onChange={(e) => handleImageChange(e, 'front')} 
                  />

                  {frontImage ? (
                    <>
                      <img src={frontImage} alt="Mặt trước" className="cccd-v2-preview-img" />
                      <div className="cccd-v2-remove-overlay">
                        <button className="cccd-v2-btn-retake" onClick={(e) => handleRemoveImage(e, 'front')}>
                          <i className="fa fa-camera"></i> Chụp lại
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="cccd-v2-placeholder">
                      <i className="fa fa-image cccd-v2-icon"></i>
                      <span className="cccd-v2-label">Mặt Trước</span>
                      <span className="cccd-v2-sub">Nhấn để tải ảnh</span>
                    </div>
                  )}
                </div>

                {/* MẶT SAU */}
                <div 
                  className={`cccd-v2-upload-zone ${backImage ? 'has-image' : ''}`}
                  onClick={() => !backImage && backInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    ref={backInputRef}
                    onChange={(e) => handleImageChange(e, 'back')} 
                  />

                  {backImage ? (
                    <>
                      <img src={backImage} alt="Mặt sau" className="cccd-v2-preview-img" />
                      <div className="cccd-v2-remove-overlay">
                        <button className="cccd-v2-btn-retake" onClick={(e) => handleRemoveImage(e, 'back')}>
                          <i className="fa fa-camera"></i> Chụp lại
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="cccd-v2-placeholder">
                      <i className="fa fa-address-card cccd-v2-icon"></i>
                      <span className="cccd-v2-label">Mặt Sau</span>
                      <span className="cccd-v2-sub">Nhấn để tải ảnh</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="cccd-v2-footer">
                <button className="cccd-v2-btn cccd-v2-btn-cancel" onClick={onClose}>
                  Hủy bỏ
                </button>
                <button 
                  className="cccd-v2-btn cccd-v2-btn-submit" 
                  onClick={handleSubmit}
                  disabled={!frontImage || !backImage}
                >
                  Gửi xác thực
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}