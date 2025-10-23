import { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import API from "@/services/api";

export default function Dashboard() {
  const [apartamentos, setApartamentos] = useState([]);
  const [selectedAp, setSelectedAp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("apartamentos");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadApartamentos();
  }, []);

  const loadApartamentos = async () => {
    try {
      const response = await API.get("/apartamentos");
      setApartamentos(response.data);
    } catch (error) {
      console.error("Erro ao carregar apartamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const pagar = async (ap) => {
    try {
      await API.post(`/apartamentos/${ap._id}/pay`, { amount: ap.valor || 0.01 });
      alert(`Pagamento confirmado para Ap ${ap.numeroAp}.`);
      await loadApartamentos();
    } catch {
      alert("Falha ao registrar pagamento.");
    }
  };

  const notificar = async (ap) => {
    try {
      await API.post(`/apartamentos/${ap._id}/notify`);
      alert(`E-mail enviado para ${ap.residenteEmail || "morador"} (Ap ${ap.numeroAp}).`);
    } catch {
      alert("Falha ao enviar notificação.");
    }
  };

  const criarApartamento = async (novo) => {
    try {
      await API.post("/apartamentos", novo);
      alert("Apartamento criado com sucesso!");
      await loadApartamentos();
      setShowAddModal(false);
    } catch {
      alert("Erro ao criar apartamento.");
    }
  };

  const editarApartamento = async (dados) => {
    try {
      const payload = {
        numeroAp: dados.numeroAp,
        andar: dados.andar,
        residenteNome: dados.residenteNome,
        residenteEmail: dados.residenteEmail,
        dueDate: new Date(dados.dueDate).toISOString(),
      };
      await API.put(`/apartamentos/${dados._id}`, payload);
      alert("Apartamento atualizado com sucesso!");
      await loadApartamentos();
      setSelectedAp(null);
    } catch (e) {
      console.error("Erro ao atualizar apartamento:", e);
      alert("Erro ao atualizar apartamento. Verifica a consola.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      <Head>
        <title>Dashboard • CondoPay</title>
      </Head>

      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-8 transition-all">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          <div className="grid grid-cols-12">
            <aside className="col-span-12 md:col-span-3 bg-gradient-to-b from-gray-100 to-gray-200 p-6 border-r">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🏢</span>
                <h1 className="font-semibold text-lg tracking-tight">Condo</h1>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setTab("apartamentos")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    tab === "apartamentos"
                      ? "bg-blue-600 text-white font-medium shadow-sm"
                      : "hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  🏠 Apartamentos
                </button>
                <button
                  onClick={() => setTab("relatorios")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    tab === "relatorios"
                      ? "bg-blue-600 text-white font-medium shadow-sm"
                      : "hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  📊 Relatórios
                </button>
              </div>
            </aside>

            <section className="col-span-12 md:col-span-9 bg-white">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold tracking-tight">
                  {tab === "apartamentos" ? "Apartamentos" : "Relatórios"}
                </h2>

                {tab === "apartamentos" && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow transition-all hover:scale-105"
                    title="Adicionar Apartamento"
                  >
                    <span className="text-2xl leading-none">＋</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {loading ? (
                  <p className="text-gray-500">Carregando...</p>
                ) : tab === "apartamentos" ? (
                  <ApartamentosGrid apartamentos={apartamentos} onSelect={setSelectedAp} />
                ) : (
                  <RelatorioSimples apartamentos={apartamentos} />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {showAddModal && (
        <Modal>
          <AddModal onClose={() => setShowAddModal(false)} onSave={criarApartamento} />
        </Modal>
      )}

      {selectedAp && (
        <Modal>
          <EditarModal
            apartamento={selectedAp}
            onClose={() => setSelectedAp(null)}
            onSave={editarApartamento}
            onPay={pagar}
            onNotify={notificar}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      {children}
    </div>
  );
}

function ApartamentosGrid({ apartamentos, onSelect }) {
  if (!apartamentos.length)
    return (
      <p className="text-center text-gray-500 py-6">
        Nenhum apartamento cadastrado ainda.
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {apartamentos.map((ap) => (
        <div
          key={ap._id}
          onClick={() => onSelect(ap)}
          className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">
                Apartamento {ap.numeroAp}
              </h3>
              <p className="text-sm text-gray-500">Andar {ap.andar}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                ap.pagamento
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {ap.pagamento ? "Pago" : "Pendente"}
            </span>
          </div>
          <p className="text-sm mt-3 text-gray-700">
            {ap.residenteNome || "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Vencimento: {new Date(ap.dueDate).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function AddModal({ onClose, onSave }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Novo Apartamento
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target));
          onSave(data);
        }}
        className="space-y-4"
      >
        <Input name="numeroAp" placeholder="Número" required />
        <Input name="andar" placeholder="Andar" required />
        <Input name="residenteNome" placeholder="Nome do Morador" />
        <Input name="residenteEmail" placeholder="Email" />
        <Input name="dueDate" type="date" />
        <div className="flex justify-end gap-2 pt-3">
          <Button secondary onClick={onClose}>Cancelar</Button>
          <Button primary type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  );
}

function EditarModal({ apartamento, onClose, onSave, onPay, onNotify }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Editar Apartamento
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target));
          onSave({ ...apartamento, ...data });
        }}
        className="space-y-4"
      >
        <Input name="numeroAp" defaultValue={apartamento.numeroAp} required />
        <Input name="andar" defaultValue={apartamento.andar} required />
        <Input name="residenteNome" defaultValue={apartamento.residenteNome} />
        <Input name="residenteEmail" defaultValue={apartamento.residenteEmail} />
        <Input
          name="dueDate"
          type="date"
          defaultValue={
            apartamento.dueDate
              ? new Date(apartamento.dueDate).toISOString().split("T")[0]
              : ""
          }
        />
        <div className="flex flex-wrap gap-2 pt-3">
          <Button primary type="submit">Salvar</Button>
          <Button success onClick={() => onPay(apartamento)}>Pago</Button>
          <Button warning onClick={() => onNotify(apartamento)}>Notificar</Button>
          <Button secondary onClick={onClose}>Fechar</Button>
        </div>
      </form>
    </div>
  );
}

function RelatorioSimples({ apartamentos }) {
  const pagos = apartamentos.filter((a) => a.pagamento).length;
  const pendentes = apartamentos.length - pagos;
  const total = apartamentos.length || 1;
  const pctPagos = ((pagos / total) * 100).toFixed(1);
  const pctPendentes = ((pendentes / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">
        Evolução de Pagamentos
      </h3>
      <Progress label={`Pagos (${pagos})`} color="green" percent={pctPagos} />
      <Progress label={`Pendentes (${pendentes})`} color="red" percent={pctPendentes} />
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
    />
  );
}

function Button({ children, primary, secondary, success, warning, ...rest }) {
  const base = "px-4 py-2 rounded-xl font-medium text-sm transition shadow-sm";
  const colors = primary
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : secondary
    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
    : success
    ? "bg-green-600 text-white hover:bg-green-700"
    : warning
    ? "bg-yellow-500 text-white hover:bg-yellow-600"
    : "";
  return (
    <button {...rest} className={`${base} ${colors}`}>
      {children}
    </button>
  );
}

function Progress({ label, color, percent }) {
  const barColor = color === "green" ? "bg-green-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-3 ${barColor} rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
