import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import toast from "react-hot-toast";
import {LoaderIcon, Upload, XIcon} from "lucide-react";
import {useAuth} from "@clerk/clerk-react";
import api from "../configs/axios.js";
import {getAllPublicListings, getAllUserListing} from "../app/features/listingSlice.js";

const ManageListing = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const { userListings } = useSelector(state => state.listing);

    const {getToken } = useAuth();
    const dispatch = useDispatch();

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
        if(files.length + formData.images.length > 5) {
            return toast.error("You can only upload up to 5 images");
        }

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    }
    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev, images: prev.images.filter((_, i) => i !== index )
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.loading("Saving...")
        const dataCopy = structuredClone(formData);
        try {
            if(isEditing) {
                dataCopy.images = formData.images.filter((image) => typeof image === 'string')

                const formDataInstance = new FormData();
                formDataInstance.append('accountDetails', JSON.stringify(dataCopy));

                formData.images.filter((image) => typeof image !== 'string').forEach((image) => {
                    formDataInstance.append('images', image);
                })

                const token = await getToken();

                const { data } = await api.put('/api/listing', formDataInstance, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                toast.dismissAll();
                toast.success(data.message);
                dispatch(getAllUserListing({getToken}))
                dispatch(getAllPublicListings())
                navigate('/my-listings')

            } else {
                delete dataCopy.images;
                const formDataInstance = new FormData();
                formDataInstance.append('accountDetails', JSON.stringify(dataCopy));
                formData.images.forEach((image) => {
                    formDataInstance.append('images', image);
                })

                const token = await getToken();
                const { data } = await api.post('/api/listing', formDataInstance, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                toast.dismissAll();
                toast.success(data.message);
                dispatch(getAllUserListing({getToken}))
                dispatch(getAllPublicListings())
                navigate('/my-listings')
            }

        } catch (error) {
            console.log(error)
        }
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
                                label='Listing Title *'
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e)}
                                placeholder='e.g. Premium Travel Instagram Account'
                                required={true}
                            />

                            <SelectField
                                label='Platform *'
                                value={formData.platform}
                                onChange={(e) => handleInputChange("platform", e)}
                                options={platform}
                                required={true}
                            />

                            <InputField
                                label='Username/Handle *'
                                value={formData.username}
                                onChange={(e) => handleInputChange("username", e)}
                                placeholder='@username'
                                required={true}
                            />

                            <SelectField
                                label='Niche/Category *'
                                value={formData.niche}
                                onChange={(e) => handleInputChange("niche", e)}
                                options={niches}
                                required={true}
                            />
                        </div>
                    </Section>

                    {/* Metrics Section */}
                    <Section title='Account Metrics'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <InputField
                                label='Followers Count *'
                                value={formData.followers_count}
                                onChange={(e) => handleInputChange("followers_count", e)}
                                placeholder='100000'
                                min={0}
                                type='number'
                                required={true}
                            />

                            <InputField
                                label='Engagement Rate (%)'
                                value={formData.engagement_rate}
                                onChange={(e) => handleInputChange("engagement_rate", e)}
                                placeholder='4'
                                min={0}
                                max={100}
                                type='number'
                            />

                            <InputField
                                label='Monthly Views/Impressions'
                                value={formData.monthly_views}
                                onChange={(e) => handleInputChange("monthly_views", e)}
                                placeholder='100000'
                                min={0}
                                type='number'
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <InputField
                                label='Primary Audience Country'
                                value={formData.country}
                                onChange={(e) => handleInputChange("country", e)}
                                placeholder='United States'
                            />
                            <SelectField
                                label='Primary Audience Age Range'
                                value={formData.age_range}
                                onChange={(e) => handleInputChange("age_range", e)}
                                options={ageRanges}
                                required={true}
                            />

                            <div className='space-y-3'>
                                <CheckBoxField
                                    label='Account is Verified on this platform'
                                    checked={formData.verified}
                                    onChange={(e) => handleInputChange("verified", e)}
                                />

                                <CheckBoxField
                                    label='Account is monetized'
                                    checked={formData.monetized}
                                    onChange={(e) => handleInputChange("monetized", e)}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Pricing & Description Section */}
                    <Section title='Pricing & Description'>
                        <div className='space-y-6'>
                            <InputField
                                label='Asking Price (USD) *'
                                value={formData.price}
                                onChange={(e) => handleInputChange("price", e)}
                                placeholder='2500.00'
                                min={0}
                                type='number'
                                required={true}
                            />

                            <TextAreaField
                                label='Description *'
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e)}
                                required={true}
                            />
                        </div>
                    </Section>

                {/* Images Section */}
                    <Section title='Images'>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                            <input
                                type='file'
                                id='images'
                                multiple
                                accept='image/*'
                                onChange={handleImageUpload}
                                className='hidden'
                            />
                            <Upload className='w-12 h-12 text-gray-400 mx-auto mb-4' />

                            <label htmlFor='images' className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
                                Choose Files
                            </label>
                            <p className='text-sm text-gray-500 mt-3'>Upload screenshot or proof of account analysis</p>
                        </div>

                        {formData.images.length > 0 && (
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                                {formData.images.map((img, index) => (
                                    <div key={index} className='relative'>
                                        <img
                                            src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                                            alt={`image ${index + 1}`}
                                            className='w-full h-24 object-cover rounded-lg'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => removeImage(index)}
                                            className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full hover:bg-red-700'
                                        >
                                            <span className='sr-only'>Remove image</span>
                                            <XIcon className='size-6'/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                {/*  Buttons */}
                    <div className='flex justify-end gap-3 text-sm'>
                        <button onClick={()=> navigate(-1)} type='button' className='px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'>
                            Cancel
                        </button>

                        <button type='submit' className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'>
                            {isEditing ? "Update Listing" : "Create Listing"}
                            {loadingListing && <LoaderIcon className='size-5 ml-2 animate-spin text-white'/>}
                        </button>
                    </div>
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
           {options.map((option) => (
               <option key={option} value={option}>{option}</option>
           ))}
       </select>
   </div>
)

const CheckBoxField = ({ label, checked, onChange, required = false }) => (
    <label className='flex items-center space-x-2 cursor-pointer'>
        <input
            type='checkbox'
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            required={required}
            className='size-4'
        />
        <span className='text-sm text-gray-700'>{label}</span>
    </label>
)

const TextAreaField = ({ label, value, onChange, required = false }) => (
    <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
        <textarea
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className='w-full px-3 py-1.5 text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
    </div>
)

export default ManageListing
