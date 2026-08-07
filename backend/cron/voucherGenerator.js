// cron/voucherGenerator.js
const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');

// Run daily at 2 AM
const setupVoucherCron = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Running voucher generator cron job...');
    
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Find orders delivered more than 7 days ago that haven't generated a voucher
      const eligibleOrders = await Order.find({
        status: 'Delivered',
        deliveredAt: { $lte: sevenDaysAgo },
        voucherGenerated: { $ne: true }, // Not generated yet
        total: { $gte: 10000 } // Orders above ₹10,000
      });
      
      console.log(`Found ${eligibleOrders.length} eligible orders for vouchers`);
      
      for (const order of eligibleOrders) {
        // Generate voucher for the user
        const voucherCode = `GIFT${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        await User.findByIdAndUpdate(order.userId, {
          $push: {
            vouchers: {
              code: voucherCode,
              amount: 1000,
              type: 'gift',
              generatedFrom: {
                orderId: order.orderId,
                orderDate: order.createdAt,
                deliveredDate: order.deliveredAt
              },
              expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days validity
              isUsed: false,
              createdAt: new Date()
            }
          }
        });
        
        // Mark order as voucher generated
        order.voucherGenerated = true;
        await order.save();
        
        console.log(`✅ Voucher ${voucherCode} generated for order ${order.orderId} (User: ${order.userId})`);
      }
      
      console.log('✅ Voucher generator cron job completed');
    } catch (error) {
      console.error('❌ Error in voucher generator cron job:', error);
    }
  });
  
  console.log('📅 Voucher generator cron job scheduled for 2 AM daily');
};

module.exports = setupVoucherCron;