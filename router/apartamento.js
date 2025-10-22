const express = require('express');
const router = express.Router();
const Apartamento = require('../models/Apartamento');

// GET /api/apartamentos - Lista todos os apartamentos
router.get('/', async (req, res) => {
  try {
    const apartamentos = await Apartamento.find().sort({ andar: 1, numeroAp: 1 });
    res.json(apartamentos);
  } catch (error) {
    console.error('Erro ao listar apartamentos:', error);
    res.status(500).json({ error: 'Erro ao listar apartamentos' });
  }
});

// GET /api/apartamentos/:id - Obtém detalhes de um apartamento
router.get('/:id', async (req, res) => {
  try {
    const apartamento = await Apartamento.findById(req.params.id);
    if (!apartamento) {
      return res.status(404).json({ error: 'Apartamento não encontrado' });
    }
    res.json(apartamento);
  } catch (error) {
    console.error('Erro ao buscar apartamento:', error);
    res.status(500).json({ error: 'Erro ao buscar apartamento' });
  }
});

// POST /api/apartamentos - Cria novo apartamento
router.post('/', async (req, res) => {
  try {
    const { numeroAp, andar, pagamento = false } = req.body;

    if (!numeroAp || andar === undefined) {
      return res.status(400).json({ error: 'Número do apartamento e andar são obrigatórios' });
    }

    const novoApartamento = new Apartamento({
      numeroAp,
      andar: Number(andar),
      pagamento,
      dataPagamento: pagamento ? new Date() : null,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)) // Vence em 30 dias
    });

    await novoApartamento.save();
    res.status(201).json(novoApartamento);
  } catch (error) {
    console.error('Erro ao criar apartamento:', error);
    res.status(500).json({ error: 'Erro ao criar apartamento' });
  }
});

// POST /api/apartamentos/:id/notify - Notifica o morador
router.post('/:id/notify', async (req, res) => {
  try {
    const apartamento = await Apartamento.findById(req.params.id);
    if (!apartamento) {
      return res.status(404).json({ error: 'Apartamento não encontrado' });
    }

    apartamento.lastNotified = new Date();
    await apartamento.save();

    res.json({ message: 'Notificação enviada', lastNotified: apartamento.lastNotified });
  } catch (error) {
    console.error('Erro ao notificar:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

// POST /api/apartamentos/:id/pay - Registra pagamento
router.post('/:id/pay', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor do pagamento é obrigatório e deve ser positivo' });
    }

    const apartamento = await Apartamento.findById(req.params.id);
    if (!apartamento) {
      return res.status(404).json({ error: 'Apartamento não encontrado' });
    }

    // Registra o pagamento
    apartamento.pagamento = true;
    apartamento.dataPagamento = new Date();
    apartamento.history.push({
      amount,
      date: new Date(),
      note: 'Pagamento registrado'
    });

    await apartamento.save();
    res.json(apartamento);
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
});

module.exports = router;