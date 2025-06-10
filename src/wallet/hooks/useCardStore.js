import { useDispatch, useSelector } from 'react-redux';
import { cuentasService } from '../../services';
import { addCard, removeCard, setCards, setErrorCard } from '../../store/wallet/CardSlice';

export const useCardStore = () => {

    const dispatch = useDispatch();

    const { cards, activeCard, isLoading, error } = useSelector(state => state.cards);

    // Function to set the loading state
    const startLoadingAccountsCards = async (userId) => {
        try {
            const data = await cuentasService.getAllActiveAccountsOfActiveUser(userId);
            const tarjetas = data.flatMap(account => account.tarjetasDto.filter(t => t.estado === true) || []);
            dispatch(setCards(tarjetas));
        } catch (err) {
            dispatch(setErrorCard(err.message));
        }
    };

    const addCardToAccount = async (accountId, cardData) => {
        try {
            const newCard = await cuentasService.addCardToAccount(accountId, cardData);
            dispatch(addCard({ ...newCard, accountId }));
            return newCard;
        } catch (error) {
            dispatch(setErrorCard(error.message));
            return false;
        }
    };

    const deleteCard = async (cardId) => {
        try {
            await cuentasService.deleteCardFromAccount(cardId);
            dispatch(removeCard(cardId));
            return true;
        } catch (error) {
            dispatch(setErrorCard(error.message));
            return false;
        }
    };

    return {
        // State
        cards,
        activeCard,
        isLoading,
        error,
        // Methods
        startLoadingAccountsCards,
        addCardToAccount,
        deleteCard,
    };
};