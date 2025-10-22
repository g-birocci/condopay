const express = require('express');
const router = express.Router();
const Apartamento = require('../models/Apartamento');

// GET /api/apartamentos - lista todos
router.get('/', async (req, res) => {
  try {
    const items = await Apartamento.find().lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter apartamentos' });
  }
});

// GET /api/apartamentos/:id - detalhe
router.get('/:id', async (req, res) => {
  try {
    const item = await Apartamento.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Apartamento não encontrado' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter apartamento' });
  }
});

// POST /api/apartamentos/:id/notify - registra uma notificação (simulada)
router.post('/:id/notify', async (req, res) => {
  try {
    const apt = await Apartamento.findById(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Apartamento não encontrado' });
    await apt.registerNotification();
    // Aqui poderíamos integrar com serviço de envio (SMS/email). Por agora retornamos sucesso.
    res.json({ ok: true, lastNotified: apt.lastNotified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao notificar inquilino' });
  }
});

// POST /api/apartamentos/:id/pay - registrar pagamento (simulado)
router.post('/:id/pay', async (req, res) => {
  try {
    const { amount = 0, note = '' } = req.body || {};
    const apt = await Apartamento.findById(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Apartamento não encontrado' });
    await apt.registerPayment(amount, note);
    res.json({ ok: true, apartment: apt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
});

// GET /api/apartamentos/:id/history - retorna histórico de pagamentos
router.get('/:id/history', async (req, res) => {
  try {
    const apt = await Apartamento.findById(req.params.id).lean();
    if (!apt) return res.status(404).json({ error: 'Apartamento não encontrado' });
    res.json(apt.history || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter histórico' });
  }
});

module.exports = router;
