import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    transactions: [],
    activeTransaction: null,
    isLoading: false,
    error: null,
    // filters: {
    //     dateRange: null,
    //     type: 'all',
    //     cardId: null
    // }
};

export const TransactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        setTransactions: (state, action) => {
            state.transactions = action.payload;
        },
        addTransaction: (state, action) => {
            state.transactions.unshift(action.payload);
        },
        updateTransaction: (state, action) => {
            const index = state.transactions.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.transactions[index] = action.payload;
            }
        },
        setLoadingTransactions: (state, action) => {
            state.isLoading = action.payload;
        },
        setErrorTransaction: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
        // setFilters: (state, action) => {
        //     state.filters = { ...state.filters, ...action.payload };
        // }
    }
});


// Action creators are generated for each case reducer function
export const {
    setTransactions,
    addTransaction,
    updateTransaction,
    setErrorTransaction,
    setLoadingTransactions,
    clearError
} = TransactionSlice.actions;