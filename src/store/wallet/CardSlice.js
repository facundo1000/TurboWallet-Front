import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cards: [], // Todas las tarjetas normalizadas
    activeCard: null,
    isLoading: false,
    error: null,
};


export const CardSlice = createSlice({
    name: 'cards',
    initialState,
    reducers: {
        setCards: (state, action) => {
            state.cards = action.payload;
        },
        addCard: (state, action) => {
            state.cards.push(action.payload);
        },
        updateCard: (state, action) => {
            const index = state.cards.findIndex(card => card.id === action.payload.id);
            if (index !== -1) {
                state.cards[index] = action.payload;
            }
        },
        removeCard: (state, action) => {
            state.cards = state.cards.filter(card => card.id !== action.payload);
        },
        setActiveCard: (state, action) => {
            state.activeCard = action.payload;
        },
        setErrorCard: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        }
    }
});


// Action creators are generated for each case reducer function
export const {
    setCards,
    addCard,
    updateCard,
    removeCard,
    setActiveCard,
    setErrorCard
} = CardSlice.actions;