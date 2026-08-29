const protect = async (req, res, next) => {
    console.log('Auth middleware called');
    console.log('Headers:', req.headers);
    
    // For testing, just pass through
    req.user = { _id: 'test-user-id' };
    next();
};

module.exports = { protect };