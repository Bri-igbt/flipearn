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
            include: {owner: true},
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
        const auth = await req.auth();
        const { userId } = auth;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - No user ID' });
        }

        const listings = await prisma.listing.findMany({
            where: {
                ownerId: userId,
                status: {
                    not: 'deleted'
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const balance = {
            earned: user.earned || 0,
            withdrawn: user.withdrawn || 0,
            available: (user.earned || 0) - (user.withdrawn || 0)
        };

        return res.json({
            success: true,
            listings: listings || [],
            balance
        });

    } catch(err) {
        console.log(err);
        return res.status(500).json(
            { message: err.message || err.code}
        )
    }
}

// Controller for updating listing in a database
export const updatingListing = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const accountDetails = JSON.parse(req.body.accountDetails || '{}');

        if (!accountDetails.id) {
            return res.status(400).json({ message: 'Listing ID is required' });
        }

        const existingListing = await prisma.listing.findFirst({
            where: {
                id: accountDetails.id,
                ownerId: userId
            }
        });

        if (!existingListing) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }

        if (existingListing.status === "sold") {
            return res.status(400).json({ message: "You can't update a sold listing" });
        }

        const existingImages = accountDetails.images || [];
        const newImagesCount = req.files ? req.files.length : 0;

        if (existingImages.length + newImagesCount > 5) {
            return res.status(400).json({
                message: 'Maximum 5 images allowed. You have ' +
                    existingImages.length + ' existing and tried to add ' +
                    newImagesCount + ' new images.'
            });
        }

        const updateData = {
            title: accountDetails.title,
            description: accountDetails.description,
            username: accountDetails.username?.startsWith('@')
                ? accountDetails.username.slice(1)
                : accountDetails.username,
            platform: accountDetails.platform?.toLowerCase(),
            niche: accountDetails.niche?.toLowerCase(),
            category: accountDetails.category,
            followers_count: parseFloat(accountDetails.followers_count) || 0,
            engagement_rate: parseFloat(accountDetails.engagement_rate) || 0,
            monthly_views: parseFloat(accountDetails.monthly_views) || 0,
            price: parseFloat(accountDetails.price) || 0,
            condition: accountDetails.condition,

            verified: accountDetails.verified || false,
            monetized: accountDetails.monetized || false,
            country: accountDetails.country || null,
            age_range: accountDetails.age_range || ''
        };

        if (req.files && req.files.length > 0) {
            const uploadImages = req.files.map(async (file) => {
                try {
                    const response = await imageKit.files.upload({
                        file: fs.createReadStream(file.path),
                        fileName: `${Date.now()}_${file.originalname}`,
                        folder: 'flip-earn',
                        transformation: { pre: "w-1280, h-auto" }
                    });
                    return response.url;
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                    throw new Error('Failed to upload images');
                }
            });

            const newImageUrls = await Promise.all(uploadImages);
            updateData.images = [...existingImages, ...newImageUrls];
        } else {
            // Keep existing images
            updateData.images = existingImages;
        }

        // Clean up undefined/null fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // Update the listing
        const updatedListing = await prisma.listing.update({
            where: {
                id: accountDetails.id,
                ownerId: userId
            },
            data: updateData
        });

        // Clean up uploaded files
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Failed to delete temp file:', err);
                });
            });
        }

        return res.json({
            success: true,
            message: "Account updated successfully",
            listing: updatedListing
        });

    } catch(err) {
        console.error('Error in updatingListing:', err);

        // Clean up files on error
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                fs.unlink(file.path, () => {});
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message || 'Failed to update listing'
        });
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

//Controller for deleting a listing
export const deleteUserListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { userId } = await req.auth();

        // OPTIMIZATION: Direct update with condition check
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check and update in single transaction
            const listing = await tx.listing.findFirst({
                where: {
                    id: listingId,
                    ownerId: userId,
                    status: { not: 'sold' } // Filter sold listings early
                },
                select: {
                    isCredentialChanged: true,
                    owner: { select: { email: true } }
                }
            });

            if (!listing) {
                throw new Error('NOT_FOUND');
            }

            // 2. Update to deleted
            await tx.listing.update({
                where: { id: listingId },
                data: { status: 'deleted' }
            });

            return listing;
        });

        // Send response immediately
        res.json({
            success: true,
            message: 'Listing deleted successfully'
        });

        // Fire and forget email (after response sent)
        if (result.isCredentialChanged) {
            setTimeout(() => {
                sendEmailNotification(result.owner.email, listingId)
                    .catch(err => console.error('Email error:', err));
            }, 0);
        }

    } catch (err) {
        if (err.message === 'NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: 'Listing not found or cannot be deleted'
            });
        }

        console.error('Delete error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete listing'
        });
    }
};

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
        const { id } = req.params;
        const { userId } = await req.auth();

        // Check premium plan
        if (req.plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: 'Premium plan required to feature listings'
            });
        }

        // First verify the listing exists and belongs to this user
        const listing = await prisma.listing.findFirst({
            where: {
                id: id,
                ownerId: userId,
                status: 'active'
            }
        });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found or not authorized'
            });
        }

        await prisma.listing.updateMany({
            where: {
                ownerId: userId,
                featured: true
            },
            data: {
                featured: false
            }
        });

        // Mark the specific listing as featured
        const updatedListing = await prisma.listing.update({
            where: { id: id },
            data: {
                featured: true
            }
        });

        return res.json({
            success: true,
            message: 'Listing marked as featured successfully',
            listing: updatedListing
        });

    } catch (err) {
        console.error('Error marking featured:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to feature listing'
        });
    }
}

// Controller for getting all-users orders
export const getAllUserOrders = async (req, res) => {
    try {
        const { userId } = await req.auth();

        let orders = await prisma.transaction.findMany({
            where: {userId, isPaid: true},
            include: {listing: true}
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