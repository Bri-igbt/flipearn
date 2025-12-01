import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Home from "./pages/Home.jsx";
import MarketPlace from "./pages/MarketPlace.jsx";
import MyListing from "./pages/MyListing.jsx";
import ListingDetails from "./pages/ListingDetails.jsx";
import ManageListing from "./pages/ManageListing.jsx";
import Messages from "./pages/Messages.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Loading from "./pages/Loading.jsx";
import Navbar from "./components/Navbar.jsx";
import Chatbox from "./components/Chatbox.jsx";
import {Toaster} from "react-hot-toast";


const App = () => {
    const { pathname } = useLocation();
  return (
    <div>
        <Toaster />
        {!pathname.includes('/admin') && <Navbar />}
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/marketplace' element={<MarketPlace />} />
            <Route path='/my-listings' element={<MyListing />} />
            <Route path='/listing/:listingId' element={<ListingDetails />} />
            <Route path='/create-listing' element={<ManageListing />} />
            <Route path='/edit-listing/:id' element={<ManageListing />} />
            <Route path='/messages' element={<Messages />} />
            <Route path='/my-orders' element={<MyOrders/>} />
            <Route path='/loading' element={<Loading/>} />
        </Routes>
        <Chatbox />
    </div>
  )
}

export default App