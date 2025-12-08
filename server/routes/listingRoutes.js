import express from 'express';
import {
    addCredentials,
    addListing, deleteUserListing,
    getAllPublicListings,
    getAllUserListing, getAllUserOrders, markFeatured, purchaseAccount, toggleStatus,
    updatingListing, withdrawAmount
} from "../controllers/listingController.js";
import {protect} from "../middlewares/authMiddleware.js";
import upload from "../configs/multer.js";

const listingRouter = express.Router();

listingRouter.post('/', upload.array("images", 5), protect, addListing)
listingRouter.put('/', upload.array("images", 5), protect, updatingListing)
listingRouter.get('/public', getAllPublicListings)
listingRouter.get('/user', protect, getAllUserListing)
listingRouter.put('/:id/status', protect, toggleStatus)
listingRouter.delete('/:listingId', protect, deleteUserListing);
listingRouter.post('/add-credential', protect, addCredentials)
listingRouter.put('/featured/:id', protect, markFeatured)
listingRouter.get('/user-orders', protect, getAllUserOrders)
listingRouter.post('/withdraw', protect, withdrawAmount)
listingRouter.post('/purchase-account/:listingId', protect, purchaseAccount)




export default listingRouter;
