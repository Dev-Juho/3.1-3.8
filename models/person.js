const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.warn('MONGODB_URI not set. DB operations will fail until set.');
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    minLength: [3, 'name must be at least 3 characters'],
    trim: true
  },
  number: {
    type: String,
    required: [true, 'number is required'],
    trim: true,
    minlength: [8, 'number must be at least 8 characters'],
    validate: {
      validator: function (v) {
        if (!v) return false;
        // sql blockkia
        return /^\d{2,3}-\d+$/.test(v) && v.length >= 8;
      },
      message: 'number must be of form XX-xxxxxxx or XXX-xxxxxxx (min length 8)'
    }
  }
});

personSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const Person = mongoose.models.Person || mongoose.model('Person', personSchema);

async function connectIfNeeded () {
  if (mongoose.connection.readyState === 1) return; // connected
  if (!uri) throw new Error('Missing MONGODB_URI');
  await mongoose.connect(uri);
}

module.exports = { Person, connectIfNeeded };
