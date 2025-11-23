import axios from "axios"

const paymentHttp = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080",
  timeout: 15000,
})

/**
 * Tạo payment intent (PayOS prod-only)
 * Payload mới:
 * {
 *   orderCode: 12345,
 *   amount: 54581500, // VND nguyên (integer)
 *   returnUrl?: "https://your-fe.com/checkout/return?orderCode=12345"
 * }
 */
export async function createPaymentIntent(payload) {
  const { orderCode, amount, returnUrl } = payload || {}

  if (orderCode == null) {
    throw new Error("orderCode is required")
  }
  if (amount == null) {
    throw new Error("amount is required")
  }

  // PayOS chỉ nhận VND nguyên
  const normalizedAmount =
    typeof amount === "string" ? parseInt(amount, 10) : Number(amount)

  if (!Number.isFinite(normalizedAmount) || !Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("amount must be a positive integer (VND)")
  }

  const body = {
    orderCode,
    amount: normalizedAmount,
    ...(returnUrl ? { returnUrl } : {}),
  }

  const idempotencyKey =
    (globalThis.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now())

  const res = await paymentHttp.post(
    "/api/v1/payments/intents",
    body,
    { headers: { "Idempotency-Key": idempotencyKey } }
  )

  return res.data
}

export async function getPaymentStatus(orderCode) {
  if (orderCode == null) throw new Error("orderCode is required")
  const res = await paymentHttp.get(`/api/v1/payments/${orderCode}/status`)
  return res.data
}

/**
 * PayOS prod-only không hỗ trợ manual capture/refund.
 * Nếu sau này dùng provider khác thì mở lại.
 */
// export async function capturePayment(paymentId, amount) {
//   const res = await paymentHttp.post(`/api/v1/payments/intents/${paymentId}/capture`, { amount })
//   return res.data
// }
// export async function refundPayment(paymentId, amount) {
//   const res = await paymentHttp.post(`/api/v1/payments/refunds`, { paymentId, amount })
//   return res.data
// }
