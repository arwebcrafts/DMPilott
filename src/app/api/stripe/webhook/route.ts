import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
// @ts-ignore
import Stripe from 'stripe'

export async function POST(request: Request) {
  // @ts-ignore
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  // @ts-ignore
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Stripe webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      // @ts-ignore
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan as 'creator' | 'pro'

      if (userId && plan) {
        // Create subscription record
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: session.subscription,
          stripe_price_id: session.line_items?.data[0]?.price?.id,
          plan,
          status: 'trialing',
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })

        // Update user plan
        await supabase
          .from('users')
          .update({ plan })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      // @ts-ignore
      const sub = event.data.object as Stripe.Subscription & {
        current_period_start?: number
        current_period_end?: number
      }
      const userId = sub.metadata?.userId
      const plan = sub.metadata?.plan as 'creator' | 'pro'

      if (userId) {
        await supabase.from('subscriptions').update({
          status: sub.status,
          plan,
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
        }).eq('user_id', userId)

        if (sub.status === 'active' && plan) {
          await supabase.from('users').update({ plan }).eq('id', userId)
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      // @ts-ignore
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId

      if (userId) {
        await supabase.from('subscriptions').update({ status: 'canceled' }).eq('user_id', userId)
        await supabase.from('users').update({ plan: 'free' }).eq('id', userId)
      }
      break
    }

    case 'invoice.payment_failed': {
      // @ts-ignore
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        await supabase.from('subscriptions').update({ status: 'past_due' }).eq('user_id', user.id)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      // @ts-ignore
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        await supabase.from('subscriptions').update({ status: 'active' }).eq('user_id', user.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
