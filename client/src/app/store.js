import { configureStore } from '@reduxjs/toolkit'
import listingReducer from './features/listingSlice.js'
import chatReducer from './features/ChatSlice.js'

export default configureStore({
    reducer: {
        listing: listingReducer,
        chat: chatReducer
    }
})