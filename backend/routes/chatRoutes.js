router.post('/chats', async (req, res) => {
  try {
    const { language } = req.body; 
    const newChat = new Chat({ language, title: 'New Chat' });
    await newChat.save();
    res.status(201).json(newChat); // Frontend ko naye chat ki ID mil jayegi
  } catch (err) {
    res.status(500).json({ error: "Chat create nahi ho paya" });
  }
});
router.get('/chats', async (req, res) => {
  try {
    // .sort({ lastMessageAt: -1 }) se latest chat sabse upar aayegi
    const chats = await Chat.find().sort({ lastMessageAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "History load nahi hui" });
  }
});
router.get('/chats/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.id }).sort({ timestamp: 1 });
    res.json(messages); 
  } catch (err) {
    res.status(500).json({ error: "Messages nahi mil paaye" });
  }
});
router.post('/messages', async (req, res) => {
  const { chatId, content, imageUrl, language } = req.body;

  try {
    const userMsg = new Message({ chatId, role: 'user', content, imageUrl });
    await userMsg.save();

    await Chat.findByIdAndUpdate(chatId, { lastMessageAt: Date.now() });

    const aiResponse = await axios.post('YOUR_FASTAPI_URL/ask', {
      query: content,
      image: imageUrl,
      lang: language
    });

    const botMsg = new Message({
      chatId,
      role: 'bot',
      content: aiResponse.data.reply
    });
    await botMsg.save();

    res.json(botMsg);

  } catch (err) {
    res.status(500).json({ error: "AI response fail ho gaya" });
  }
});