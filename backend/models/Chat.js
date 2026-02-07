const chatSchema = new mongoose.Schema({
  title: { type: String, default: 'New Chat' },
  language: { type: String, required: true },
  lastMessageAt: { type: Date, default: Date.now }
});