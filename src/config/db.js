const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
}

module.exports = { connectToDatabase };

