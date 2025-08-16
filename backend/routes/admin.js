const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to check if user is authenticated and is admin
const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is logged in via session
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user from database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // Add user to request object for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get user statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize counts
    const userStats = {
      guides: 0,
      tourists: 0,
      serviceProviders: 0,
      admins: 0,
      total: 0
    };

    // Map the aggregation results
    stats.forEach(stat => {
      switch (stat._id) {
        case 'Guide':
          userStats.guides = stat.count;
          break;
        case 'Tourist':
          userStats.tourists = stat.count;
          break;
        case 'ServiceProvider':
          userStats.serviceProviders = stat.count;
          break;
        case 'Admin':
          userStats.admins = stat.count;
          break;
      }
      userStats.total += stat.count;
    });

    res.json({
      success: true,
      stats: userStats
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user statistics' 
    });
  }
});

// Get all users (for admin management)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role; // Optional role filter

    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// Toggle user active status
router.patch('/users/:userId/toggle-status', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Don't allow disabling admin users
    if (user.role === 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot modify admin user status' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status' 
    });
  }
});

module.exports = router;
