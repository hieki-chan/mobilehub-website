import React, { useMemo } from "react";
import "../styles/pages/PayOSCheckout.css";

export default function PayOSCheckout() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const paymentId = params.get("paymentId") || "pay_demo";
  const returnUrl = params.get("returnUrl") || "http://localhost:5173/checkout/return";
  const amount = params.get("amount") || "0";
  const bankName = params.get("bankName") || "Ngân hàng TMCP Quân đội";
  const accountName = params.get("accountName") || "NGUYEN HUY HOANG";
  const accountNo = params.get("accountNo") || "8999 9999 9999 86";
  const content = params.get("content") || "Thanh toan don hang";

  const fmtAmount = Number(amount || 0).toLocaleString("vi-VN");

  const goReturn = (status) => {
    // returnUrl có thể đã có query => nối & hay ?
    const hasQuery = returnUrl.includes("?");
    const joiner = hasQuery ? "&" : "?";
    window.location.href = `${returnUrl}${joiner}paymentId=${paymentId}&status=${status}`;
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // bạn có thể show toast ở đây nếu muốn
    } catch (e) {
      console.warn("copy failed", e);
    }
  };

  return (
    <div className="payos-page">
      <div className="payos-modal" role="dialog" aria-modal="true">
        {/* HEADER TIP */}
        <div className="payos-header">
          <div className="payos-tip">
            <span className="tip-icon" aria-hidden>💡</span>
            <span>
              Mở App Ngân hàng bất kỳ để <b>quét mã VietQR</b> hoặc{" "}
              <b>chuyển khoản</b> chính xác số tiền bên dưới
            </span>
          </div>

          <button
            className="payos-close"
            onClick={() => goReturn("cancel")}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="payos-body">
          {/* LEFT: QR */}
          <div className="payos-left">
            <div className="vietqr-title">
              <span className="vietqr-text">VIETQR</span>
              <span className="vietqr-pro">PRO</span>
            </div>

            <div className="qr-wrapper">
              <img
                className="qr-img"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                  paymentId
                )}`}
                alt="VietQR"
              />
            </div>

            <div className="qr-footer">
              <span>napas 247</span>
              <span className="dot">|</span>
              <span>MB Bank</span>
            </div>

            <button className="btn-cancel" onClick={() => goReturn("cancel")}>
              Huỷ
            </button>
          </div>

          {/* RIGHT: INFO */}
          <div className="payos-right">
            <div className="bank-row">
              <div className="bank-logo">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#1E3A8A"/>
                  <path d="M24 12L14 20V36H20V28H28V36H34V20L24 12Z" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="bank-label">Ngân hàng</div>
                <div className="bank-name">{bankName}</div>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="label">Chủ tài khoản:</div>
                <div className="value">{accountName}</div>
              </div>

              <div className="info-item has-copy">
                <div>
                  <div className="label">Số tài khoản:</div>
                  <div className="value">{accountNo}</div>
                </div>
                <button className="btn-copy" onClick={() => copy(accountNo)}>
                  Sao chép
                </button>
              </div>

              <div className="info-item has-copy">
                <div>
                  <div className="label">Số tiền:</div>
                  <div className="value">{fmtAmount} vnd</div>
                </div>
                <button className="btn-copy" onClick={() => copy(amount)}>
                  Sao chép
                </button>
              </div>

              <div className="info-item has-copy">
                <div>
                  <div className="label">Nội dung:</div>
                  <div className="value">{content}</div>
                </div>
                <button className="btn-copy" onClick={() => copy(content)}>
                  Sao chép
                </button>
              </div>
            </div>

            <div className="note">
              Lưu ý : Nhập chính xác số tiền <b>{fmtAmount}</b> khi chuyển khoản
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
