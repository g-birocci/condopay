const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApartamentoSchema = new Schema({
    numeroAp: { type: String, required: true },
    andar: { type: Number, required: true },
    pagamento: { type: Boolean, default: false },
    dataPagamento: { type: Date, default: Date.now },
}, {
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Apartamento', ApartamentoSchema);
