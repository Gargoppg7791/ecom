const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const razorpay = require('../config/razorpayClient');

// ... existing code ...

const getEarnings = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Get all completed orders from the database
    const orders = await prisma.order.findMany({
      where: {
        orderStatus: 'PLACED',
      },
      select: {
        totalDiscountedPrice: true,
        createdAt: true,
      },
    });

    // Calculate earnings for different time periods
    const earnings = {
      total: orders.reduce((sum, order) => sum + order.totalDiscountedPrice, 0),
      today: orders
        .filter(order => new Date(order.createdAt) >= startOfToday)
        .reduce((sum, order) => sum + order.totalDiscountedPrice, 0),
      thisWeek: orders
        .filter(order => new Date(order.createdAt) >= startOfWeek)
        .reduce((sum, order) => sum + order.totalDiscountedPrice, 0),
      thisMonth: orders
        .filter(order => new Date(order.createdAt) >= startOfMonth)
        .reduce((sum, order) => sum + order.totalDiscountedPrice, 0),
      lastMonth: orders
        .filter(order => new Date(order.createdAt) >= startOfLastMonth && new Date(order.createdAt) < startOfMonth)
        .reduce((sum, order) => sum + order.totalDiscountedPrice, 0),
    };

    res.status(200).json(earnings);
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings data',
    });
  }
};

const getWeeklyEarnings = async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    // Get all completed orders from this week
    const orders = await prisma.order.findMany({
      where: {
        orderStatus: 'PLACED',
        createdAt: {
          gte: startOfWeek,
        },
      },
      select: {
        totalDiscountedPrice: true,
        createdAt: true,
      },
    });

    // Initialize earnings array for each day of the week
    const weeklyEarnings = Array(7).fill(0);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate earnings for each day
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayOfWeek = orderDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      weeklyEarnings[dayOfWeek] += order.totalDiscountedPrice;
    });

    res.status(200).json({
      days,
      earnings: weeklyEarnings,
    });
  } catch (error) {
    console.error('Error fetching weekly earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly earnings data',
    });
  }
};

const getMonthlyEarnings = async (req, res) => {
  try {
    const prisma = new PrismaClient();
    
    // Get the start of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all completed orders from the current month
    const orders = await prisma.order.findMany({
      where: {
        orderStatus: 'PLACED',
        createdAt: {
          gte: startOfMonth,
        },
      },
      select: {
        totalDiscountedPrice: true,
        createdAt: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    // Calculate daily earnings
    const dailyEarnings = {};
    const uniqueCustomers = new Set();
    let totalEarnings = 0;

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyEarnings[date]) {
        dailyEarnings[date] = 0;
      }
      dailyEarnings[date] += order.totalDiscountedPrice;
      totalEarnings += order.totalDiscountedPrice;
      uniqueCustomers.add(order.user.id);
    });

    // Get last month's earnings for growth calculation
    const lastMonthStart = new Date(startOfMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(startOfMonth);
    lastMonthEnd.setDate(0);

    const lastMonthOrders = await prisma.order.findMany({
      where: {
        orderStatus: 'PLACED',
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      select: {
        totalDiscountedPrice: true,
      },
    });

    const lastMonthEarnings = lastMonthOrders.reduce(
      (sum, order) => sum + order.totalDiscountedPrice,
      0
    );

    // Calculate growth percentage
    const growth = lastMonthEarnings
      ? ((totalEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
      : 0;

    // Format data for response
    const days = Object.keys(dailyEarnings).sort();
    const earnings = days.map((day) => dailyEarnings[day]);

    res.status(200).json({
      success: true,
      days,
      earnings,
      totalEarnings,
      totalOrders: orders.length,
      totalCustomers: uniqueCustomers.size,
      growth: Math.round(growth * 100) / 100,
    });
  } catch (error) {
    console.error('Error fetching monthly earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly earnings data',
    });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    // Get the 5 most recent orders
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                title: true,
                brand: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders',
      error: error.message
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // Count total orders
    const orders = await prisma.order.count({
      where: {
        orderStatus: 'PLACED'
      }
    });

    // Calculate total income from completed orders
    const income = await prisma.order.aggregate({
      where: {
        orderStatus: 'PLACED'
      },
      _sum: {
        totalDiscountedPrice: true
      }
    });

    // Count total notifications (if notification model exists)
    let notifications = 0;
    try {
      notifications = await prisma.notification.count();
    } catch (err) {
      console.log('Notification model might not exist:', err.message);
    }

    // Calculate total payments from completed orders
    const payments = await prisma.order.aggregate({
      where: {
        orderStatus: 'PLACED',
        payments: {
          some: {
            paymentStatus: 'COMPLETED'
          }
        }
      },
      _sum: {
        totalDiscountedPrice: true
      }
    });

    res.status(200).json({
      success: true,
      orders: orders || 0,
      income: income._sum?.totalDiscountedPrice || 0,
      notifications: notifications || 0,
      payments: payments._sum?.totalDiscountedPrice || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
};

const getSalesOverTime = async (req, res) => {
  try {
    // Get start of current week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all orders from current week
    const weeklyOrders = await prisma.order.findMany({
      where: {
        orderStatus: 'PLACED',
        createdAt: {
          gte: startOfWeek
        }
      },
      select: {
        totalDiscountedPrice: true,
        createdAt: true
      }
    });

    // Initialize daily sales data
    const weeklyData = {
      days: [],
      sales: []
    };

    // Calculate sales for each day
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      
      const dayOrders = weeklyOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getDate() === date.getDate();
      });

      const daySales = dayOrders.reduce((sum, order) => sum + order.totalDiscountedPrice, 0);
      
      weeklyData.days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      weeklyData.sales.push(daySales);
    }

    // Calculate average weekly sales
    const averageWeeklySales = weeklyData.sales.reduce((sum, sales) => sum + sales, 0) / 7;

    // Calculate growth percentage
    const previousWeekSales = await prisma.order.aggregate({
      where: {
        orderStatus: 'PLACED',
        createdAt: {
          gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: startOfWeek
        }
      },
      _sum: {
        totalDiscountedPrice: true
      }
    });

    const currentWeekSales = weeklyData.sales.reduce((sum, sales) => sum + sales, 0);
    const previousWeekTotal = previousWeekSales._sum.totalDiscountedPrice || 0;
    const growthPercentage = previousWeekTotal === 0 ? 0 : 
      ((currentWeekSales - previousWeekTotal) / previousWeekTotal) * 100;

    res.status(200).json({
      weeklyData,
      averageWeeklySales,
      growthPercentage
    });
  } catch (error) {
    console.error('Error fetching sales over time:', error);
    res.status(500).json({ message: 'Failed to fetch sales data' });
  }
};

module.exports = {
  getEarnings,
  getWeeklyEarnings,
  getMonthlyEarnings,
  getRecentOrders,
  getDashboardStats,
  getSalesOverTime
}; 