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

## 기술 스택 (고정)

| 영역          | 기술                                         | 비고             |
| ------------- | -------------------------------------------- | ---------------- |
| UI 라이브러리 | React 19                                     | JSX              |
| 번들러        | Vite v7+                                      | `vite.config.js` |
| 상태 관리     | Redux Toolkit + RTK Query                    |                  |
| 스타일링      | Tailwind CSS v4 + daisyUI v5 | `src/index.css`  |
| 라우팅        | React Router DOM v7                          | `src/router.jsx` |
| 언어          | **JavaScript (JSX)** — TypeScript 금지       |                  |
| HTTP          | **RTK Query (fetchBaseQuery)** — Axios 금지  |                  |
| 경로 별칭     | `@/` → `src/`                                | `vite.config.js` |

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

## 환경 변수 (Vite Env)

```js
// ✅
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌
const apiUrl = process.env.REACT_APP_API_URL; // CRA 방식
const apiUrl = process.env.VITE_API_BASE_URL; // Node 방식
```

- 모든 클라이언트 환경 변수는 `VITE_` 접두어 필수
- 시크릿(API Key, OAuth Client Secret) `.env` 포함 금지

```bash
# .env
VITE_API_BASE_URL=https://localhost:8072/api/v1
```





