const mongoose = require('mongoose')
const ResidentSchema = new mongoose.Schema({
  name: String,
  unit: String,
  status: { type: String, enum: ['Paid', 'Overdue'], default: 'Paid' },
})
module.exports = mongoose.model('Resident', ResidentSchema)