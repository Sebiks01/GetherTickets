const mongoose = require('mongoose');

const { Schema } = mongoose;

const reqString = {
  type: String,
  required: true,
};

const reqBoolean = {
  type: Boolean,
  required: true,
};

const schema = new Schema({
  userId: reqString,
  channelId: reqString,
  type: reqString,
  claimed: reqBoolean,
  orderDescription: String,
  orderBudget: String,
  orderDeadline: String,
});

const name = 'tickets';

module.exports = mongoose.models[name] || mongoose.model(name, schema, name);
