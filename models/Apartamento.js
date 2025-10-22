// models/Apartamento.js (versão aprimorada)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApartamentoSchema = new Schema({
  numeroAp: { type: String, required: true, unique: true },
  andar: { type: Number, required: true },
  pagamento: { type: Boolean, default: false },
  dataPagamento: { type: Date, default: null } // só define quando for pago
}, {
  timestamps: true
});

module.exports = mongoose.model('Apartamento', ApartamentoSchema);