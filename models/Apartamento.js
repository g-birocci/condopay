const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApartamentoSchema = new Schema({
    numeroAp: { type: String, required: true },
    andar: { type: Number, required: true },
    pagamento: { type: Boolean, default: false },
    dataPagamento: { type: Date, default: null },
    dueDate: { type: Date }, // data de vencimento do boleto
    inquilino: {
        nome: { type: String },
        email: { type: String },
        telefone: { type: String },
    },
    history: [
        {
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now },
            note: { type: String }
        }
    ],
    lastNotified: { type: Date, default: null },
}, {
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Método de instância para registrar pagamento
ApartamentoSchema.methods.registerPayment = async function(amount, note) {
    this.history.push({ amount, note });
    this.pagamento = true;
    this.dataPagamento = new Date();
    await this.save();
    return this;
};

// Método de instância para registrar notificação
ApartamentoSchema.methods.registerNotification = async function() {
    this.lastNotified = new Date();
    await this.save();
    return this;
};

module.exports = mongoose.model('Apartamento', ApartamentoSchema);
