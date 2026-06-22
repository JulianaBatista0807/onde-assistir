const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['subscription', 'rent', 'buy'], default: 'subscription' },
  },
  { _id: false },
);

const titleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    originalTitle: { type: String, trim: true },
    type: { type: String, enum: ['movie', 'series'], required: true },
    year: { type: Number },
    genres: { type: [String], default: [] },
    synopsis: { type: String, trim: true },
    providers: { type: [providerSchema], default: [] },
  },
  { timestamps: true },
);

titleSchema.index({ title: 1 });
titleSchema.index({ type: 1 });
titleSchema.index({ title: 'text', originalTitle: 'text' });

const Title = mongoose.model('Title', titleSchema);

module.exports = { Title };
