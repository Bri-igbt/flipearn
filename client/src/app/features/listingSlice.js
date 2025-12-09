import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import api from "../../configs/axios.js";

// Get all public listings
export const getAllPublicListings = createAsyncThunk("listing/getAllPublicListings", async () => {
    try {
        const { data } = await api.get("/api/listing/public");
        return data;
    } catch(err) {
        console.log(err);
        return [];
    }
})

// Get all user listings
export const getAllUserListing = createAsyncThunk("listing/getAllUserListing", async ({getToken}) => {
    try {
       const token = await getToken();
       const { data } = await api.get(
           "/api/listing/user",
           {headers: {Authorization: `Bearer ${token}`}}
       );
       return data;
    } catch(err) {
        console.log(err);
        return [];
    }
})

// listingSlice.js
const listingSlice = createSlice({
    name: "listing",
    initialState: {
        listings: [],
        userListings: [], // Already an empty array
        balance: {
            earned: 0,
            withdrawn: 0,
            available: 0
        },
        loading: false,  // Add loading state
        error: null,     // Add error state
    },
    reducers: {
        setListings: (state, action) => {
            state.listings = action.payload;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(getAllPublicListings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllPublicListings.fulfilled, (state, action) => {
                state.loading = false;
                state.listings = action.payload.listings || [];
            })
            .addCase(getAllPublicListings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.listings = []; // Ensure it's an array
            })

            .addCase(getAllUserListing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllUserListing.fulfilled, (state, action) => {
                state.loading = false;
                state.userListings = action.payload.listings || [];
                state.balance = action.payload.balance || {
                    earned: 0,
                    withdrawn: 0,
                    available: 0
                };
            })
            .addCase(getAllUserListing.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.userListings = []; // Ensure it's an array
            });
    }
});

export const { setListings } = listingSlice.actions;
export default listingSlice.reducer;