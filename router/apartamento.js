const express = require('express');
const router = express.Router();
const Apartamento = require('../models/Apartamento');
const { notifyAdmins, notifyUser } = require('../lib/events');

// GET /api/apartamentos - Lista todos os apartamentos
router.get('/', async (_req, res) => {
  try {
    const apartamentos = await Apartamento.find().sort({ andar: 1, numeroAp: 1 });
    res.json(apartamentos);
  } catch (error) {
    console.error('Erro ao listar apartamentos:', error);
    res.status(500).json({ error: 'Erro ao listar apartamentos' });
  }
});

// GET /api/apartamentos/find?numeroAp=101&email=foo@bar.com
// Busca um apartamento por número e email do morador (case-insensitive)
router.get('/find', async (req, res) => {
  try {
    const { numeroAp, email } = req.query;
    if (!numeroAp || !email) {
      return res.status(400).json({ error: 'numeroAp e email são obrigatórios' });
    }
    const item = await Apartamento.findOne({
      numeroAp: String(numeroAp).trim(),
      residenteEmail: String(email).trim().toLowerCase(),
    }).lean();
    if (!item) return res.status(404).json({ error: 'Apartamento não encontrado' });
    res.json(item);
  } catch (error) {
    console.error('Erro ao buscar por numero/email:', error);
    res.status(500).json({ error: 'Erro ao buscar apartamento' });
  }
});

// GET /api/apartamentos/pagos - apartamentos com pagamento true
router.get('/pagos', async (_req, res) => {
  try {
    const itens = await Apartamento.find({ pagamento: true }).lean();
    res.json(itens);
  } catch (error) {
    console.error('Erro ao listar pagos:', error);
    res.status(500).json({ error: 'Erro ao listar apartamentos pagos' });
  }
});

// GET /api/apartamentos/pendentes - apartamentos com pagamento false
router.get('/pendentes', async (_req, res) => {
  try {
    const itens = await Apartamento.find({ pagamento: false }).lean();
    res.json(itens);
  } catch (error) {
    console.error('Erro ao listar pendentes:', error);
    res.status(500).json({ error: 'Erro ao listar apartamentos pendentes' });
  }
});

// GET /api/apartamentos/a-vencer - não pagos que vencem em até 5 dias
router.get('/a-vencer', async (_req, res) => {
  try {
    const now = new Date();
    const in5 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const itens = await Apartamento.find({ pagamento: false, dueDate: { $gte: now, $lte: in5 } })
      .sort({ dueDate: 1 })
      .lean();
    res.json(itens);
  } catch (error) {
    console.error('Erro ao listar a vencer:', error);
    res.status(500).json({ error: 'Erro ao listar boletos a vencer' });
  }
});

// GET /api/apartamentos/:id - Detalhe
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
    const {
      numeroAp,
      andar,
      pagamento = false,
      residenteNome = '',
      residenteEmail = '',
      valor = 0,
      dueDate,
    } = req.body;

    // Validação simples para evitar 500 por dados inválidos
    const numeroApStr = String(numeroAp || '').trim();
    const andarNum = Number(andar);
    if (!numeroApStr) {
      return res.status(400).json({ error: 'numeroAp obrigatório' });
    }
    if (!Number.isFinite(andarNum)) {
      return res.status(400).json({ error: 'andar deve ser número' });
    }

    if (!numeroAp || andar === undefined) {
      return res.status(400).json({ error: 'Número do apartamento e andar são obrigatórios' });
    }

    const novoApartamento = new Apartamento({
      numeroAp,
      andar: Number(andar),
      pagamento,
      dataPagamento: pagamento ? new Date() : null,
      residenteNome,
      residenteEmail: String(residenteEmail).toLowerCase(),
      valor: Number(valor) || 0,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await novoApartamento.save();
    res.status(201).json(novoApartamento);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'numeroAp já cadastrado' });
    }
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.message });
    }
    console.error('Erro ao criar apartamento:', error);
    res.status(500).json({ error: 'Erro ao criar apartamento' });
  }
});

// PUT /api/apartamentos/:id - Atualiza campos do apartamento
router.put('/:id', async (req, res) => {
  try {
    const allowed = [
      'numeroAp',
      'andar',
      'residenteNome',
      'residenteEmail',
      'valor',
      'dueDate',
      'pagamento',
    ];

    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    if (payload.andar !== undefined) {
      const n = Number(payload.andar);
      if (!Number.isFinite(n)) {
        return res.status(400).json({ error: 'andar deve ser número' });
      }
      payload.andar = n;
    }

    if (payload.valor !== undefined) {
      const v = Number(payload.valor);
      if (!Number.isFinite(v)) {
        return res.status(400).json({ error: 'valor deve ser número' });
      }
      payload.valor = v;
    }

    if (payload.residenteEmail !== undefined) {
      payload.residenteEmail = String(payload.residenteEmail).trim().toLowerCase();
    }

    if (payload.dueDate !== undefined) {
      const d = new Date(payload.dueDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: 'dueDate inválida' });
      }
      payload.dueDate = d;
    }

    const updated = await Apartamento.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Apartamento não encontrado' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar apartamento:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'numeroAp já cadastrado' });
    }
    return res.status(500).json({ error: 'Erro ao atualizar apartamento' });
  }
});

// GET /api/apartamentos/pendentes/list - Vencidos e não pagos
router.get('/pendentes/list', async (_req, res) => {
  try {
    const now = new Date();
    const items = await Apartamento.find({ pagamento: false, dueDate: { $lt: now } })
      .sort({ dueDate: 1 })
      .lean();
    res.json(items);
  } catch (error) {
    console.error('Erro ao listar pendentes:', error);
    res.status(500).json({ error: 'Erro ao listar boletos pendentes' });
  }
});

// GET /api/apartamentos/vencendo/list - Vence em até 5 dias e não pago
router.get('/vencendo/list', async (_req, res) => {
  try {
    const now = new Date();
    const in5 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const items = await Apartamento.find({ pagamento: false, dueDate: { $gte: now, $lte: in5 } })
      .sort({ dueDate: 1 })
      .lean();
    res.json(items);
  } catch (error) {
    console.error('Erro ao listar boletos a vencer:', error);
    res.status(500).json({ error: 'Erro ao listar boletos a vencer' });
  }
});

// POST /api/apartamentos/:id/notify - Notifica o morador (manual pelo admin)
router.post('/:id/notify', async (req, res) => {
  try {
    const apartamento = await Apartamento.findById(req.params.id);
    if (!apartamento) {
      return res.status(404).json({ error: 'Apartamento não encontrado' });
    }

    apartamento.lastNotified = new Date();
    await apartamento.save();

    if (apartamento.residenteEmail) {
      notifyUser(String(apartamento.residenteEmail).toLowerCase(), 'boleto_alert', {
        apartamentoId: apartamento._id,
        numeroAp: apartamento.numeroAp,
        dueDate: apartamento.dueDate,
        message: 'Seu boleto está em atraso. Por favor, efetue o pagamento.'
      });
    }

    res.json({ message: 'Notificação enviada', lastNotified: apartamento.lastNotified });
  } catch (error) {
    console.error('Erro ao notificar:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

// POST /api/apartamentos/:id/pay - Registra pagamento (simulação do usuário)
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

    apartamento.pagamento = true;
    apartamento.dataPagamento = new Date();
    apartamento.history.push({ amount, date: new Date(), note: 'Pagamento registrado' });

    await apartamento.save();

    notifyAdmins('payment_confirmed', {
      apartamentoId: apartamento._id,
      numeroAp: apartamento.numeroAp,
      amount,
      dataPagamento: apartamento.dataPagamento,
    });

    res.json(apartamento);
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
});

module.exports = router;

