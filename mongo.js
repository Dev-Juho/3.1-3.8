const mongoose = require('mongoose');

const args = process.argv;
if (args.length < 3) {
  console.log('Usage for listing:  node mongo.js <password>');
  console.log('Usage for adding:   node mongo.js <password> "Name" 123-4567');
  process.exit(1);
}

const password = args[2];
const name = args[3];
const number = args[4];

mongoose.set('strictQuery', false);

// URI
const username = process.env.DB_USER || 'yourusername';
const host = process.env.DB_HOST || 'yourcluster.example.mongodb.net';
const dbName = process.env.DB_NAME || 'phonebook';
const appName = process.env.DB_APPNAME || 'PhonebookApp';

let uri = process.env.MONGODB_URI;
if (!uri) {
  uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}/${dbName}?retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`;
} else if (uri.includes(':<password>')) {
  // ei mitää infoo toimiiks
  uri = uri.replace(':<password>', `:${encodeURIComponent(password)}`);
}

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

async function listAllAndExit () {
  try {
    await mongoose.connect(uri);
    const persons = await Person.find({});
    console.log('phonebook:');
    persons.forEach(p => console.log(`${p.name} ${p.number}`));
  } catch (err) {
    console.error('Error listing persons:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

async function addOneAndExit (personName, personNumber) {
  try {
    await mongoose.connect(uri);
    const person = new Person({ name: personName, number: personNumber });
    await person.save();
    console.log(`added ${personName} number ${personNumber} to phonebook`);
  } catch (err) {
    console.error('Error adding person:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

if (!name && !number) {
  listAllAndExit();
} else if (name && number) {
  addOneAndExit(name, number);
} else {
  console.log('Both name and number are required when adding a new entry.');
  console.log('Example: node mongo.js <password> "Ada Lovelace" 39-44-5323523');
  process.exit(1);
}
