// Dados fake para demonstração do sistema de notificações
// Este arquivo contém apartamentos simulados para testar o sistema

export const demoApartamentos = [
  {
    _id: "demo_ap_101",
    numeroAp: "101",
    andar: "1",
    residenteNome: "João Silva",
    residenteEmail: "joao.silva@email.com",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias no futuro
    valor: 450.00,
    pagamento: false, // Boleto em aberto - pode notificar
    lastNotified: null
  },
  {
    _id: "demo_ap_205",
    numeroAp: "205", 
    andar: "2",
    residenteNome: "Maria Santos",
    residenteEmail: "maria.santos@email.com",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrasado
    valor: 480.00,
    pagamento: false, // Boleto em aberto - pode notificar
    lastNotified: null
  },
  {
    _id: "demo_ap_310",
    numeroAp: "310",
    andar: "3", 
    residenteNome: "Pedro Costa",
    residenteEmail: "pedro.costa@email.com",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias no futuro
    valor: 520.00,
    pagamento: true, // Já pago - NÃO pode notificar
    lastNotified: null
  },
  {
    _id: "demo_ap_412",
    numeroAp: "412",
    andar: "4",
    residenteNome: "Ana Oliveira", 
    residenteEmail: "ana.oliveira@email.com",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrasado
    valor: 460.00,
    pagamento: false, // Boleto em aberto - pode notificar
    lastNotified: null
  },
  {
    _id: "demo_ap_501",
    numeroAp: "501",
    andar: "5",
    residenteNome: "Carlos Ferreira",
    residenteEmail: "carlos.ferreira@email.com", 
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias no futuro
    valor: 500.00,
    pagamento: true, // Já pago - NÃO pode notificar
    lastNotified: null
  }
];

// Função para simular notificação
export const simularNotificacao = (apartamento) => {
  console.log(`🔔 NOTIFICAÇÃO SIMULADA:`);
  console.log(`📧 Para: ${apartamento.residenteEmail}`);
  console.log(`🏠 Apartamento: ${apartamento.numeroAp}`);
  console.log(`👤 Morador: ${apartamento.residenteNome}`);
  console.log(`💰 Valor: R$ ${apartamento.valor.toFixed(2)}`);
  console.log(`📅 Vencimento: ${apartamento.dueDate.toLocaleDateString('pt-BR')}`);
  console.log(`⚠️ Status: ${apartamento.pagamento ? 'PAGO' : 'PENDENTE'}`);
  console.log('---');
  
  return {
    success: true,
    message: `Notificação enviada para ${apartamento.residenteNome} (Ap ${apartamento.numeroAp})`,
    timestamp: new Date().toISOString()
  };
};

// Função para filtrar apenas apartamentos com boleto em aberto
export const getApartamentosEmAberto = () => {
  return demoApartamentos.filter(ap => !ap.pagamento);
};

// Função para filtrar apenas apartamentos pagos
export const getApartamentosPagos = () => {
  return demoApartamentos.filter(ap => ap.pagamento);
};
