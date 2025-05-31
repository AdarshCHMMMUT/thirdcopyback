import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
