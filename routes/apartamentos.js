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

module.exports = router;