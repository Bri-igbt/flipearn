import prisma from "../configs/prisma.js";
import imageKit from "../configs/imageKit.js";
import fs from "fs";

// Controller for adding new listing to the database
export const addListing = async (req, res) => {
    try {
        const { userId } = await req.auth();

        if(req.plan !== 'premium') {
            const listingCount = await prisma.listing.count({
                where: {ownerId: userId}
            });

            if(listingCount >= 5) {
                return res.status(403).json({
                    message: 'You have reached the free listings limit'
                });
            }
        }

        const accountDetails = JSON.parse(req.body.accountDetails);

        accountDetails.followers_count = parseFloat(accountDetails.followers_count)
        accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate)
        accountDetails.monthly_views = parseFloat(accountDetails.monthly_views)
        accountDetails.price = parseFloat(accountDetails.price)
        accountDetails.platform = accountDetails.platform.toLowerCase()
        accountDetails.niche = accountDetails.niche.toLowerCase()

        accountDetails.username.startsWith('@') ? accountDetails.username = accountDetails.username.slice(1) : null;

        const uploadImages = req.files.map(async (file) => {
            const response = await imageKit.files.upload({
                file: fs.createReadStream(file.path),
                fileName: `${Date.now()}.png`,
                folder: 'flip-earn',
                transformation: {pre: "w-1280, h-auto" }
            });

            return response.url;
        })

        // wait for all uploads to complete
        const images = await Promise.all(uploadImages);

        const listing = await prisma.listing.create({
            data: {
                ownerId: userId,
                images,
                ...accountDetails,
            }
        })

        return res.status(201).json(
            { message: 'Account Listing successfully', listing }
        )
    } catch(err) {
        console.log(err);
        return res.status(500).json(
            { message: err.message || err.code}
        )
    }
}

// Controller for getting all public listings
export const getAllPublicListings = async (req, res) => {
    try {
        const listings = await prisma.listing.findMany({
            where: {status: 'active'},
            includes: {owner: true},
            orderBy: {createdAt: 'desc'},
        })

        if(listings.length === 0 || !listings) {
            return res.json({ listings: [] })
        }
        return res.json({ listings })
    } catch(err) {
        console.log(err);
        return res.status(500).json(
            { message: err.message || err.code}
        )
    }
}

//Controller for getting All User Listing
export const getAllUserListing = async (req, res) => {
    try {
        const { userId } = await req.auth();

        //get all listings except deleted
        const listings = await  prisma.listings.findMany({
            where: {ownerId: userId, status: {not: 'deleted'}},
            orderBy: {createdAt: 'desc'}
        })
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        const balance = {
            earned: user.earned,
            withdrawn: user.withdrawn,
            available: user.earned - user.withdrawn
        }

        if(!listings || listings.length === 0) {
            return res.json({ listings: [], balance })
        }
        return res.json({ listings, balance })

    } catch(err) {
        console.log(err);
        return res.status(500).json(
            { message: err.message || err.code }
        )
    }
}

// Controller for updating listing in a database
export const updatingListing = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const accountDetails = JSON.parse(req.body.accountDetails)

        if(req.file.length + accountDetails.images.length > 5) {
            return res.status(400).json({
                message: 'You can only upload 5 images at a time'
            });
        }

        accountDetails.followers_count = parseFloat(accountDetails.followers_count)
        accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate)
        accountDetails.monthly_views = parseFloat(accountDetails.monthly_views)
        accountDetails.price = parseFloat(accountDetails.price)
        accountDetails.platform = accountDetails.platform.toLowerCase()
        accountDetails.niche = accountDetails.niche.toLowerCase()

        accountDetails.username.startsWith('@') ? accountDetails.username = accountDetails.username.slice(1) : null;

        const listing = await prisma.listing.update({
            where: {id: accountDetails.id, ownerId: userId},
            data: accountDetails,
        })

        if(!listing) {
            return res.status(400).json({ message: 'Listing not found' });
        }

        if(listing.status === "sold") {
            return res.status(400).json({ message: "You can't update a sold listing" });
        }

        if(req.file.length > 0) {
            const uploadImages = req.files.map(async (file) => {
                const response = await imageKit.files.upload({
                    file: fs.createReadStream(file.path),
                    fileName: `${Date.now()}.png`,
                    folder: 'flip-earn',
                    transformation: {pre: "w-1280, h-auto" }
                });
                return response.url;
            })

            // wait for all uploads to complete
            const images = await Promise.all(uploadImages);

            const listing = await prisma.listing.update({
                where: {id: accountDetails.id, ownerId: userId},
                data: {
                    ownerId: userId,
                    ...accountDetails,
                    images: [...accountDetails.images, ...images]
                }
            })

            return res.json({ message: "Account Updated Successfully", listing })
        }

        return res.json({ message: "Account Updated Successfully", listing })

    } catch(err) {
        console.log(err);
        return res.status(500).json(
            { message: err.message || err.code}
        )
    }
}

// Controller for toggling the status
export const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = await req.auth();

        const listing = await prisma.listing.findUnique({
            where: {id, ownerId: userId},
        })

        if(!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        if(listing.status === "active" || listing.status === "inactive") {
            await prisma.listing.update({
                where: {id, ownerId: userId},
                data: {status: listing.status === "active" ? "inactive" : "active"}
            })

        } else if(listing.status === "ban") {
            return res.status(400).json({ message: "Your listing is banned" });

        } else if(listing.status === "sold") {
            return res.status(400).json({ message: "Your listing is sold" });
        }

        return res.json({ message: "Listing status updated successfully", listing });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message || err.code });
    }
}

// Controller for deleting a listing
export const deleteUserListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { userId } = await req.auth();

        const listing = await prisma.listing.findFirst({
            where: {id: listingId, ownerId: userId},
            includes: {owner: true},
        })

        if(!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if(listing.status === 'sold') {
            return res.status(400).json({ message: "sold listing can't be deleted" });
        }

        // if the password has been changed, send the new password to the owner
        if(listing.isCredentialChanged) {
            //send email to owner
        }

        await prisma.listing.update({
            where: {id: listingId},
            data: {status: 'deleted'}
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message || err.code });
    }
}

// Controller for adding a credential to a listing
export const addCredentials = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const {listingId, credential} = req.body;

        if(credential.length === 0 || !listingId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const listing = await prisma.listing.findFirst({
            where: {id: listingId, ownerId: userId},
        })

        if(!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        await prisma.credential.create({
            data: {
                listingId,
                originalCredential: credential
            }
        })
        await prisma.listing.update({
            where: {id: listingId},
            data: {isCredentialSubmitted: true}
        })
        return res.json({ message: 'Credentials added successfully' });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message || err.code });
    }
}

// Controller for markFeatured to a listing
export const markFeatured = async (req, res) => {
    try {
        const {id} = req.params;
        const {userId} = await req.auth();

        if(req.plan !== 'premium') {
            return res.status(400).json({ message: 'Premium plan required to mark featured' });
        }

        // Unset all other featured listings
        await prisma.listing.update({
            where: { ownerId: userId },
            data: { featured: false },
        })

        // Mark the listing as featured
        await prisma.listing.update({
            where: { id },
            data: { featured: true },
        })

        return res.json({ message: 'Listing marked as featured successfully' });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message || err.code });
    }
}

// Controller for getting all-users orders
export const getAllUserOrders = async (req, res) => {
    try {
        const { userId } = await req.auth();

        let orders = await prisma.transaction.findMany({
            where: {userId, isPaid: true},
            includes: {listing: true}
        })

        if(!orders || orders.length === 0) {
            return res.json({ orders: [] })
        }

        // Attach the credential to each order
        const credentials = await prisma.credential.findMany({
            where: {listingId: {in: orders.map((order) => order.listingId)}}
        })

        const orderWithCredentials = orders.map((order) => {
            const credential = credentials.find((cred) => cred.listingId === order.listingId)
            return {...order, credential}
        })

        return res.json({ orders: orderWithCredentials })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message || err.code });
    }
}

// Controller for withdrawing amount from a user's account
export const withdrawAmount = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { amount, account } = req.body;

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })
        const balance = user.earned - user.withdrawn;

        if(amount > balance) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const withdrawal = await prisma.withdrawn.create({
            data: {
                userId,
                amount,
                account
            }
        })

        await prisma.user.update({
            where: {id: userId},
            data: {withdrawn: {increment: amount}}
        })

        return res.json({ message: 'Applied for withdrawal', withdrawal });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message || err.code });
    }
}

// Controller for purchasing a user account
export const purchaseAccount = async (req, res) => {
    try {

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message || err.code });
    }
}