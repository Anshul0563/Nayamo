const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('NO_MONGO_URI');
      process.exit(1);
    }
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const count = await Product.countDocuments();
    console.log('TOTAL', count);
    const types = await Product.aggregate([
      { $group: { _id: '$jewelleryType', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);
    console.log('JEWELLERY_TYPES', JSON.stringify(types, null, 2));
    const cats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);
    console.log('CATEGORIES', JSON.stringify(cats, null, 2));
    const sample = await Product.find({}, { title:1, jewelleryType:1, category:1, price:1 }).limit(20).lean();
    console.log('SAMPLE', sample.map(p => ({ title: p.title, jewelleryType: p.jewelleryType, category: p.category, price: p.price })));
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERR', err.message);
    process.exit(1);
  }
})();
