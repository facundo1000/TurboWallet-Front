import { configureStore } from "@reduxjs/toolkit";
import { AuthSlice } from "./auth/AuthSlice";
import { AccountSlice } from "./wallet/AccountSlice";
import { CardSlice } from "./wallet/CardSlice";
import { TransactionSlice } from "./wallet/TransactionSlice";


export const store = configureStore({
    reducer: {
        auth: AuthSlice.reducer,
        account: AccountSlice.reducer,
        cards: CardSlice.reducer,
        transactions: TransactionSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});