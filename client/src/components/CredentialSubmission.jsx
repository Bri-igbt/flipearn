import React, {useState} from 'react'
import toast from "react-hot-toast";
import {CirclePlusIcon, XIcon} from "lucide-react";
import {useAuth} from "@clerk/clerk-react";
import {useDispatch} from "react-redux";
import api from "../configs/axios.js";
import {getAllUserListing} from "../app/features/listingSlice.js";

const CredentialSubmission = ({ onClose, listing}) => {
    const { getToken } = useAuth()
    const dispatch = useDispatch();

    const[newField, setNewField] = useState('');
    const [credential, setCredential] = useState([
        {type: 'email', value: '', name: 'Email'},
        {type: 'password', value: '', name: 'Password'},
    ])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Check if there is at least one field
            if (credential.length === 0) {
                return toast.error('Please add at least one field');
            }

            // Check if all required fields are filled
            for (const cred of credential) {
                if (!cred.value || cred.value.trim() === '') {
                    return toast.error(`Please fill in the ${cred.name} field`);
                }
            }

            const confirm = window.confirm(
                'Credential will be verified & changed post submission. Are you sure you want to submit?'
            );

            if (!confirm) return;

            toast.loading('Submitting credentials...');

            const token = await getToken();
            const { data } = await api.post(
                '/api/listing/add-credential',
                {
                    credential,
                    listingId: listing.id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.dismiss();
            toast.success(data.message || 'Credentials submitted successfully');

            dispatch(getAllUserListing({ getToken }));
            onClose();

        } catch (err) {
            toast.dismiss();

            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Failed to submit credentials';

            toast.error(errorMessage);
            console.error('Submit credential error:', err.response?.data || err);
        }
    };

    const handleField = () => {
        const name = newField.trim();
        if(!name) return toast("Please enter a valid field name")
        setCredential((prev) => [...prev, {type: 'text', value: '', name}])
        setNewField('');
    }
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 backdrop-blur z-100 sm:p-4'>
            <div className='bg-white sm:rounded-lg shadow-2xl w-full max-w-lg h-screen sm:h-[320px] flex flex-col'>
            {/*  Header */}
                <div className='flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-400 text-white p-4 sm:rounded-t-lg'>
                    <div className='flex-1 min-w-0'>
                        <h3>{listing?.title}</h3>
                        <p>Adding Credentials for {listing?.username} on {listing?.platform}</p>
                    </div>

                    <button onClick={onClose} className='ml-4 p-1 hover:bg-white/20 hover:bg-opacity-20 rounded-lg transition-colors'>
                        <XIcon className='h-6 w-6 '/>
                    </button>
                </div>

            {/* Form */}
                <form onSubmit={handleSubmit} className='flex flex-col items-start gap-4 p-4 overflow-y-scroll'>
                    {credential.map((cred, index) => (
                        <div key={index} className='grid grid-cols-[2fr_3fr_1fr] items-center gap-2'>
                            <label className='text-sm font-medium text-gray-800'>
                                {cred.name}
                            </label>
                            <input
                                type='text'
                                value={cred.value}
                                onChange={(e) => setCredential((prev) => prev.map((c, i) => (i === index ? {...c, value: e.target.value} : c)))}
                                className='w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-indigo-400 '
                            />
                            <XIcon
                                className='w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer'
                                onClick={() => setCredential((prev) => prev.filter((_, i) => i !== index))}
                            />
                        </div>
                    ))}

                {/*  Add More Fields */}
                    <div className='flex items-center gap-2'>
                        <input
                            type='text'
                            value={newField}
                            onChange={(e) => setNewField(e.target.value)}
                            placeholder='field name ...'
                            className='w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none'
                        />
                        <button type='button' onClick={handleField} className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 cursor-pointer'>
                            <CirclePlusIcon className='h-5 w-5'/>
                        </button>
                    </div>

                {/*  Submit Button */}
                    <button type='submit' className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md mt-4'>
                        Submit
                    </button>
                </form>
            </div>
        </div>
    )
}
export default CredentialSubmission
