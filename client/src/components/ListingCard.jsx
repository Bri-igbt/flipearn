import React from 'react'
import {platformIcons} from "../assets/assets.jsx";
import {BadgeCheck, LineChart, MapPin, User} from "lucide-react";
import {useNavigate} from "react-router-dom";

const ListingCard = ({ listing }) => {
    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    return (
        <div className='relative bg-white rounded-2xl shadow-sm border-gray-100 overflow-hidden hover:shadow-md transition'>
            {/* featured banner */}
            {listing.featured && (
                <>
                    <p className='py-1' />
                        <div className='absolute top-0 left-0 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center text-xs font-semibold py-1 tracking-wide uppercase'>
                            Featured
                        </div>
                </>
            )}

            <div className='p-5 pt-8'>
            {/* header*/}
                <div className='flex items-center gap-3 mb-3'>
                    {platformIcons[listing.platform]}

                    <div className='flex flex-col'>
                        <h2>{listing.title}</h2>
                        <p>@{listing.username} - <span className='capitalize'>{listing.platform}</span></p>
                    </div>

                    {listing.verified && <BadgeCheck className='text-green-500 ml-auto w-5 h-5'/>}
                </div>

                <div className='flex flex-wrap justify-between items-center gap-3 my-5 max-w-lg'>
                    <div className='flex items-center text-sm text-gray-600'>
                        <User className='size-6 text-gray-400 mr-1' />
                        <span className='text-lg font-medium text-slate-800 mr-1.5'>
                            {listing.followers_count.toLocaleString()}
                        </span> followers
                    </div>

                    {listing.engagement_rate && (
                        <div className='flex items-center text-sm text-gray-600'>
                            <LineChart data={listing.engagement_rate} className='size-6 text-gray-400 mr-1' />
                            <span>{listing.engagement_rate}</span> % engagement
                        </div>
                    )}
                </div>

            {/* Tags and Location */}
                <div className='flex items-center mb-3 gap-2'>
                    <span className='text-xs font-medium bg-pink-100 text-pink-600 px-3 py-1 capitalize rounded-full'>
                        {listing.niche}
                    </span>
                    {listing.country && (
                        <div className='flex items-center text-sm text-gray-500'>
                            <MapPin className='size-4 text-gray-400  mr-1' />
                            {listing.country}
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
                    {listing.description}
                </p>
                <hr className='my-5 border-gray-200' />

                {/* Footer */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-baseline'>
                        <span className='text-2xl font-medium text-slate-800'>
                            {currency}
                            {listing.price.toLocaleString()}
                        </span>
                    </div>

                    <button onClick={() => {navigate(`/listing/${listing.id}`); scrollTo(0,0)}} className='px-7 py-3 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition'>
                        More Details
                    </button>
                </div>

            </div>
        </div>
    )
}
export default ListingCard
