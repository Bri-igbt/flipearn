
export const protect = async (req, res, next) => {
    try {
        const { userId, has } = await res.auth();

        if(!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const hasPremiumPlan = await has({ plan: 'premium' });
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        return next();
    } catch(err) {
        console.log(err);
        return res.status(401).json({ message: err.code || err.message });
    }
}