import { walletApi } from "../api";

export const TransactionService = {

    // creates a new transaction for a specific card
    addTransactionToCardService: async (tarjetaId, transferencia) => {
        try {
            const { data } = await walletApi.post(`/transferencias/tarjeta/${tarjetaId}`, transferencia);
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error adding transaction to card');
        }
    }
};