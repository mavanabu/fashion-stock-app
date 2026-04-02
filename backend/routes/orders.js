const router = require('express').Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

router.use(auth);

const SELECT = `
  *,
  brand:brands(id, name),
  season:seasons(id, name),
  store:stores(id, name),
  collection:collections(id, name),
  payment_term:payment_terms_options(id, name)
`;

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('delivery_orders')
    .select(SELECT)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { brand_id, season_id, store_id, collection_id, payment_terms_id, parts, total_order_value, total_order_quantity, total_order_value_status, deposit_payments_only, deposit_payment } = req.body;

  const { data, error } = await supabase
    .from('delivery_orders')
    .insert([{
      brand_id: brand_id || null,
      season_id: season_id || null,
      store_id: store_id || null,
      collection_id: collection_id || null,
      payment_terms_id: payment_terms_id || null,
      parts: parts || [],
      total_order_value: total_order_value || null,
      total_order_quantity: total_order_quantity || null,
      total_order_value_status: total_order_value_status || null,
      deposit_payments_only: deposit_payments_only || null,
      deposit_payment: deposit_payment || null,
    }])
    .select(SELECT)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/:id', async (req, res) => {
  const { brand_id, season_id, store_id, collection_id, payment_terms_id, parts, total_order_value, total_order_quantity, total_order_value_status, deposit_payments_only, deposit_payment } = req.body;

  const { data, error } = await supabase
    .from('delivery_orders')
    .update({
      brand_id: brand_id || null,
      season_id: season_id || null,
      store_id: store_id || null,
      collection_id: collection_id || null,
      payment_terms_id: payment_terms_id || null,
      parts: parts || [],
      total_order_value: total_order_value || null,
      total_order_quantity: total_order_quantity || null,
      total_order_value_status: total_order_value_status || null,
      deposit_payments_only: deposit_payments_only || null,
      deposit_payment: deposit_payment || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select(SELECT)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('delivery_orders')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
