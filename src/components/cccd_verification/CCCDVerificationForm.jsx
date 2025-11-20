import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';
import { verifyCCCD } from '../../api/cccdVerifyApi';
import './cccd-verification.css';

export default function CCCDVerificationForm({ onClose }) {
    const [isOpen, setIsOpen] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [verificationData, setVerificationData] = useState(null);

    const [cropImage, setCropImage] = useState(null);
    const [cropSide, setCropSide] = useState(null);
    const [cropData, setCropData] = useState({ x: 0, y: 0, width: 856, height: 540 });
    const imgRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleImageUpload = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCropImage(event.target.result);
                setCropSide(side);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (cropImage) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = prev; };
        }
    }, [cropImage]);

    const handleCropImageLoad = (e) => {
        const img = e.target;
        const ratio = 856 / 540;
        let width = Math.min(img.width, 856);
        let height = Math.round(width / ratio);
        if (height > img.height) {
            height = Math.min(img.height, 540);
            width = Math.round(height * ratio);
        }
        const x = Math.round((img.width - width) / 2);
        const y = Math.round((img.height - height) / 2);
        setCropData({ x, y, width, height });
    };

    const handleCropApply = () => {
        if (!cropImage || !imgRef.current) return;
        const img = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        canvas.width = 856;
        canvas.height = 540;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            img,
            cropData.x * scaleX,
            cropData.y * scaleY,
            cropData.width * scaleX,
            cropData.height * scaleY,
            0,
            0,
            856,
            540
        );
        const resizedImage = canvas.toDataURL('image/jpeg', 0.9);
        if (cropSide === 'front') setFrontImage(resizedImage);
        else setBackImage(resizedImage);
        setCropImage(null);
        setCropSide(null);
    };

    const handleMouseDown = (e) => {
        if (!imgRef.current) return;
        setIsDragging(true);
        const rect = imgRef.current.getBoundingClientRect();
        setDragStart({ x: e.clientX - rect.left - cropData.x, y: e.clientY - rect.top - cropData.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x, imgRef.current.width - cropData.width));
        const newY = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y, imgRef.current.height - cropData.height));
        setCropData(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleMouseUp = () => setIsDragging(false);

    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleNextStep = async () => {
        if (currentStep === 1 && frontImage && backImage) {
            setIsVerifying(true);
            try {
                const frontBlob = dataURLtoFile(frontImage, 'front.jpg');
                const backBlob = dataURLtoFile(backImage, 'back.jpg');

                const data = await verifyCCCD(frontBlob, backBlob);

                if (data.status === 'ok') {
                    setVerificationData(data.info);
                    setVerificationResult('success');
                    setCurrentStep(2);
                } else {
                    setVerificationResult('failed');
                }
            } catch (err) {
                console.error(err);
                setVerificationResult('failed');
            } finally {
                setIsVerifying(false);
            }
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
        setCurrentStep(1);
        setFrontImage(null);
        setBackImage(null);
        setVerificationResult(null);
        setVerificationData(null);
    };

    if (!isOpen) return null;

    return (
        <div className="cccd-modal-overlay">
            {cropImage && (
                <div className="crop-modal-overlay">
                    <div className="crop-modal">
                        <div className="upload-instruction">Kéo để chọn vùng cắt theo tỷ lệ 856x540</div>
                        <div
                            className="crop-container"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img
                                ref={imgRef}
                                src={cropImage}
                                alt="Crop preview"
                                onLoad={handleCropImageLoad}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                                draggable={false}
                            />
                            <div
                                className="crop-overlay"
                                style={{
                                    position: 'absolute',
                                    left: `${cropData.x}px`,
                                    top: `${cropData.y}px`,
                                    width: `${cropData.width}px`,
                                    height: `${cropData.height}px`,
                                    border: '2px solid #dc2626',
                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                                    cursor: 'move'
                                }}
                                onMouseDown={handleMouseDown}
                            />
                        </div>
                        <div className="crop-controls">
                            <button className="crop-cancel" onClick={() => setCropImage(null)}>Hủy</button>
                            <button className="crop-apply" onClick={handleCropApply}>Áp Dụng</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="cccd-modal-container">
                <div className="modal-header">
                    <h2>Xác Thực CCCD</h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                {currentStep === 1 && (
                    <div className="upload-section">
                        <div className="upload-instruction">Vui lòng tải lên ảnh mặt trước và mặt sau của CCCD</div>
                        <div className="upload-grid">
                            <div className="upload-box">
                                <input type="file" id="front-upload" accept="image/*" onChange={(e) => handleImageUpload(e, 'front')} className="file-input" />
                                <label htmlFor="front-upload" className="upload-label">
                                    {frontImage ? (
                                        <div className="image-preview">
                                            <img src={frontImage} alt="Mặt trước" />
                                            <div className="image-overlay"><CheckCircle size={32} color="#10b981" /></div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Upload size={40} />
                                            <span>Mặt Trước CCCD</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="upload-box">
                                <input type="file" id="back-upload" accept="image/*" onChange={(e) => handleImageUpload(e, 'back')} className="file-input" />
                                <label htmlFor="back-upload" className="upload-label">
                                    {backImage ? (
                                        <div className="image-preview">
                                            <img src={backImage} alt="Mặt sau" />
                                            <div className="image-overlay"><CheckCircle size={32} color="#10b981" /></div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Upload size={40} />
                                            <span>Mặt Sau CCCD</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        <button className="btn-primary" onClick={handleNextStep} disabled={!frontImage || !backImage}>
                            Tiếp Tục
                        </button>
                    </div>
                )}

                {currentStep === 2 && verificationData && (
                    <div className="info-section">
                        <div className="info-grid">
                            {Object.entries(verificationData).map(([key, value]) => (
                                <div className="info-field full-width" key={key}>
                                    <label>{key}:</label>
                                    <input type="text" value={value || ''} disabled />
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary" onClick={handleClose}>Đóng</button>
                    </div>
                )}

                {isVerifying && (
                    <div className="loading-section">
                        <Loader className="spinner" size={64} />
                        <p>Đang xác minh thông tin...</p>
                    </div>
                )}

                {verificationResult === 'failed' && (
                    <div className="result-section failed">
                        <XCircle size={80} color="#ef4444" />
                        <h3>Xác Thực Thất Bại</h3>
                        <p>Không thể xác minh thông tin CCCD. Vui lòng thử lại.</p>
                        <button className="retry-btn" onClick={handleClose}>Đóng</button>
                    </div>
                )}
            </div>
        </div>
    );
}
