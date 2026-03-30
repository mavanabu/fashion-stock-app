const router = require('express').Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

router.use(auth);

const TABLES = {
  brands: 'brands',
  seasons: 'seasons',
  stores: 'stores',
  collections: 'collections',
  payment_terms: 'payment_terms_options',
  transport_companies: 'transport_companies',
  weight_measurements: 'weight_measurements',
};

router.get('/:type', async (req, res) => {
  const table = TABLES[req.params.type];
  if (!table) return res.status(400).json({ error: 'Invalid type' });

  const { data, error } = await supabase
    .from(table)
    .select('id, name')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/:type', async (req, res) => {
  const table = TABLES[req.params.type];
  if (!table) return res.status(400).json({ error: 'Invalid type' });

  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const { data, error } = await supabase
    .from(table)
    .insert([{ name: name.trim() }])
    .select('id, name')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/:type/bulk', async (req, res) => {
  const table = TABLES[req.params.type];
  if (!table) return res.status(400).json({ error: 'Invalid type' });

  const { names } = req.body;
  if (!Array.isArray(names) || names.length === 0) return res.status(400).json({ error: 'Names array required' });

  const rows = [...new Set(names.map(n => n?.toString().trim()).filter(Boolean))].map(name => ({ name }));
  const { data, error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: 'name', ignoreDuplicates: true })
    .select('id, name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:type/:id', async (req, res) => {
  const table = TABLES[req.params.type];
  if (!table) return res.status(400).json({ error: 'Invalid type' });

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
