# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Toss Payments(PG 대행사) React SDK를 통합하고 결제 위젯(`@tosspayments/tosspayments-sdk`)을 테스트하는 프로젝트. 실제 결제 플로우(위젯 렌더링 → 결제 요청 → 성공/실패 콜백 처리)를 검증하는 것이 목적이다.

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과물 로컬 미리보기
```

---

## 기술 스택 (고정)

| 영역          | 기술                                        | 비고             |
| ------------- | ------------------------------------------- | ---------------- |
| UI 라이브러리 | React 19                                    | JSX              |
| 번들러        | Vite v7+                                    | `vite.config.js` |
| 상태 관리     | Redux Toolkit + RTK Query                   |                  |
| 스타일링      | Tailwind CSS v4 + daisyUI v5                | `src/index.css`  |
| 라우팅        | React Router DOM v7                         | `src/router.jsx` |
| 언어          | **JavaScript (JSX)** — TypeScript 금지      |                  |
| HTTP          | **RTK Query (fetchBaseQuery)** — Axios 금지 |                  |
| 경로 별칭     | `@/` → `src/`                               | `vite.config.js` |

---

## 언어 규칙 (Pure JS)

```js
// ✅ 올바른 JavaScript
const fetchUser = async (id) => {
  const { data } = await getUser(id)
  return data
}

// ❌ TypeScript 문법 — 절대 사용 금지
const fetchUser = async (id: number): Promise<User> => { ... }
type UserState = { user: User | null }
interface ApiResponse<T> { data: T }
```

- `.ts`, `.tsx` 파일 생성 금지
- JSDoc 타입 주석(`/** @param {number} id */`)은 허용하나 강제하지 않음

---

## 네트워크 규칙 (No Axios)

```js
// ✅ RTK Query 훅으로만 데이터 페칭
const { data, isLoading } = useSearchProductsQuery({ category: "SNACK_JERKY" });
const [createOrder] = useCreateOrderMutation();

// ❌ 절대 사용 금지
import axios from "axios";
axios.get("/products");
fetch("/api/products"); // RTK Query 외부에서 직접 fetch 금지
```

---

## 결제 플로우

### 개요

```
CheckoutPage                    Toss 서버                    SuccessPage / FailPage
─────────────────────────────────────────────────────────────────────────────────
widgets.requestPayment()
  successUrl: /success   →  결제 처리
  failUrl:    /fail      ←  리다이렉트 (Toss가 쿼리 파라미터를 직접 부착)
                                │
                    /success?paymentKey=xxx&orderId=yyy&amount=zzz
                    /fail?code=xxx&message=yyy
                                │
                         useSearchParams()로 수신
                         confirmPayment({ paymentKey, orderId, amount })
```

### 상세 흐름

```
[브라우저: CheckoutPage /]
  1. useEffect → loadTossPayments(CLIENT_KEY)
  2. widgets.renderPaymentMethods({ selector: "#payment-method" })
     widgets.renderAgreement({ selector: "#agreement" })
     → Toss SDK가 해당 DOM 요소에 iframe 위젯을 직접 마운트
  3. 렌더링 완료 후 setReady(true) → 결제 버튼 활성화
  4. 사용자가 "결제하기" 클릭 → widgets.requestPayment({ ..., successUrl, failUrl })
     → Toss 결제창(팝업/리다이렉트)으로 이동

[Toss 서버]
  5. 사용자가 결제 수단 선택 및 인증 완료
  6-a. 성공 → 브라우저를 successUrl로 리다이렉트하며 쿼리 파라미터 부착:
         /success?paymentKey=5zJ4xY...&orderId=order-xxxx&amount=50000
  6-b. 실패 → failUrl로 리다이렉트하며 오류 정보 부착:
         /fail?code=PAY_PROCESS_CANCELED&message=사용자가+결제를+취소했습니다

[브라우저: SuccessPage /success]
  7. useSearchParams()로 URL 파라미터 수신
       paymentKey = searchParams.get("paymentKey")  ← Toss가 부착한 값
       orderId    = searchParams.get("orderId")
       amount     = Number(searchParams.get("amount"))
  8. confirmPayment({ paymentKey, orderId, amount }) 호출
       → VITE_USE_MOCK=true: 목업 응답(status: "DONE") 반환
       → VITE_USE_MOCK=false: POST /payments/confirm 백엔드 호출
  9. isSuccess → 완료 UI 표시 / isError → 오류 UI 표시

[브라우저: FailPage /fail]
  7. useSearchParams()로 code, message 수신 후 표시
```

### paymentKey 란

- Toss 서버가 결제 성공 시 생성하는 고유 식별자. 우리 코드가 만드는 값이 아니다.
- 결제 승인 API(`POST /payments/confirm`) 호출 시 반드시 포함해야 하는 필수 파라미터.
- `SuccessPage`를 직접 URL로 접근하면 `paymentKey`가 없으므로 `confirmPayment`가 호출되지 않는다.

### 주요 주의사항

**StrictMode 제거 필수**
Toss 위젯(`renderPaymentMethods`, `renderAgreement`)은 DOM에 iframe을 직접 삽입한다.
React StrictMode는 개발 모드에서 `useEffect`를 mount → unmount → remount 순서로 두 번 실행한다.
이로 인해 첫 번째 실행에서 위젯이 DOM에 마운트되지만 cleanup에서 `cancelled = true`가 되어 `setReady(true)`가 건너뛰어지고,
두 번째 실행에서는 이미 점유된 DOM에 위젯을 다시 마운트하려다 오류가 발생해 `setReady(true)`가 끝내 호출되지 않는다.
결과: 위젯은 화면에 보이지만 결제 버튼이 영원히 비활성화(`disabled`)됨.
→ `src/main.jsx`에서 `<StrictMode>` 제거로 해결. 복원하지 말 것.

**목업 모드 (`VITE_USE_MOCK=true`)**
백엔드 없이 SPA만으로 전체 플로우를 테스트할 수 있다.
`src/features/payment/paymentApi.js`의 `confirmPayment`가 실제 네트워크 요청 대신
800ms 딜레이 후 `{ status: "DONE" }` 목업 응답을 반환한다.
Toss 위젯 자체는 목업이 아니며 Toss 샌드박스 서버와 실제로 통신한다.
따라서 유효한 테스트 클라이언트 키(`VITE_TOSS_CLIENT_KEY`)는 목업 모드에서도 필요하다.

---

## 환경 변수 (Vite Env)

```bash
# .env
VITE_TOSS_CLIENT_KEY=test_gck_...   # 토스 개발자센터 테스트 클라이언트 키
VITE_API_BASE_URL=https://localhost:8072/api/v1
VITE_USE_MOCK=true                  # false로 바꾸면 실제 백엔드 호출
```

```js
// ✅
const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

// ❌
const clientKey = process.env.VITE_TOSS_CLIENT_KEY; // Node 방식 — Vite에서 동작 안 함
```

- 모든 클라이언트 환경 변수는 `VITE_` 접두어 필수
- `.env` 파일은 `.gitignore`에 포함되어 있으므로 클라이언트 키가 커밋되지 않는다
