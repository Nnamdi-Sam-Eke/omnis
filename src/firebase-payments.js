// functions/src/index.ts
import * as functions from "firebase-functions";
import Stripe from "stripe";

const stripe = new Stripe(functions.config().stripe.secret, { apiVersion: "2022-11-15" });

export const createCheckoutSession = functions.https.onCall(async (data, ctx) => {
  const { priceId } = data;  
  const session = await stripe.checkout.sessions.create({
    customer_email: ctx.auth?.token?.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
  });
  return { sessionId: session.id };
});

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    req.headers['stripe-signature'],
    functions.config().stripe.webhook_secret
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // lookup user by session.customer_email, then:
    await admin.firestore().doc(`users/${uid}`).update({
      "subscription.plan": session.metadata.priceId,
      "subscription.nextPaymentDate": new Date().toLocaleDateString()
    });
  }

  res.status(200).send();
});
export const getCustomerPortal = functions.https.onCall(async (data, ctx) => {
  const { customerId } = data;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: data.returnUrl,
  });
  return { url: session.url };
});
