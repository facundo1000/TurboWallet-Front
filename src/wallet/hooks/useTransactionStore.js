import { useDispatch, useSelector } from 'react-redux';
import { cuentasService } from '../../services';
import { TransactionService } from '../../services/TransactionService';
import {
    addTransaction,
    clearError,
    setErrorTransaction,
    setLoadingTransactions,
    setTransactions
} from '../../store/wallet/TransactionSlice';

export const useTransactionStore = () => {

    const dispatch = useDispatch();

    const {
        transactions,
        isLoading,
        error,
    } = useSelector(state => state.transactions);

    const createTransaction = async (cardId, transactionData) => {
        dispatch(setLoadingTransactions(true));
        dispatch(clearError());
        try {
            const newTransaction = await TransactionService.addTransactionToCardService(cardId, transactionData);
            dispatch(addTransaction({ ...newTransaction, cardId }));
            return newTransaction;
        } catch (error) {
            dispatch(setErrorTransaction(error.message));
            throw new Error(error.message);
        } finally {
            dispatch(setLoadingTransactions(false));
        }
    };

    const loadTransactions = async (cardId) => {
        dispatch(setLoadingTransactions(true));
        dispatch(clearError());
        try {
            const transactions = await cuentasService.getCardTransactions(cardId);
            dispatch(setTransactions(transactions));
            return transactions;
        } catch (error) {
            dispatch(setErrorTransaction(error.message));
            throw new Error(error.message);
        } finally {
            dispatch(setLoadingTransactions(false));
        }
    };

    // const updateFilters = (newFilters) => {
    //     dispatch(setFilters(newFilters));
    // };

    // Computed values
    // const filteredTransactions = transactions.filter(transaction => {
    //     if (filters.type !== 'all' && transaction.tipoTransferencia !== filters.type) {
    //         return false;
    //     }
    //     if (filters.cardId && transaction.cardId !== filters.cardId) {
    //         return false;
    //     }
    //     return true;
    // });

    return {
        // State
        // transactions: filteredTransactions,
        transactions,
        isLoading,
        error,
        // Methods
        createTransaction,
        loadTransactions,
        clearError: () => dispatch(clearError()),
        // updateFilters,
    };
};