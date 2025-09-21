const mongoose = require('mongoose');

async function showCollections() {
  await mongoose.connect('mongodb://localhost:27017/attendancehub');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const docs = await mongoose.connection.db.collection(col.name).find({}).limit(5).toArray();
    console.log(`\nCollection: ${col.name}`);
    console.log(docs);
  }
  mongoose.disconnect();
}

showCollections();
