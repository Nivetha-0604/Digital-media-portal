const { Schema, model } = require('mongoose');
module.exports = model('Comment', new Schema({
  media: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true }
}, { timestamps: true }));
