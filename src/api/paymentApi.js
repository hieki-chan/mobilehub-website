import axios from "axios"

const paymentHttp = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080",
  timeout: 15000,
})

// Tạo payment intent (AUTOMATIC hoặc MANUAL tùy backend)
// payload mẫu:
// {
//   orderCode: 12345,
//   amount: 54581500,
//   currency: "VND",
//   captureMethod: "AUTOMATIC",
//   channel: "WEB",
//   returnUrl: "https://your-fe.com/checkout/return?orderCode=12345",
//   provider: "PAYOS"
// }
export async function createPaymentIntent(payload) {
  const idempotencyKey =
    (globalThis.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now())

  const res = await paymentHttp.post(
    "/api/v1/payments/intents",
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } }
  )

  return res.data
}

export async function getPaymentStatus(orderCode) {
  const res = await paymentHttp.get(`/api/v1/payments/${orderCode}/status`)
  return res.data
}

// Nếu sau này bạn dùng capture MANUAL thì mở hàm này
// export async function capturePayment(paymentId, amount) {
//   const res = await paymentHttp.post(`/api/payments/intents/${paymentId}/capture`, { amount })
//   return res.data
// }
