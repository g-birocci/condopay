// models/Apartamento.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PagamentoSchema = new Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const ApartamentoSchema = new Schema(
  {
    // Identificação do apartamento
    numeroAp: { type: String, required: true, unique: true },
    andar: { type: Number, required: true },

    // Morador
    residenteNome: { type: String, default: '' },
    residenteEmail: { type: String, index: true, default: '' },

    // Cobrança atual
    valor: { type: Number, default: 0 },
    dueDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    pagamento: { type: Boolean, default: false },
    dataPagamento: { type: Date, default: null },

    // Notificações
    lastNotified: { type: Date, default: null },

    // Histórico de pagamentos
    history: { type: [PagamentoSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Apartamento', ApartamentoSchema);

