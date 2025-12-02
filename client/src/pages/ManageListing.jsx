import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import toast from "react-hot-toast";
import {LoaderIcon} from "lucide-react";

const ManageListing = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const { userListings } = useSelector(state => state.listing);

    const [loadingListing, setLoadingListing] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        platform: "",
        username: "",
        followers_count: "",
        engagement_rate: "",
        monthly_views: "",
        niche: "",
        price: "",
        description: "",
        verified: false,
        monetized: false,
        country: "",
        age_range: "",
        images: [],
    })

    const platform = [
        'youtube',
        'tiktok',
        'instagram',
        'twitter',
        'facebook',
        'linkedin',
        'snapchat',
        'reddit',
        'spotify',
        'pinterest',
        'twitch',
    ]

    const niches = [
        'music',
        'entertainment',
        'sports',
        'technology',
        'gaming',
        'lifestyle',
        'news',
        'fashion',
        'food',
        'beauty',
        'travel',
        'health',
        'finance',
        'education',
        'fitness',
        'business',
        'art',
        'other',
    ]

    const ageRanges = [
        '13-17 years',
        '18-24 years',
        '25-34 years',
        '35-44 years',
        '45-54 years',
        '55+ years',
        'Mixed ages'
    ];

    const handleInputChange = (field, value) => {
        setFormData((prev)=> ({...prev, [field]: value}));
    }

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if(!files.length) return;
        if(files.length + formData.images.length > 5) return toast.error("You can only upload up to 5 images");

        setFormData((prev) => ({ ...prev, images: [...prev.images, files] }))
    }

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev, images: prev.images.filter((_, i) => i !== index )
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
    }

    // get the listing data from the store
    useEffect(() => {
        if(!id) return;
        setIsEditing(true)
        setLoadingListing(true)

        const listingVariable = userListings.find((listing) => listing.id === id);
        if(listingVariable) {
            setFormData(listingVariable)
            setLoadingListing(false)
        } else {
            toast.error("Listing not found")
            navigate("/my-listings")
        }
    }, [id]);

    if (loadingListing) {
        return (
            <div className='h-screen flex items-center justify-center'>
                <LoaderIcon className='size-7 animate-spin text-indigo-600'/>
            </div>
        )
    }

    return (
        <div className='min-h-screen py-8'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-800'>
                        {isEditing ? "Edit Listing" : "List Your Account"}
                    </h1>
                    <p className='text-gray-600 mt-2'>
                        {isEditing ? "Update your existing account" : "List your account to get featured on FLIPEARN"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-8'>
                {/* Basic Info */}
                    <Section title='Basic Information'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <InputField
                                label='Listing Title'
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e)}
                                placeholder='e.g. Premium Travel Instagram Account'
                                required={true}
                            />
                        </div>
                    </Section>
                </form>
            </div>
        </div>
    )
}

// common elements //
const Section = ({ title, children }) => (
    <div className='bg-white rounded-lg border border-gray-200 space-y-6 p-6'>
        <h2 className='text-lg font-semibold text-gray-800'>{title}</h2>
        {children}
    </div>
)

const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    min = null,
    max = null,
    }) => (
    <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
            {label}
        </label>

        <input
            type={type}
            min={min}
            max={max}
            placeholder={placeholder}
            value={value}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            className='w-full px-3 py-1.5 text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
    </div>
)

const SelectField = ({ label, value, onChange, options, required = false }) => (
   <div>
       <label className='block text-sm font-medium text-gray-700 mb-2'>
           {label}
       </label>

       <select
           onChange={(e) => onChange(e.target.value)}
           value={value}
           required={required}
           className='w-full px-3 py-1.5 text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
       >
            <option value=''>Select...</option>
       </select>
   </div>
)

export default ManageListing
