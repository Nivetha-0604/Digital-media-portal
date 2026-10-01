const { Schema, model } = require('mongoose');
module.exports = model('User', new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['viewer', 'creator', 'admin'], default: 'viewer' },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Media' }]
}, { timestamps: true }));
