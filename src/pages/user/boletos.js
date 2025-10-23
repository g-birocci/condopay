import { useEffect, useState } from 'react';
import Head from 'next/head';
import API from '@/services/api';
import UserNavBar from '@/components/UserNavBar';

export default function UserBoletos() {
  const [ap, setAp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notices, setNotices] = useState([]);

  const [apId, setApId] = useState(null);
  const [apNumero, setApNumero] = useState('');
  const [apEmail, setApEmail] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setApId(localStorage.getItem('userApId'));
    setApNumero(localStorage.getItem('userApNumero') || '');
    setApEmail(localStorage.getItem('userApEmail') || '');
  }, []);

  const load = async () => {
    setError('');
    
    // Tenta carregar dados do localStorage primeiro
    const savedData = typeof window !== 'undefined' ? localStorage.getItem('userApData') : null;
    if (savedData) {
      try {
        const apData = JSON.parse(savedData);
        setAp(apData);
        setApId(apData._id);
        setApNumero(apData.numeroAp);
        setApEmail(apData.residenteEmail);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
    
    if (!apId) {
      // Fallback de demo: pega o primeiro apartamento disponível
      try {
        const { data } = await API.get('/apartamentos');
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('userApId', data[0]._id);
          localStorage.setItem('userApNumero', data[0].numeroAp || '');
          setApId(data[0]._id);
          setApNumero(data[0].numeroAp || '');
        } else {
          // Usa dados de demonstração se não houver dados reais
          const { demoApartamentos } = await import('../../../demo-data');
          if (demoApartamentos.length > 0) {
            const demoAp = demoApartamentos[0];
            localStorage.setItem('userApId', demoAp._id);
            localStorage.setItem('userApNumero', demoAp.numeroAp);
            localStorage.setItem('userApData', JSON.stringify(demoAp));
            setApId(demoAp._id);
            setApNumero(demoAp.numeroAp);
            setAp(demoAp);
            setLoading(false);
            return;
          }
          setError('Nenhum apartamento cadastrado para demo. Crie um no admin.');
          setLoading(false);
          return;
        }
      } catch (e) {
        // Se falhar, usa dados de demonstração
        try {
          const { demoApartamentos } = await import('../../../demo-data');
          if (demoApartamentos.length > 0) {
            const demoAp = demoApartamentos[0];
            localStorage.setItem('userApId', demoAp._id);
            localStorage.setItem('userApNumero', demoAp.numeroAp);
            localStorage.setItem('userApData', JSON.stringify(demoAp));
            setApId(demoAp._id);
            setApNumero(demoAp.numeroAp);
            setAp(demoAp);
            setLoading(false);
            return;
          }
        } catch (importError) {
          console.error('Erro ao importar dados de demo:', importError);
        }
        setError('Falha ao localizar apartamento para demo.');
        setLoading(false);
        return;
      }
    }
    
    try {
      const id = apId || (typeof window !== 'undefined' ? localStorage.getItem('userApId') : null);
      const { data } = await API.get(`/apartamentos/${id}`);
      setAp(data);
    } catch (e) {
      setError('Falha ao carregar boletos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (apId !== null) { load(); } }, [apId]);

  // SSE: escuta notificações do admin e recibos de pagamento
  useEffect(() => {
    if (!apEmail) return; // precisa do email
    
    const es = new EventSource(`/api/events?role=user&email=${encodeURIComponent(apEmail)}`);
    
    const addNotice = (msg, type = 'info') => {
      const newNotice = { 
        id: Date.now() + Math.random(), 
        msg, 
        type,
        timestamp: new Date()
      };
      setNotices((arr) => [newNotice, ...arr].slice(0, 5));
      
      // Mostra notificação visual no topo da tela
      showNotification(newNotice);
    };

    const showNotification = (notice) => {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 transform translate-x-full transition-transform duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔔</span>
          <div>
            <div class="font-semibold">Nova Notificação!</div>
            <div class="text-sm opacity-90">${notice.msg}</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Anima a notificação
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      // Remove após 5 segundos
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 5000);
    };

    const onAlert = (e) => {
      try { 
        const data = JSON.parse(e.data); 
        addNotice(`🔔 Lembrete: Seu boleto do Ap ${data.numeroAp} está pendente!`, 'warning'); 
      } catch {}
    };
    
    const onDueSoon = (e) => {
      try { 
        const data = JSON.parse(e.data); 
        addNotice(`⚠️ Atenção: Seu boleto vence em breve (Ap ${data.numeroAp})`, 'warning'); 
      } catch {}
    };
    
    const onReceipt = (e) => {
      try { 
        const data = JSON.parse(e.data); 
        addNotice(`✅ Pagamento confirmado! Valor R$ ${Number(data.amount||0).toFixed(2)}`, 'success'); 
      } catch {}
    };

    es.addEventListener('boleto_alert', onAlert);
    es.addEventListener('boleto_due_soon', onDueSoon);
    es.addEventListener('payment_receipt', onReceipt);
    es.addEventListener('error', () => {});
    
    return () => {
      es.removeEventListener('boleto_alert', onAlert);
      es.removeEventListener('boleto_due_soon', onDueSoon);
      es.removeEventListener('payment_receipt', onReceipt);
      es.close();
    };
  }, [apEmail]);

  const pagar = async () => {
    if (!ap?._id) return;
    try {
      await API.post(`/apartamentos/${ap._id}/pay`, { amount: ap.valor || 0.01 });
      alert('Pagamento confirmado!');
      await load();
    } catch (e) {
      alert('Falha ao efetuar pagamento.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Head>
        <title>Meus Boletos • CondoPay</title>
      </Head>
      <UserNavBar apLabel={apNumero ? `Ap ${apNumero}` : 'Meu Apartamento'} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Meus Boletos
          </h1>
          <p className="text-gray-600">Gerencie seus pagamentos de condomínio</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {notices.map(n => (
          <div key={n.id} className={`mb-4 p-4 rounded-2xl flex items-center gap-3 shadow-sm ${
            n.type === 'warning' 
              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-800'
              : n.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800'
          }`}>
            <span className={`text-xl ${
              n.type === 'warning' ? 'text-yellow-600' : 
              n.type === 'success' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {n.type === 'warning' ? '🔔' : n.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <div className="flex-1">
              <span className="text-sm font-medium">{n.msg}</span>
              <div className="text-xs opacity-75 mt-1">
                {n.timestamp.toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-gray-600">Carregando seus boletos...</span>
            </div>
          </div>
        )}

        {ap && (
          <div className="space-y-8">
            {/* Main Boleto Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10"></div>
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full opacity-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">🏠</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Apartamento {ap.numeroAp}</h2>
                      <p className="text-gray-600">Condomínio Mensal</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Vencimento</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {new Date(ap.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Valor Total</div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        R$ {(ap.valor || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {ap.pagamento ? (
                      <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border border-green-200">
                        <span className="text-green-600 text-2xl">✅</span>
                        <div>
                          <div className="text-green-800 font-semibold">Pago</div>
                          <div className="text-green-600 text-sm">Pagamento confirmado</div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={pagar} 
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-2xl hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl transition-all duration-200 transform active:scale-95 flex items-center gap-3"
                      >
                        <span>💳</span>
                        Pagar Agora
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* History Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-600 text-xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Histórico de Pagamentos</h2>
              </div>
              
              {(!ap.history || ap.history.length === 0) ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-400 text-3xl">📝</span>
                  </div>
                  <p className="text-gray-500 text-lg">Nenhum pagamento registrado ainda</p>
                  <p className="text-gray-400 text-sm mt-2">Seus pagamentos aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ap.history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <span className="text-green-600">✅</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {new Date(h.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-sm text-gray-500">{h.note || 'Pagamento de condomínio'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-lg">
                          R$ {typeof h.amount === 'number' ? h.amount.toFixed(2) : h.amount}
                        </div>
                        <div className="text-xs text-gray-500">Confirmado</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
