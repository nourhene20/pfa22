const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  candidateId: String,
  videopath: String,
  filepath: String,
  dateUpload: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', FileSchema);