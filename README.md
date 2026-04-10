# AgroLink

AgroLink connects farmers directly to buyers.

## Mandi Price API Setup
1. Register free at https://data.gov.in/user/register
2. Get your API key from your profile dashboard
3. Add it to .env.local as NEXT_PUBLIC_MANDI_API_KEY
4. Without a key the app still works — it uses fallback base prices

## Razorpay Setup
1. Create account at https://razorpay.com
2. Go to Dashboard → Settings → API Keys → Generate Key
3. Copy Key ID and Key Secret into .env.local as:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` (same as Key ID)
4. For testing, use Razorpay test mode keys
5. Test card: `4111 1111 1111 1111` | Any future expiry | Any CVV
