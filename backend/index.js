require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/options', require('./routes/options'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Fashion Stock backend running on port ${PORT}`));
