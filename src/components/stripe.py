import os
import stripe
from flask import Flask, request, jsonify, abort
from firebase_admin import credentials, firestore, initialize_app

# Initialize Flask app
app = Flask(__name__)

# Initialize Stripe with secret key from environment variables
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
if not stripe.api_key:
    raise ValueError("Stripe secret key not set in environment variables.")

# Initialize Firebase Admin SDK only if not already initialized
if not firestore._apps:
    cred = credentials.ApplicationDefault()  # or credentials.Certificate("path/to/serviceAccount.json")
    initialize_app(cred)

# Firestore client
db = firestore.client()

# -------------------------------
# Create Stripe Checkout Session
# -------------------------------
@app.route("/api/create-checkout-session", methods=["POST"])
def create_checkout():
    try:
        data = request.get_json()
        session = stripe.checkout.Session.create(
            customer_email=data["email"],
            line_items=[{"price": data["priceId"], "quantity": 1}],
            mode="subscription",
            metadata={"userId": data["userId"]},
            success_url="http://localhost:3000/success",
            cancel_url="https://localhost:3000/cancel",
        )
        return jsonify({"url": session.url})
    except Exception as e:
        print("❌ Error creating Stripe checkout session:", e)
        return jsonify({"error": str(e)}), 400

# -------------------------------
# Stripe Webhook Handler
# -------------------------------
@app.route("/api/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")
    endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

    if not endpoint_secret:
        raise ValueError("STRIPE_WEBHOOK_SECRET is not set in environment variables.")
    if not sig_header:
        print("❌ Missing Stripe-Signature header")
        return abort(400)

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        print("❌ Invalid payload:", e)
        return abort(400)
    except stripe.error.SignatureVerificationError as e:
        print("❌ Invalid signature:", e)
        return abort(400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["userId"]
        subscription_id = session["subscription"]
        customer_id = session["customer"]

        try:
            doc_ref = db.collection("users").document(user_id)
            doc_ref.update({
                "subscription": {
                    "plan": "Pro",
                    "status": "active",
                    "stripeCustomerId": customer_id,
                    "stripeSubscriptionId": subscription_id
                }
            })
            print(f"✅ Subscription updated for user {user_id}")
        except Exception as e:
            print(f"❌ Failed to update Firestore for user {user_id}:", e)
            return jsonify({"error": "Failed to update user subscription"}), 500

    return "", 200
