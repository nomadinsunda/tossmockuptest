import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// 실제 백엔드 호출과 동일한 응답 구조를 반환하는 목업
const mockConfirm = ({ paymentKey, orderId, amount }) =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          data: {
            paymentKey,
            orderId,
            amount,
            status: "DONE",
            approvedAt: new Date().toISOString(),
          },
        }),
      800
    )
  );

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  endpoints: (builder) => ({
    confirmPayment: builder.mutation({
      // 목업 모드일 때는 실제 네트워크 요청 없이 즉시 성공 응답 반환
      ...(USE_MOCK
        ? { queryFn: mockConfirm }
        : {
            query: ({ paymentKey, orderId, amount }) => ({
              url: "/payments/confirm",
              method: "POST",
              body: { paymentKey, orderId, amount },
            }),
          }),
    }),
  }),
});

export const { useConfirmPaymentMutation } = paymentApi;
