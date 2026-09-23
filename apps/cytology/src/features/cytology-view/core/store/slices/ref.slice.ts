import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface refState {
    toolPanelHeight: number,
}

const initialState: refState = {
    toolPanelHeight: 0,
}

const refSlice = createSlice({
    name: 'refSlice',
    initialState,
    reducers: {
        setToolPanelHeight(state, action: PayloadAction<number>) {
            state.toolPanelHeight = action.payload;
        }
    },
});

export const { setToolPanelHeight } = refSlice.actions;

export default refSlice;
