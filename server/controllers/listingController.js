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

    } catch(err) {
        console.log(err);
        return res.status(500).json(
            { message: err.message || err.code}
        )
    }
}