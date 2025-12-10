export const protect = async (req, res, next) => {
    try {
        const authData = req.auth();

        if (!authData.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.userId = authData.userId;

        // Extract plan from 'pla' field
        const planClaim = authData.sessionClaims?.pla || 'u:free';

        // Remove 'u:' prefix if present
        const plan = planClaim.startsWith('u:')
            ? planClaim.substring(2)
            : planClaim;

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