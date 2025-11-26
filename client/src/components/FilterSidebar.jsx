import React, {useState} from 'react'
import {ChevronDown, Filter, XIcon} from "lucide-react";
import {useNavigate, useSearchParams} from "react-router-dom";

const FilterSidebar = ({showFilterPhone, setShowFilterPhone, filters, setFilters}) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('search')|| "")
    const [expandedSection, setExpandedSection] = useState({
        platform: true,
        price: true,
        followers: true,
        niche: true,
        status: true,
    })
    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY || '$';

    const onSearchChange = (e) => {
        e.preventDefault()
        if (e.target.value) {
            setSearchParams({ search: e.target.value})
            setSearch(e.target.value)
        } else {
            navigate(`/marketplace`)
            setSearch('')
        }
    }

    const toggleSection = (section) => {
        setExpandedSection((prev)=> ({...prev, [section]: !prev[section]}))
    }

    const onFilterChange = (newFilters) => {
        setFilters({...filters, ...newFilters})
    }

    const onClearFilters = () => {
        if(search) {
            navigate(`/marketplace`)
        }
        setFilters({
            platforms: null,
            maxPrice: 100000,
            minPrice: 0,
            niche: null,
            verified: false,
            monetized: false,
        })
    }

    const platforms = [
        {value: 'youtube', label: 'Youtube'},
        {value: 'instagram', label: 'Instagram'},
        {value: 'twitter', label: 'Twitter'},
        {value: 'linkedin', label: 'LinkedIn'},
        {value: 'facebook', label: 'Facebook'},
        {value: 'tiktok', label: 'TikTok'},
        {value: 'discord', label: 'Discord'},
        {value: 'twitch', label: 'Twitch'},
    ]

    const niche = [
        { value: "lifestyle", label: "Lifestyle"},
        { value: "fitness", label: "Fitness"},
        { value: "food", label: "Food"},
        { value: "travel", label: "Travel"},
        { value: "tech", label: "Tech"},
        { value: "fashion", label: "Fashion"},
        { value: "gaming", label: "Gaming"},
        { value: "beauty", label: "Beauty"},
        { value: "business", label: "Business"},
        { value: "entertainment", label: "Entertainment"},
        { value: "education", label: "Education"},
        { value: "music", label: "Music"},
        { value: "sport", label: "Sport"},
        { value: "art", label: "Art"},
        { value: "finance", label: "Finance"},
        { value: "health", label: "Health"},
    ]

    return (
        <div
            className={`
                ${showFilterPhone ? "max-sm:fixed" : "max-sm:hidden"}
                max-sm:inset-0 z-100 max-sm:h-screen max-sm:overflow-scroll bg-white shadow-sm rounded-lg border border-gray-200 h-fit sticky top-24 md:min-w-[300px]
                `}
        >
            <div className='p-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2 text-gray-700'>
                        <Filter className='size-4'/>
                        <h3 className='font-semibold'>Filters</h3>
                    </div>

                    <div className='flex items-center gap-2'>
                        <XIcon
                            onClick={onClearFilters}
                            className='size-6 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer'
                        />

                        <button onClick={()=>setShowFilterPhone(false)} className='sm:hidden text-sm border text-gray-700 px-3 py-1 rounded'>
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <div className='p-4 space-y-6 sm:max-h-[calc(100vh-200px)] overflow-y-scroll no-scrollbar'>
            {/* search bar */}
                <div className='flex items-center justify-between'>
                    <input
                        type='text'
                        placeholder='Search by Username, platform, niche, etc.'
                        className='w-full text-sm px-3 py-2 border border-gray-300 rounded-md outline-indigo-500'
                        onChange={onSearchChange}
                        value={search}
                    />
                </div>

            {/* platform filter  */}
                <div>
                    <button onClick={()=> toggleSection("platform")} className='flex justify-between items-center w-full mb-3'>
                        <label className='text-sm font-medium text-gray-800'>Platform</label>
                        <ChevronDown className={`size-4 transition-transform ${expandedSection.platform ? 'rotate-180' : ''}`}/>
                    </button>

                    {expandedSection.platform && (
                        <div className='flex flex-col gap-2'>
                            {platforms.map((platform) => (
                                <label key={platform.value} className='flex items-center gap-2 text-gray-700 text-sm'>
                                    <input
                                        type='checkbox'
                                        checked={filters.platform?.includes(platform.value) || false}
                                        onChange={(e)=> {
                                            const checked = e.target.checked
                                            const current = filters.platform || [];
                                            const updated = checked ? [...current, platform.value] : current.filter((p) => p !== platform.value)
                                            onFilterChange({
                                                ...filters,
                                                platform: updated.length > 0 ? updated : null
                                            })
                                        }}
                                    />

                                    <span>{platform.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

            {/*  price range */}
                <div>
                    <button onClick={()=> toggleSection("price")} className='flex justify-between items-center w-full mb-3'>
                        <label className='text-sm font-medium text-gray-800'>Price Range</label>
                        <ChevronDown className={`size-4 transition-transform ${expandedSection.price ? 'rotate-180' : ''}`}/>
                    </button>

                    {expandedSection.price && (
                        <div className='space-y-3'>
                            <input
                                type='range'
                                min='0'
                                max='100000'
                                step='100'
                                value={filters.maxPrice || 100000}
                                onChange={(e)=> onFilterChange({...filters, maxPrice: parseInt(e.target.value)})}
                                className='w-full h-2 bg-gray-200 rounded-lg appearance-none accent-indigo-600 cursor-pointer'
                            />

                            <div className='flex items-center justify-between text-sm text-gray-600'>
                                <span>{currency}0</span>
                                <span>{currency}{(filters.maxPrice || 100000).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>

            {/* followers range */}
                <div>
                    <button onClick={()=> toggleSection("followers")} className='flex justify-between items-center w-full mb-3'>
                        <label className='text-sm font-medium text-gray-800'>Minimum Followers</label>
                        <ChevronDown className={`size-4 transition-transform ${expandedSection.followers ? 'rotate-180' : ''}`}/>
                    </button>

                    {expandedSection.followers && (
                        <select
                            value={filters.minFollowers?.toString() || "0"}
                            onChange={(e)=> onFilterChange({...filters, minFollowers: parseInt(e.target.value) || 0})}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 outline-indigo-500'
                        >
                            <option value='0'>Any Amount</option>
                            <option value='1000'>1K+</option>
                            <option value='10000'>10K+</option>
                            <option value='50000'>50K+</option>
                            <option value='100000'>100K+</option>
                            <option value='500000'>500K+</option>
                            <option value='1000000'>1M+</option>
                        </select>
                    )}
                </div>

            {/* Niche Filter*/}
                <div>
                    <button onClick={()=> toggleSection("niche")} className='flex justify-between items-center w-full mb-3'>
                        <label className='text-sm font-medium text-gray-800'>Niche</label>
                        <ChevronDown className={`size-4 transition-transform ${expandedSection.niche ? 'rotate-180' : ''}`}/>
                    </button>

                    {expandedSection.niche && (
                        <select
                            value={filters.niche || ""}
                            onChange={(e)=> onFilterChange({...filters, niche: e.target.value || null})}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 outline-indigo-500'
                        >
                            <option value=''>Any niches</option>
                            {niche.map((niche) => (
                                <option key={niche.value} value={niche.value}>
                                    {niche.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

            {/*verification status*/}
                <div>
                    <button onClick={()=> toggleSection("status")} className='flex justify-between items-center w-full mb-3'>
                        <label className='text-sm font-medium text-gray-800'>Account Status</label>
                        <ChevronDown className={`size-4 transition-transform ${expandedSection.status ? 'rotate-180' : ''}`}/>
                    </button>

                    {expandedSection.status && (
                        <div className='space-y-3'>
                            <label className='flex items-center space-x-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    checked={filters.verified || false}
                                    onChange={(e)=> onFilterChange({...filters, verified: e.target.checked })}
                                />
                                <span className='text-sm text-gray-700 '>Verified account only</span>
                            </label>

                            <label className='flex items-center space-x-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    checked={filters.monetized || false}
                                    onChange={(e)=> onFilterChange({...filters, monetized: e.target.checked })}
                                />
                                <span className='text-sm text-gray-700 '>Monetized account only</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default FilterSidebar
