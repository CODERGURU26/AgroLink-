import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get('farmerId');

    if (!farmerId) {
      return NextResponse.json({ success: false, error: 'farmerId is required' }, { status: 400 });
    }

    const payments = await Payment.find({ farmerId })
      .sort({ paidAt: -1 })
      .lean();

    const totalReceived = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = 0; // Reserved for future escrow logic

    return NextResponse.json({
      success: true,
      data: { payments, totalReceived, pendingAmount },
    });
  } catch (err) {
    console.error('[farmer/payments]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
