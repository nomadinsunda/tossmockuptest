import { useSearchParams, useNavigate } from "react-router-dom";

export default function FailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code") ?? "UNKNOWN";
  const message = searchParams.get("message") ?? "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow w-full max-w-sm">
        <div className="card-body items-center text-center gap-4">
          <div className="text-5xl">❌</div>
          <h2 className="card-title text-error">결제 실패</h2>
          <div className="text-sm text-base-content/60 flex flex-col gap-1">
            <span>오류 코드: {code}</span>
            <span>{message}</span>
          </div>
          <button className="btn btn-primary w-full" onClick={() => navigate("/")}>
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
