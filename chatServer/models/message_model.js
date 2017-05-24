var mongoose = require('mongoose')
var Schema = mongoose.Schema

// createing the Model Schema
var messageSchema = new Schema({
  msg: { type: String},
  from: { type: String, required: true},
  to: { type: String, required: true},
  created_at: { type: Date, default: Date.now }
})

// createing the Model
module.exports = mongoose.model('Message', messageSchema)
