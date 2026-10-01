const { Schema, model } = require('mongoose');
module.exports = model('Media', new Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: 'General' },
  tags: [String],
  type: { type: String, enum: ['video', 'audio', 'image'], required: true },
  fileUrl: { type: String, required: true },
  thumbnail: String,
  uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'approved' },
  views: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true }));
