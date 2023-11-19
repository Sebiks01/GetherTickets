const mongoose = require('mongoose');

const { Schema } = mongoose;

const reqString = {
  type: String,
  required: true,
};

const schema = new Schema({
  userId: reqString,
  type: reqString,
  claimed: {
    type: Boolean,
    required: true,
  },
});

const name = 'tickets';

module.exports = mongoose.models[name] || mongoose.model(name, schema, name);
