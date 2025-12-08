import prisma from "../configs/prisma.js";


// Controller for getting chat
export const getChat = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const {listingId, chatId} = req.body;

        const listing = await prisma.listing.findUnique({
            where: {id: listingId},
        })

        if(!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Find Existing Chat
        let existingChat = null;
        if(chatId) {
            existingChat = await prisma.chat.findFirst({
                where: {id: chatId, OR: [{ chatUserId: userId }, { ownerUserId: userId }]},
                includes: {listing: true, ownerUser: true, chatUser: true, messages: true}
            })
        } else {
            existingChat = await prisma.chat.findFirst({
                where: {listingId, chatUserId: userId, ownerUserId: listing.ownerId},
                includes: {listing: true, ownerUser: true, chatUser: true, messages: true}
            })
        }

        if(existingChat) {
            res.json({ chat: existingChat });
            if(existingChat.isLastMessageRead === false) {
                const lastMessage = existingChat.messages[existingChat.messages.length - 1];
                const isLastMessageSendByMe = lastMessage.sender_id === userId;

                if(!isLastMessageSendByMe) {
                    await prisma.chat.update({
                        where: {id: existingChat.id},
                        data: {isLastMessageRead: true}
                    })
                }
            }

            return null;
        }

        const newChat = await prisma.chat.create({
            data: {
                listingId,
                chatUserId: userId,
                ownerUserId: listing.ownerId
            },
        })

        const chatWithData = await prisma.chat.findUnique({
            where: {id: newChat.id},
            includes: {
                listing: true,
                ownerUser: true,
                chatUser: true,
                messages: true
            }
        })

        return res.json({ chat: chatWithData });

    } catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message || err.code });
    }
}

// Controller for getting all chat for user
export const getAllUserChat = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const chats = await prisma.chat.findMany({
            where: {OR: [{chatUserId: userId}, {ownerUserId: userId}]},
            includes: {listing: true, ownerUser: true, chatUser: true, messages: true},
            orderBy: {updatedAt: 'desc'}
        })

        if(!chats || chats.length === 0) {
            return res.json({ chats: [] });
        }
        return res.json({ chats });

    } catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message || err.code });
    }
}

// Controller for adding messages to chat
export const sendChatMessage = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const {chatId, message} = req.body;

        const chat = await prisma.chat.findFirst({
            where: {
                AND: [{id: chatId}, {OR: [{chatUserId: userId}, {ownerUserId: userId}]}]
            }
        })
    } catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message || err.code });
    }
}