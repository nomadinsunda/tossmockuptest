import { useEffect, useRef, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

// 테스트용 주문 정보
const ORDER = {
  orderId: `order-${crypto.randomUUID()}`,
  orderName: "토스 결제 위젯 테스트 상품",
  amount: 50_000,
  customerName: "홍길동",
  customerEmail: "test@example.com",
};

export default function CheckoutPage() {
  const widgetsRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initWidgets() {
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      // ANONYMOUS: 비회원 결제 (customerKey 불필요)
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

      await widgets.setAmount({ currency: "KRW", value: ORDER.amount });
      await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      if (!cancelled) {
        widgetsRef.current = widgets;
        setReady(true);
      }
    }

    initWidgets().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePayment() {
    if (!widgetsRef.current) return;
    setLoading(true);
    try {
      await widgetsRef.current.requestPayment({
        orderId: ORDER.orderId,
        orderName: ORDER.orderName,
        customerName: ORDER.customerName,
        customerEmail: ORDER.customerEmail,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });
    } catch (err) {
      // 사용자가 결제창을 닫은 경우 등 정상 취소
      console.warn("결제 취소 또는 오류:", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex justify-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* 주문 요약 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <h2 className="card-title text-lg">주문 정보</h2>
            <div className="flex justify-between text-sm">
              <span className="text-base-content/60">상품명</span>
              <span>{ORDER.orderName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-base-content/60">결제 금액</span>
              <span className="font-bold text-primary">
                {ORDER.amount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 결제 수단 위젯 마운트 포인트 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div id="payment-method" />
          </div>
        </div>

        {/* 약관 동의 위젯 마운트 포인트 */}
        <div id="agreement" />

        <button
          className="btn btn-primary btn-lg"
          disabled={!ready || loading}
          onClick={handlePayment}
        >
          {loading ? <span className="loading loading-spinner" /> : null}
          {ORDER.amount.toLocaleString()}원 결제하기
        </button>
      </div>
    </div>
  );
}
