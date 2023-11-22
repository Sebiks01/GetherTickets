const mongoose = require('mongoose');

const { Schema } = mongoose;

const reqString = {
  type: String,
  required: true,
};

const schema = new Schema({
  userId: reqString,
  channelId: reqString,
  rejectedReasons: [String],
});

const name = 'offers';

module.exports = mongoose.models[name] || mongoose.model(name, schema, name);
