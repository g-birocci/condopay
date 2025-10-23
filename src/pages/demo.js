import { useState } from 'react';
import Head from 'next/head';
import { demoApartamentos, simularNotificacao, getApartamentosEmAberto, getApartamentosPagos } from '../../demo-data';

export default function DemoPage() {
  const [apartamentos, setApartamentos] = useState(demoApartamentos);
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleNotify = (ap) => {
    if (ap.pagamento) {
      alert('Este apartamento já foi pago! Não é possível notificar.');
      return;
    }

    const result = simularNotificacao(ap);
    
    // Adiciona notificação à lista
    const newNotification = {
      id: Date.now(),
      apartamento: ap,
      timestamp: new Date(),
      message: result.message
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Mantém apenas 5 notificações
    
    // Simula atualização do lastNotified
    setApartamentos(prev => 
      prev.map(a => 
        a._id === ap._id 
          ? { ...a, lastNotified: new Date() }
          : a
      )
    );
  };

  const filteredApartamentos = showOnlyUnpaid 
    ? apartamentos.filter(ap => !ap.pagamento)
    : apartamentos;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Head>
        <title>Demo - Sistema de Notificações • CondoPay</title>
      </Head>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎭 Demonstração do Sistema
              </h1>
              <p className="text-gray-600 mt-2">Teste o sistema de notificações para apartamentos com boleto em aberto</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOnlyUnpaid(!showOnlyUnpaid)}
                className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
                  showOnlyUnpaid
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {showOnlyUnpaid ? "Mostrar Todos" : "Apenas Não Pagos"}
              </button>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Total de Apartamentos</div>
                <div className="text-2xl font-bold text-blue-600">{apartamentos.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Notificações Recentes */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🔔</span>
              Notificações Enviadas Recentemente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notifications.map(notif => (
                <div key={notif.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-green-600 text-xl">✅</span>
                    <div className="text-sm font-medium text-green-800">
                      Ap {notif.apartamento.numeroAp}
                    </div>
                  </div>
                  <div className="text-sm text-green-700 mb-2">
                    {notif.apartamento.residenteNome}
                  </div>
                  <div className="text-xs text-green-600">
                    {notif.timestamp.toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {getApartamentosEmAberto().length}
                </div>
                <div className="text-sm text-gray-600">Em Aberto</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {getApartamentosPagos().length}
                </div>
                <div className="text-sm text-gray-600">Pagos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">🔔</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.length}
                </div>
                <div className="text-sm text-gray-600">Notificações</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Apartamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApartamentos.map((ap) => (
            <div
              key={ap._id}
              className="bg-white/80 backdrop-blur-md border border-white/20 rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">🏠</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        Ap {ap.numeroAp}
                      </h3>
                      <p className="text-sm text-gray-500">Andar {ap.andar}</p>
                    </div>
                  </div>
                  
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ap.pagamento
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {ap.pagamento ? "✅ Pago" : "⚠️ Pendente"}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">👤</span>
                    <span className="text-sm text-gray-700">
                      {ap.residenteNome}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📧</span>
                    <span className="text-sm text-gray-700">
                      {ap.residenteEmail}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📅</span>
                    <span className="text-sm text-gray-700">
                      Vence em {ap.dueDate.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">💰</span>
                    <span className="text-sm font-semibold text-blue-600">
                      R$ {ap.valor.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {!ap.pagamento ? (
                  <div className="mt-6">
                    <button
                      onClick={() => handleNotify(ap)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <span>🔔</span>
                      Notificar Morador
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <div className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                      <span>✅</span>
                      Boleto Pago - Sem Notificação
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instruções */}
        <div className="mt-12 bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📋</span>
            Como Funciona a Demonstração
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">✅ Apartamentos Pagos</h3>
              <p className="text-sm text-gray-600 mb-4">
                Apartamentos com status "Pago" não possuem botão de notificação, pois não há necessidade de cobrança.
              </p>
              
              <h3 className="font-semibold text-gray-800 mb-2">⚠️ Apartamentos em Aberto</h3>
              <p className="text-sm text-gray-600">
                Apartamentos com status "Pendente" possuem o botão "Notificar Morador" para enviar lembretes de pagamento.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🔔 Sistema de Notificações</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ao clicar em "Notificar Morador", o sistema simula o envio de uma notificação para o e-mail do morador.
              </p>
              
              <h3 className="font-semibold text-gray-800 mb-2">📊 Filtros</h3>
              <p className="text-sm text-gray-600">
                Use o botão "Apenas Não Pagos" para visualizar somente apartamentos que precisam de notificação.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
