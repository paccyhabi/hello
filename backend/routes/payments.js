const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const { User, PointsTransaction } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Points packages
const POINTS_PACKAGES = [
  { id: 'basic', points: 1000, price: 999, currency: 'usd', name: 'Basic Pack' }, // $9.99
  { id: 'popular', points: 5000, price: 4999, currency: 'usd', name: 'Popular Pack' }, // $49.99
  { id: 'premium', points: 10000, price: 8999, currency: 'usd', name: 'Premium Pack' }, // $89.99
  { id: 'ultimate', points: 25000, price: 19999, currency: 'usd', name: 'Ultimate Pack' } // $199.99
];

// Get available points packages
router.get('/packages', auth, async (req, res) => {
  try {
    res.json({ packages: POINTS_PACKAGES });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment intent for points purchase
router.post('/purchase-points', auth, [
  body('package_id').isIn(POINTS_PACKAGES.map(p => p.id))
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { package_id } = req.body;
    const package = POINTS_PACKAGES.find(p => p.id === package_id);

    if (!package) {
      return res.status(400).json({ message: 'Invalid package' });
    }

    const user = await User.findByPk(req.user.id);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: package.price,
      currency: package.currency,
      metadata: {
        user_id: user.id.toString(),
        package_id: package.id,
        points: package.points.toString()
      },
      description: `${package.name} - ${package.points} points`
    });

    res.json({
      client_secret: paymentIntent.client_secret,
      package
    });
  } catch (error) {
    console.error('Purchase points error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { user_id, package_id, points } = paymentIntent.metadata;

    try {
      const user = await User.findByPk(user_id);
      if (user) {
        // Add points to user account
        const pointsAmount = parseInt(points);
        await user.addPoints(pointsAmount, `Purchased ${package_id} package`);

        // Create transaction record
        await PointsTransaction.create({
          user_id: user_id,
          amount: pointsAmount,
          type: 'purchased',
          reason: `Points purchase - ${package_id}`,
          balance: user.points,
          metadata: {
            payment_intent_id: paymentIntent.id,
            package_id,
            amount_paid: paymentIntent.amount,
            currency: paymentIntent.currency
          }
        });

        console.log(`Points added to user ${user_id}: ${pointsAmount}`);
      }
    } catch (error) {
      console.error('Error processing payment webhook:', error);
    }
  }

  res.json({ received: true });
});

// Request points withdrawal
router.post('/withdraw', auth, [
  body('amount').isInt({ min: 1000 }), // Minimum 1000 points
  body('method').isIn(['mobile_money', 'bank_transfer', 'paypal']),
  body('account_details').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, method, account_details } = req.body;
    const user = await User.findByPk(req.user.id);

    if (user.points < amount) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Calculate withdrawal amount (1000 points = $10, with 10% fee)
    const dollarAmount = (amount / 100) * 0.9; // 10% fee
    
    // Create withdrawal request (in production, this would be processed by admin)
    const transaction = await PointsTransaction.create({
      user_id: req.user.id,
      amount: -amount,
      type: 'withdrawn',
      reason: `Withdrawal request - ${method}`,
      balance: user.points - amount,
      status: 'pending',
      metadata: {
        method,
        account_details,
        dollar_amount: dollarAmount,
        fee: amount * 0.1
      }
    });

    // Deduct points (in production, only after admin approval)
    user.points -= amount;
    await user.save();

    res.json({
      message: 'Withdrawal request submitted',
      transaction: {
        id: transaction.id,
        amount,
        dollar_amount: dollarAmount,
        status: transaction.status,
        method
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal history
router.get('/withdrawals', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const withdrawals = await PointsTransaction.findAll({
      where: {
        user_id: req.user.id,
        type: 'withdrawn'
      },
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    res.json({
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        amount: Math.abs(w.amount),
        dollar_amount: w.metadata?.dollar_amount,
        method: w.metadata?.method,
        status: w.status,
        created_at: w.created_at
      })),
      has_more: withdrawals.length === limit
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mobile money integration (example for MTN Mobile Money)
router.post('/mobile-money/request', auth, [
  body('phone_number').isMobilePhone(),
  body('amount').isInt({ min: 1000 }),
  body('provider').isIn(['mtn', 'airtel', 'vodafone'])
], async (req, res) => {
  try {
    const { phone_number, amount, provider } = req.body;
    const user = await User.findByPk(req.user.id);

    // In production, integrate with actual mobile money API
    // This is a mock implementation
    const mockResponse = {
      transaction_id: `MM${Date.now()}`,
      status: 'pending',
      message: 'Payment request sent to your phone'
    };

    // Create pending transaction
    const transaction = await PointsTransaction.create({
      user_id: req.user.id,
      amount,
      type: 'purchased',
      reason: `Mobile money purchase - ${provider}`,
      balance: user.points,
      status: 'pending',
      metadata: {
        provider,
        phone_number,
        transaction_id: mockResponse.transaction_id
      }
    });

    res.json({
      message: mockResponse.message,
      transaction_id: mockResponse.transaction_id,
      status: mockResponse.status
    });
  } catch (error) {
    console.error('Mobile money error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;