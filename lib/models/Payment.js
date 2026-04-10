import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  orderId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  farmerId:          { type: String, required: true, index: true },
  buyerId:           { type: String, required: true },
  buyerName:         { type: String, required: true },
  crop:              { type: String, required: true },
  quantity:          { type: Number, required: true },
  unit:              { type: String, required: true },
  amount:            { type: Number, required: true },
  currency:          { type: String, default: 'INR' },
  razorpayOrderId:   { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
  razorpaySignature: { type: String, required: true },
  status:            { type: String, enum: ['paid', 'refunded'], default: 'paid' },
  method:            { type: String, default: null },
  paidAt:            { type: Date, default: Date.now },
});

PaymentSchema.index({ farmerId: 1, paidAt: -1 });

export default mongoose.models.Payment ||
  mongoose.model('Payment', PaymentSchema);
