import { useState } from "react";

export default function ApEditorModal({ apartamento, onClose, onSave, onPay, onNotify }) {
  const [numeroAp, setNumeroAp] = useState(apartamento?.numeroAp || "");
  const [andar, setAndar] = useState(apartamento?.andar ?? "");
  const [residenteNome, setResidenteNome] = useState(apartamento?.residenteNome || "");
  const [residenteEmail, setResidenteEmail] = useState(apartamento?.residenteEmail || "");
  const [dueDate, setDueDate] = useState(() => {
    try {
      return apartamento?.dueDate ? new Date(apartamento.dueDate).toISOString().slice(0, 10) : "";
    } catch { return ""; }
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apartamento) return;
    setSaving(true);
    try {
      await onSave?.({
        _id: apartamento._id,
        numeroAp,
        andar: Number(andar),
        residenteNome,
        residenteEmail,
        dueDate,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Editar Apartamento {apartamento?.numeroAp}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Número</label>
            <input value={numeroAp} onChange={(e)=>setNumeroAp(e.target.value)} className="w-full p-2.5 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Andar</label>
            <input type="number" value={andar} onChange={(e)=>setAndar(e.target.value)} className="w-full p-2.5 border rounded-lg" required />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Morador</label>
          <input value={residenteNome} onChange={(e)=>setResidenteNome(e.target.value)} className="w-full p-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">E-mail</label>
          <input type="email" value={residenteEmail} onChange={(e)=>setResidenteEmail(e.target.value)} className="w-full p-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Vencimento</label>
          <input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} className="w-full p-2.5 border rounded-lg" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <button type="button" onClick={()=>onPay?.(apartamento)} className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white">Marcar como pago</button>
            <button type="button" onClick={()=>onNotify?.(apartamento)} className="px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white">Notificar</button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancelar</button>
            <button type="submit" disabled={saving} className={`px-4 py-2 rounded text-white ${saving? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{saving? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

