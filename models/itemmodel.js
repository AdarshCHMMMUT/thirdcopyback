import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema({
  id: {
    type: Number, required: true,unique: true
  },
  title: {type: String,required: true },
  slug: {type: String,required: true,unique: true},
  price: {type: Number,required: true},
  description: {type: String},
  category: {type: mongoose.Schema.Types.Mixed,default: {}},
  images: {type: [String],
    validate:
     {
      validator: function (val) {
        return val.length <= 3;
      },
      message: 'You can upload a maximum of 3 images.'
    }
  }
}, {
  timestamps: true, 
  collection: 'items'
});

const Item = mongoose.models.items || mongoose.model('items', itemSchema);
export default Item;
