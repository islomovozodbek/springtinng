import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2023-10-16',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'dummy_secret';

// We need the service role key to bypass RLS and update the user's tier
// Do NOT use the regular anon key here!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

export async function POST(req) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Retrieve the userId we passed in the metadata
        const userId = session.metadata.userId;

        if (userId) {
          console.log(`Checkout completed for user ${userId}. Upgrading tier...`);
          
          // Update the user's tier to 'pro'
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({ tier: 'pro' })
            .eq('id', userId);

          if (error) {
            console.error('Error updating profile to pro:', error);
          } else {
             console.log(`Successfully upgraded user ${userId} to Pro!`);
          }
        } else {
           console.warn('Checkout session completed, but no userId found in metadata.');
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Optional: Handle downgrading the user back to 'basic'
        // You would typically store the Stripe Customer ID in Supabase to link them up here.
        console.log('Subscription deleted', subscription.id);
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
