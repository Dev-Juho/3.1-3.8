const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

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

const persons = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' },
];

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const { id } = req.params;
  const person = persons.find(p => p.id === id);
  if (!person) {
    return res.status(404).json({ error: 'Person not found' });
  }
  res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
  const { id } = req.params;
  const index = persons.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Person not found' });
  }
  persons.splice(index, 1);
  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body || {};

  if (!name || !number) {
    return res.status(400).json({ error: 'name and number are required' });
  }

  if (persons.some(p => p.name === name)) {
    return res.status(400).json({ error: 'name must be unique' });
  }

  let id;
  do {
    id = Math.floor(Math.random() * 1e9).toString();
  } while (persons.some(p => p.id === id));

  const newPerson = { id, name, number };
  persons.push(newPerson);
  res.status(201).json(newPerson);
});

app.get('/info', (req, res) => {
  const count = persons.length;
  const now = new Date().toString();
  res.send(`Phonebook has info for ${count} people<br/><br/>${now}`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


