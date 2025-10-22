
require('dotenv').config();
const express = require('express');
const next = require('next');
const connectDB = require('./lib/mongodb');
const { subscribeAdmin, subscribeUser, notifyUser } = require('./lib/events');
const Apartamento = require('./models/Apartamento');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const app = express();

// Middleware para processar JSON
app.use(express.json());

// Suas rotas da API vão aqui
// Exemplo:
// app.get('/api/exemplo', (req, res) => {
//   res.json({ mensagem: 'API funcionando!' });
// });

// Importar e registrar rotas da API
const apartamentosRouter = require('./router/apartamento');
app.use('/api/apartamentos', apartamentosRouter);

// SSE: Eventos em tempo real
app.get('/api/events', (req, res) => {
  const { role, email } = req.query;
  if (role === 'admin') return subscribeAdmin(res);
  if (!email) return res.status(400).json({ error: 'email obrigatório' });
  return subscribeUser(String(email).toLowerCase(), res);
});

// Roteamento do Next.js (deve ser o último)
app.use((req, res) => {
  return handle(req, res);
});

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  try {
    await connectDB();
    await nextApp.prepare();
    app.listen(PORT, () => {
      console.log(`Servidor Next.js + Express rodando em http://localhost:${PORT}`);
    });

    // Agendador simples: a cada 1h verifica vencimentos em 5 dias
    const runDueSoonCheck = async () => {
      try {
        const now = new Date();
        const in5 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        const items = await Apartamento.find({
          pagamento: false,
          dueDate: { $gte: now, $lte: in5 },
        }).lean();
        for (const ap of items) {
          // Evita spam se notificado nas últimas 20h
          const last = ap.lastNotified ? new Date(ap.lastNotified) : null;
          const twentyHrsAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);
          if (!last || last < twentyHrsAgo) {
            if (ap.residenteEmail) {
              notifyUser(String(ap.residenteEmail).toLowerCase(), 'boleto_due_soon', {
                apartamentoId: ap._id,
                numeroAp: ap.numeroAp,
                dueDate: ap.dueDate,
                message: 'Seu boleto vence em até 5 dias. Favor efetuar o pagamento caloteiro.'
              });
            }
            await Apartamento.updateOne({ _id: ap._id }, { $set: { lastNotified: new Date() } });
          }
        }
      } catch (e) {
        console.error('Erro no checker de vencimento:', e);
      }
    };
    // Executa ao iniciar e depois a cada 1h
    runDueSoonCheck();
    setInterval(runDueSoonCheck, 60 * 60 * 1000);
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
