import React, {useEffect, useMemo, useState} from 'react'
import {MessageCircle, Search} from "lucide-react";
import {format, isToday, isYesterday, parseISO} from "date-fns";
import {useDispatch} from "react-redux";
import {setChat} from "../app/features/ChatSlice.js";
import {useAuth, useUser} from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../configs/axios.js";

const Messages = () => {
    const { getToken } = useAuth();
    const { user, isLoaded } = useUser();
    const dispatch = useDispatch();

    const [chats, setChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchUserChats = async () => {
       try {
          const  token = await getToken();
          const { data } = await api.get('/api/chat/user', {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          })
           setChats(data?.chats)
           setLoading(false)
       } catch (err) {
           toast.dismissAll();
           toast.error(err.message || err?.response?.data?.message);
       }
    }

    const formatTime = (dataString) => {
        if(!dataString) return;

        const date = parseISO(dataString);
        if(isToday(date)){
             return 'Today' + format(date, ' HH:mm');
        }

        if(isYesterday(date)){
            return 'Yesterday' + format(date, ' HH:mm');
        }

        return format(date, 'MMM dd');
    }

    const filteredChats = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return chats.filter((chat) => {
            const chatUser = chat.chatUserId === user.id ? chat.ownerUser : chat.chatUser;

            return chat.listing?.title?.toLowerCase().includes(query) || chatUser?.name?.toLowerCase().includes(query);
        });
    },[chats, searchQuery])

    const handleOpenChat = (chat) => {
        dispatch(setChat({listing: chat.listing, chatId: chat.id}))
    }

    useEffect(() => {
        if(user && isLoaded) {
            fetchUserChats();
            const interval = setInterval(() => {
                fetchUserChats();
            }, 10 * 1000)

            return () => clearInterval(interval);
        }

    },[user, isLoaded])

    return (
        <div className='mx-auto min-h-screen px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='py-10'>
            {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>Messages</h1>
                    <p className='text-gray-600'>Chat with buyers and sellers</p>
                </div>

            {/* Search bar */}
                <div className='relative mb-8 max-w-xl'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'/>
                    <input
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500'
                        type='text'
                        placeholder='Search conversations'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

            {/* Chat list */}
                {loading ? (
                    <div className='text-center text-gray-500 py-20'>Loading messages...</div>
                ) : (
                    filteredChats.length === 0 ? (
                        <div className='bg-white rounded-lg shadow-xs border border-gray-200 text-center p-16'>
                            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <MessageCircle className='w-8 h-8 text-gray-400'/>
                            </div>
                            <h3>{searchQuery ? 'No chat found' : 'No message yet'}</h3>
                            <p className='text-gray-600'>
                                {searchQuery ? 'Try a different search term' : 'Start a conversation by viewing a listing and clicking "Chat with Seller"'}
                            </p>
                        </div>
                    ) : (
                        <div className='bg-white rounded-lg shadow-xs border border-gray-200 divide-y divide-gray-200'>
                            {filteredChats.map((chat) => {
                                const chatUser = chat.chatUserId === user.id ? chat.ownerUser : chat.chatUser;

                                return (
                                    <button onClick={()=> handleOpenChat(chat)} key={chat.id} className='w-full p-4 transition-colors text-left hover:bg-gray-50'>
                                        <div className='flex items-start space-x-4 '>
                                            <div className='flex-shrink-0'>
                                                <img src={chatUser?.image} alt={chatUser?.name} className='w-10 h-10 rounded-lg object-cover' />
                                            </div>

                                            <div className='min-w-0 flex-1'>
                                                <div className='flex justify-between items-center mb-1'>
                                                    <h3 className='font-semibold text-gray-800 truncate'>{chat.listing?.title}</h3>
                                                    <span className='text-xs text-gray-500 flex-shrink-0 ml-2'>
                                                        {formatTime(chat.updatedAt)}
                                                    </span>
                                                </div>

                                                <p className='text-sm text-gray-600 truncate mb-1 '>{chatUser?.name}</p>
                                                <p className={`text-sm truncate ${!chat?.isLastMessageRead && chat.lastMessageSenderId !== user?.id ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                                                    {chat.lastMessage || 'No message yet'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
export default Messages
