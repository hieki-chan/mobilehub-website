import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Loading from "./pages/Loading";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import ShopeeCart from "./pages/OrderHistory";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import CheckoutReturn from "./pages/CheckoutReturn";  
import CheckoutCancel from "./pages/CheckoutCancel";   
import Installment from "./pages/Installment";
import NotFound from "./pages/NotFound";
import { verifyToken, logout } from "./api/authApi";

export default function App() {
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const location = useLocation();
  const currentPath = location.pathname;

  // Những path cần ẩn FOOTER (như bạn đang làm)
  const hideFooterPaths = ["/product/", "/cart", "/search"];

  // ✅ Những path PayOS cần ẩn cả header + footer
  const hideLayoutPaths = ["/checkout/return", "/checkout/cancel"];

  const hideHeader = hideLayoutPaths.some((p) => currentPath.startsWith(p));

  const hideFooter =
    hideFooterPaths.some((p) => currentPath.startsWith(p)) ||
    hideLayoutPaths.some((p) => currentPath.startsWith(p));

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("token");
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn || !token) {
        setIsChecking(false);
        return;
      }

      const maxRetries = 3;

      for (let i = 1; i <= maxRetries; i++) {
        try {
          const valid = await verifyToken(token);
      
          if (!valid) {
            logout();
            setIsChecking(false);
            return;
          }
      
          setIsChecking(false);
          return;
        } catch (error) {
          setRetryCount(i);
      
          // Delay 1 giây trước khi retry
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );
        }
      }
      

      logout();
      setIsChecking(false);
    };

    checkLogin();
  }, []);

  if (isChecking) return <Loading retryCount={retryCount} />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!hideHeader && <Header />}

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-history" element={<ShopeeCart />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/profile" element={<Profile />} />

          {/* FORM THANH TOÁN */}
          <Route path="/checkout" element={<Checkout />} />

          {/* ✅ PAYOS RETURN/CANCEL PAGES */}
          <Route path="/checkout/return" element={<CheckoutReturn />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />

          <Route path="/installment" element={<Installment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!hideFooter && <Footer />}
    </div>
  );
}
