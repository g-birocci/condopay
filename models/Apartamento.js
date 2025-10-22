import mongoose, { Schema } from "mongoose";

const ApartamentoSchema = new Schema({
    numeroAp: { type: String, required: true },
    andar: { type: Number, required: true },
    pagamento: { type: Boolean, default: false },
    dataPagamento: { type: Date, default: Date.now },
});

export default mongoose.model('Apartamento', ApartamentoSchema);

