const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { Person, connectIfNeeded } = require('./models/person');

const app = express();
app.use(express.json());
app.use(cors());
morgan.token('body', (req) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) return '';
    return JSON.stringify(req.body);
  } catch (_) {
    return '';
  }
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// Serve frontend build (if present)
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

const persons = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' },
];

app.get('/', (req, res) => {
  const indexHtml = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.send('Phonebook backend is running. Try /api/persons or /info');
});

app.get('/api/persons', async (req, res, next) => {
  try {
    await connectIfNeeded();
    const all = await Person.find({});
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// Legacy/alias routes without /api prefix for older frontends
app.get('/persons', async (req, res, next) => {
  try {
    await connectIfNeeded();
    const all = await Person.find({});
    res.json(all);
  } catch (err) {
    next(err);
  }
});

app.get('/api/persons/:id', async (req, res, next) => {
  try {
    await connectIfNeeded();
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ error: 'Person not found' });
    res.json(person);
  } catch (err) {
    next(err);
  }
});

app.get('/persons/:id', async (req, res, next) => {
  try {
    await connectIfNeeded();
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ error: 'Person not found' });
    res.json(person);
  } catch (err) {
    next(err);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  try {
    const { number } = req.body || {};
    await connectIfNeeded();
    const updated = await Person.findByIdAndUpdate(
      req.params.id,
      { number },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Person not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.put('/persons/:id', async (req, res, next) => {
  try {
    const { number } = req.body || {};
    await connectIfNeeded();
    const updated = await Person.findByIdAndUpdate(
      req.params.id,
      { number },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Person not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await connectIfNeeded();
    const deleted = await Person.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Person not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.delete('/persons/:id', async (req, res, next) => {
  try {
    await connectIfNeeded();
    const deleted = await Person.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Person not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.post('/api/persons', async (req, res, next) => {
  try {
    const { name, number } = req.body || {};
    if (!name || !number) {
      return res.status(400).json({ error: 'name and number are required' });
    }
    await connectIfNeeded();
    const person = new Person({ name, number });
    const saved = await person.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

app.post('/persons', async (req, res, next) => {
  try {
    const { name, number } = req.body || {};
    if (!name || !number) {
      return res.status(400).json({ error: 'name and number are required' });
    }
    await connectIfNeeded();
    const person = new Person({ name, number });
    const saved = await person.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

app.get('/info', async (req, res, next) => {
  try {
    await connectIfNeeded();
    const count = await Person.countDocuments({});
    const now = new Date().toString();
    res.send(`Phonebook has info for ${count} people<br/><br/>${now}`);
  } catch (err) {
    next(err);
  }
});

// SPA fallback for non-API routes when frontend build exists
app.get(/^(?!\/api\/).+/, (req, res, next) => {
  const indexHtml = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  return next();
});

// Unknown endpoint handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'unknown endpoint' });
  }
  return next();
});

// Centralized error handler
// Ensure all async routes use (req, res, next) and call next(err) on failure
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


