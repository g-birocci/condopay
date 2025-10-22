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

// GET /api/apartamentos/pagos - lista apartamentos pagos
router.get('/pagos', async (req, res) => {
  try {
    const items = await Apartamento.find({ pago: true }).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter apartamentos pagos' });
  }
});

// GET /api/apartamentos/nao-pagos - lista apartamentos não pagos
router.get('/nao-pagos', async (req, res) => {
  try {
    const items = await Apartamento.find({ pago: false }).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter apartamentos não pagos' });
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

module.exports = router;