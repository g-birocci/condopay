
require('dotenv').config();
const express = require('express');
const next = require('next');
const connectDB = require('./lib/mongodb');

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

// Roteamento do Next.js
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
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();