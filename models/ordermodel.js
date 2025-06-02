
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
  },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  paymentId: { type: String, required: true },
  receiptEmail: { type: String },
  shipping: {
    name: { type: String, required: true },
    country: { type: String, required: true },
  },
  status: { type: String, required: true },
});

const Order = mongoose.model('Order', orderSchema);
export default Order;