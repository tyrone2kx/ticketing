import Stripe from 'stripe'

// export const stripe = new Stripe(
//     "sk_test_51KQFTWCnBQFhAut35ImqmED5Vp5lB6KWxJrc5ZmsmbhPCj1Gd3S6EabCEaB6yiKG2ImCPDJqFHSu8UgZpHWFRJiN00uYgAcJ5K",
//     {
//         apiVersion: '2020-08-27',
//     });

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: '2020-08-27',
});