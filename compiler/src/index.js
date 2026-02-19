// Cine-AI Prompt Compiler API - Entry Point
// TODO: Implement Express server
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// TODO: Add routes
// app.post('/compile', compilerRouter);
// app.post('/audit', auditRouter);

app.listen(PORT, () => console.log(`Compiler API running on port ${PORT}`));
