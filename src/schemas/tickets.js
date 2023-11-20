const mongoose = require('mongoose');

const { Schema } = mongoose;

const reqString = {
  type: String,
  required: true,
};

const schema = new Schema({
  userId: reqString,
  channelId: reqString,
  type: reqString,
  orderDescription: String,
  orderBudget: String,
  orderDeadline: String,
  logMessageId: String,
  awaitingAnswer: Boolean,
  questions: [
    {
      userId: String,
      question: String,
    },
  ],
  answers: [String],
});

const name = 'tickets';

module.exports = mongoose.models[name] || mongoose.model(name, schema, name);
