import React from 'react'
import {assets} from "../assets/assets.jsx";
import {useNavigate, Link} from "react-router-dom";
import {BoxIcon, GridIcon, ListIcon, MenuIcon, MessageCircleMoreIcon, XIcon} from "lucide-react";
import { useUser, useClerk, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
    const {user} = useUser();
    const {openSignIn} = useClerk();

    const [menuOpen, setMenuOpen] = React.useState(false)
    const navigate = useNavigate();

    return (
        <nav className='h-20'>
            <div className='fixed left-0 top-0 right-0 z-100 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white transition-all'>
                <img
                    src={assets.logo}
                    alt="logo"
                    className='h-10 cursor-pointer'
                    onClick={() => {
                        navigate('/');
                        scrollTo(0, 0)
                    }}
                />

                {/* Desktop Menu */}
                <div className='hidden sm:flex items-center gap-4 md:gap-8 max-md:text-sm text-gray-800'>
                    <Link
                        to='/'
                        onClick={() => scrollTo(0, 0)}
                    >
                        Home
                    </Link>

                    <Link
                        to='/marketplace'
                        onClick={() => scrollTo(0, 0)}
                    >
                        Marketplace
                    </Link>

                    <Link
                        to={user ? '/messages' : "#"}
                        onClick={() => user ? navigate('/messages') && scrollTo(0, 0) : openSignIn()}
                    >
                        Messages
                    </Link>

                    <Link
                        to={user ? '/my-listings' : "#"}
                        onClick={() => user ? navigate('/my-listings') && scrollTo(0, 0) : openSignIn()}
                    >
                        My Listings
                    </Link>
                </div>

                <div className='flex items-center gap-4'>
                    {!user ? (
                        <button
                            className='max-sm:hidden cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full'
                            onClick={() => openSignIn()}
                        >
                            Login
                        </button>
                    ) : (
                        <UserButton>
                            <UserButton.MenuItems>
                                <UserButton.Action
                                    label='Marketplace'
                                    labelIcon={<GridIcon size={16} />}
                                    onClick={() => navigate('/marketplace')}
                                />

                                <UserButton.Action
                                    label='Messages'
                                    labelIcon={<MessageCircleMoreIcon size={16} />}
                                    onClick={() => navigate('/messages')}
                                />

                                <UserButton.Action
                                    label='My Listings'
                                    labelIcon={<ListIcon size={16} />}
                                    onClick={() => navigate('/my-listings')}
                                />

                                <UserButton.Action
                                    label='my-orders'
                                    labelIcon={<BoxIcon size={16} />}
                                    onClick={() => navigate('/my-orders')}
                                />
                            </UserButton.MenuItems>
                        </UserButton>
                    )}

                    <MenuIcon
                        onClick={() => setMenuOpen(true)}
                        className='sm:hidden cursor-pointer'
                    />
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`sm:hidden fixed inset-0 ${menuOpen ? 'w-full' : 'w-0'} overflow-hidden bg-white backdrop-blur shadow-xl rounded-lg z-[200] text-sm transition-all`}>
                <div className='flex flex-col items-center justify-center h-full text-xl font-semibold gap-6 p-4'>
                    <Link
                        to='/'
                        onClick={() => setMenuOpen(false)}
                    >
                        Home
                    </Link>

                    <Link
                        to='/marketplace'
                        onClick={() => setMenuOpen(false)}
                    >
                        Marketplace
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to='/messages'
                                onClick={() => setMenuOpen(false)}
                            >
                                Messages
                            </Link>
                            <Link
                                to='/my-listings'
                                onClick={() => setMenuOpen(false)}
                            >
                                My Listings
                            </Link>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => openSignIn()}
                                className='text-xl font-semibold'
                            >
                                Messages
                            </button>
                            <button
                                onClick={() => openSignIn()}
                                className='text-xl font-semibold'
                            >
                                My Listings
                            </button>
                        </>
                    )}

                    {!user && (
                        <button
                            className='cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full'
                            onClick={() => openSignIn()}
                        >
                            Login
                        </button>
                    )}

                    <XIcon
                        onClick={() => setMenuOpen(false)}
                        className='absolute top-6 right-6 size-8 text-gray-500 hover:text-gray-700 cursor-pointer'
                    />
                </div>
            </div>
        </nav>
    )
}

export default Navbar