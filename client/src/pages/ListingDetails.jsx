import React, {useEffect, useState} from 'react'
import {Link, useNavigate, useParams} from "react-router-dom";
import {getProfileLink, platformIcons} from "../assets/assets.jsx";
import {useSelector} from "react-redux";
import {
    ArrowLeftIcon,
    ArrowUpRightFromSquare,
    CheckCircle2,
    ChevronLeftIcon,
    DollarSign,
    Loader2Icon
} from "lucide-react";

const ListingDetails = () => {
    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY || '$';

    const [listing, setListing] = useState(null)
    const [current, setCurrent] = useState(0)
    const images =listing?.images || [];

    const profileLink = listing && getProfileLink(listing.platform, listing.username)

    const { listingId } = useParams()
    const {listings} = useSelector((state)=> state.listing)

    useEffect(() => {
        const listing = listings.find((listing)=>listing.id === listingId);
        if(listing) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
             setListing(listing)
        }
    }, [listingId, listings]);

    return listing ? (
        <div className='mx-auto min-h-screen px-6 md:px-16 lg:px-24 xl:px-32'>
            <button onClick={()=> navigate(-1)} className='flex items-center gap-2 py-5 text-slate-600'>
                <ArrowLeftIcon className='size-4' /> Go to Previous Page
            </button>

            <div className='flex items-start max-md:flex-col gap-10'>
                <div className='flex-1 max-md:w-full'>
                {/*Top Section*/}
                <div className='bg-white rounded-xl border border-gray-200 p-6 mb-5'>
                    <div className='flex flex-col md:justify-between md:flex-row md:items-end gap-4'>
                        <div className='flex items-start gap-4'>
                            <div className='p-2 rounded-xl'>
                                {platformIcons[listing.platform]}
                            </div>
                            <div>
                                <h2 className='flex items-center gap-2 text-xl font-semibold text-gray-800'>
                                    {listing.title}
                                    <Link to={profileLink} target='_blank'>
                                        <ArrowUpRightFromSquare className='size-4 text-indigo-500'/>
                                    </Link>
                                </h2>

                                <p className='text-sm text-gray-500'>
                                    @{listing.username} ● {listing.platform?.charAt(0).toUpperCase() + listing.platform?.slice(1)}
                                </p>

                                <div className='flex gap-2 mt-2'>
                                    {listing.verified &&
                                        <span className='flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 rounded-md px-2 py-1'>
                                           <CheckCircle2 className='w-3 h-3 mr-1' />
                                            Verified
                                        </span>
                                    }
                                    {listing.monetized &&
                                        <span className='flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-md px-2 py-1'>
                                           <DollarSign className='w-3 h-3 mr-1' />
                                           Monetized
                                        </span>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className='text-right'>
                            <h3 className='text-2xl font-bold text-gray-800'>
                                {currency} {listing.price?.toLocaleString()}
                            </h3>
                            <p className='text-sm text-gray-500'>USD</p>
                        </div>
                    </div>
                </div>

                {/* Screenshot Section */}
                <div>
                    {images?.length > 0 && (
                        <div className='bg-white rounded-xl border border-gray-200 mb-5 overflow-hidden'>
                            <div className='p-4'>
                                <h4 className='text-gray-800 font-semibold'>Screenshot & Proof</h4>
                            </div>

                        {/* Slider contain */}
                            <div className='relative aspect-video w-full overflow-hidden'>
                                <div className='flex transition-transform duration-300 ease-in-out' style={{transform: `translateX(-${current * 100}%)`}}>
                                    {images.map((image, index)=> (
                                        <img
                                            key={index}
                                            src={image}
                                            alt='listing-screenshot'
                                            className='w-full shrink-0' />
                                    ))}
                                </div>

                                {/*Navigation Buttons*/}
                                <button>
                                    <ChevronLeftIcon className='w-5 h-5 text-gray-700' />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                </div>

                <div></div>
            </div>
        </div>
    ) : (
        <div className='flex justify-center items-center h-screen'>
            <Loader2Icon className='size-7 animate-spin text-indigo-600' />
        </div>
    )
}
export default ListingDetails
