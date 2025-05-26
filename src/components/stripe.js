require("dotenv").config(); // Load .env variables
const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());


// Load your Stripe secret key from environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // replace with your Stripe secret key

// Mock DB functions - replace with real implementations
async function getUserFromDb(userId) {
  return {
    id: userId,
    email: "user@example.com",
    stripeCustomerId: null, // or actual stored Stripe customer ID
  };
}

async function saveStripeCustomerId(userId, customerId) {
  console.log(`Saved Stripe customerId ${customerId} for user ${userId}`);
}

async function getStripeCustomerIdForUser(userId) {
  // You need to get the customerId from your DB for the given userId
  const user = await getUserFromDb(userId);
  return user.stripeCustomerId;
}

// POST endpoint to save payment method & billing info
app.post("/api/save-payment-method", async (req, res) => {
  const { userId, paymentMethodId, billingAddress } = req.body;
  if (!userId || !paymentMethodId || !billingAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await getUserFromDb(userId);
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        address: billingAddress,
      });
      customerId = customer.id;
      await saveStripeCustomerId(userId, customerId);
    } else {
      await stripe.customers.update(customerId, {
        address: billingAddress,
      });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({ success: true, customerId });
  } catch (error) {
    console.error("Error saving payment method:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET endpoint to get subscription info
app.get("/api/subscription-info", async (req, res) => {
  // You must have some auth middleware that sets req.user, or get userId from query/header/token
  const userId = req.user?.id || req.query.userId; // replace with your auth logic
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const customerId = await getStripeCustomerIdForUser(userId);

    if (!customerId) {
      return res.json(null);
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    if (!subscriptions.data.length) {
      return res.json(null);
    }

    const sub = subscriptions.data[0];
    res.json({
      planName: sub.items.data[0].price.nickname,
      status: sub.status,
      current_period_end: sub.current_period_end,
    });
  } catch (error) {
    console.error("Error fetching subscription info:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
