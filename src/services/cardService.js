import { walletApi } from "../api";

export const CardService = {
    //Add a new card to an account
    addCardToAccount: async (accountId, newCard) => {
        try {
            const { data } = await walletApi.post(`/tarjetas/crear/${accountId}`, newCard);
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error adding card to account');
        }
    },

    //soft delete a card from an account
    deleteCardFromAccount: async (cardId) => {
        try {
            await walletApi.patch(`/tarjetas/eliminar/${parseInt(cardId)}`);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error deleting card from account');
        }
    },
}