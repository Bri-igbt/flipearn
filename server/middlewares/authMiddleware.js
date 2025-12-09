export const protect = async (req, res, next) => {
    try {
        // Get auth data from request
        const authData = req.auth();

        if (!authData.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Set user info
        req.userId = authData.userId;
        req.user = authData.user; // If available

        // Check plan from session claims
        const plan = authData.sessionClaims?.metadata?.plan || 'free';
        req.plan = plan;

        next();
    } catch (err) {
        console.log('Auth error:', err);
        return res.status(401).json({
            message: 'Authentication failed',
            error: err.message
        });
    }
}