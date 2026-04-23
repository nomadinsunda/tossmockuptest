import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "@/app/store";
import { router } from "@/router";
import "@/index.css";

// StrictMode 제거: Toss 위젯처럼 DOM을 직접 조작하는 서드파티 라이브러리는
// StrictMode의 이중 마운트와 충돌하여 위젯 초기화 후 setReady가 호출되지 않음
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
