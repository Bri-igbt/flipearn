import React, {useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from "react-redux";
import {dummyChats} from "../assets/assets.jsx";
import {Loader2Icon, SendIcon, XIcon} from "lucide-react";
import {clearChat} from "../app/features/ChatSlice.js";
import {format} from "date-fns";

const Chatbox = () => {
    const dispatch = useDispatch();
    const { listing, isOpen, chatId } = useSelector((state) => state.chat);
    const user = {id: 'user_2'};

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const fetchChat = async () => {
        setChat(dummyChats[0])
        setMessages(dummyChats[0].messages)
        setIsLoading(false)
    }

    useEffect(() => {
        if(listing) {
            fetchChat();
        }
    },[listing])

    useEffect(() => {
        if(!isOpen) {
            setChat(null);
            setMessages([]);
            setIsLoading(true);
            setNewMessage('')
            setIsSending(false);
        }
    },[isOpen])

    // Auto scroll
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!newMessage.trim() || isSending) return;
        setMessages([...messages, {id: Date.now(), chatId: chat.id, sender_id: user.id, message: newMessage, createdAt: new Date()}]);
        setNewMessage('');
    }

    if (!isOpen || !listing) return null;

    return (
        <div className='fixed inset-0 z-100 bg-black/70 backdrop-blur bg-opacity-50 flex items-center justify-center sm:p-4'>
            <div className='bg-white sm:rounded-lg shadow-2xl w-full max-w-2xl h-screen sm:h-[600px] flex flex-col'>
            {/* Header Section */}
                <div className='bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-4 sm:rounded-t-lg flex justify-between items-center'>
                    <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-lg truncate'>{listing.title}</h3>
                        <p className='text-sm text-indigo-100 truncate'>
                            {
                                user.id === listing?.ownerId ? `Chatting with buyer (${chat?.chatUser?.name || 'Loading'})`
                                    :
                                `Chatting with seller (${chat?.ownerUser?.name || 'Loading'})`
                            }
                        </p>
                    </div>

                    <button onClick={() => dispatch(clearChat())} className='ml-4 p-1 bg-white/20 hover:bg-opacity-20 rounded-lg transition-colors'>
                        <XIcon className='w-5 h-5'/>
                    </button>
                </div>

            {/* Messages Section */}
                <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100'>
                    {isLoading ? (
                        <div className='flex justify-center items-center h-full'>
                            <Loader2Icon className='animate-spin text-indigo-600 size-6' />
                        </div>
                        ) : messages.length === 0 ? (
                            <div className='flex justify-center items-center h-full'>
                                <div className='text-center'>
                                    <p className='text-gray-500 mb-2'>No messages yet</p>
                                    <p className='text-gray-400 text-sm'>Start the conversation!</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`} key={message.id}>
                                    <div className={`max-w-[70%] rounded-lg p-3 pb-1 ${message.sender_id === user.id ? 'bg-indigo-600 text-white' : 'text-gray-800 border-gray-200 border bg-white '}`}>
                                        <p className='text-sm whitespace-pre-wrap wrap-break-word'>{message.message}</p>
                                        <p className={`text-[10px] mt-1 ${message.sender_id === user.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {format(new Date(message.createdAt), "MMM dd 'at'  hh:mm a")}
                                        </p>
                                    </div>
                                </div>
                            )
                        )
                    )}

                    <div ref={messagesEndRef} />
                </div>

            {/* Input Section* */}
                {chat?.listing?.status === 'active' ?
                    (
                        <form onSubmit={handleSendMessage} className='p-4 bg-white border-t border-gray-200 rounded-b-lg'>
                            <div className='flex items-end space-x-2'>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if(e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    placeholder='type your message...'
                                    className='flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-indigo-500 max-h-32'
                                    rows={1}
                                />

                                <button disabled={!newMessage.trim() || isSending} className='bg-indigo-600 hover:bg-indigo-700 p-2.5 text-white rounded-lg disabled:opacity-50 transition-colors' type='submit'>
                                    {isSending ? <Loader2Icon className='animate-spin w-5 h-5 ' /> : <SendIcon className='w-5 h-5' />}
                                </button>
                            </div>
                        </form>
                    )
                    :
                    (
                        <div className='p-4 bg-white border-t border-gray-200 rounded-b-lg'>
                            <p className='text-sm text-center text-gray-600'>
                                {chat ? `Listing is ${chat?.listing?.status}` : "Loading chat..."}
                            </p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
export default Chatbox
