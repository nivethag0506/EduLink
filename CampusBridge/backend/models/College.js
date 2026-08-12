const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  domain: { type: String, required: true, unique: true },
  logo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
