import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2023-10-16',
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, email, interval, returnUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // You will need to create these products/prices in your Stripe Dashboard
    // and put their Price IDs in your .env.local / Vercel Environment Variables
    const priceIdMap = {
      monthly: process.env.STRIPE_PRICE_MONTHLY,
      quarterly: process.env.STRIPE_PRICE_QUARTERLY,
      yearly: process.env.STRIPE_PRICE_YEARLY,
    };

    const priceId = priceIdMap[interval];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid interval or missing price ID configuration' }, { status: 400 });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: email, // Pre-fill the email if available
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId: userId, // Very important: this lets the webhook know WHICH user paid
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
