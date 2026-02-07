const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', index: true },
  role: { type: String, enum: ['user', 'bot'] },
  content: String,
  imageUrl: String, // Farmer ki photo ke liye
  timestamp: { type: Date, default: Date.now }
});