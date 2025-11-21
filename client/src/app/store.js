import { configureStore } from '@reduxjs/toolkit'
import listingReducer from './features/listingSlice.js'

export default configureStore({
    reducer: {
        listing: listingReducer
    }
})