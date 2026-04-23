import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useConfirmPaymentMutation } from "@/features/payment/paymentApi";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirmPayment, { isLoading, isSuccess, isError, error }] =
    useConfirmPaymentMutation();

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = Number(searchParams.get("amount"));

    if (paymentKey && orderId && amount) {
      confirmPayment({ paymentKey, orderId, amount });
    }
  }, [confirmPayment, searchParams]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow w-full max-w-sm">
        <div className="card-body items-center text-center gap-4">
          {isLoading && (
            <>
              <span className="loading loading-spinner loading-lg text-primary" />
              <p>결제 승인 중...</p>
            </>
          )}

          {isSuccess && (
            <>
              <div className="text-5xl">✅</div>
              <h2 className="card-title">결제 완료</h2>
              <div className="text-sm text-base-content/60 flex flex-col gap-1">
                <span>주문번호: {searchParams.get("orderId")}</span>
                <span>
                  결제 금액:{" "}
                  {Number(searchParams.get("amount")).toLocaleString()}원
                </span>
              </div>
              <button className="btn btn-primary w-full" onClick={() => navigate("/")}>
                처음으로
              </button>
            </>
          )}

          {isError && (
            <>
              <div className="text-5xl">⚠️</div>
              <h2 className="card-title text-error">승인 실패</h2>
              <p className="text-sm text-base-content/60">
                {error?.data?.message ?? "결제 승인 중 오류가 발생했습니다."}
              </p>
              <button className="btn btn-outline w-full" onClick={() => navigate("/")}>
                다시 시도
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
