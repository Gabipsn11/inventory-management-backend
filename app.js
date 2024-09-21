const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();


mongoose.connect('mongodb://localhost:27017/gerenciamento-estoque', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB', err));


app.use(express.json());


const itemSchema = new mongoose.Schema({
    nome: String,
    quantidade: Number,
    preco: Number
});
const Item = mongoose.model('Item', itemSchema);


const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    jwt.verify(token, 'MIHcAgEBBEIBIRh3jcV7BU17YakiaSaXs6zxCfM0aHBBZfD510w3RWakiVqgXXXn', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
}


app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await user.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Senha incorreta' });

    const token = jwt.sign({ username: user.username }, 'MIHcAgEBBEIBIRh3jcV7BU17YakiaSaXs6zxCfM0aHBBZfD510w3RWakiVqgXXXn', { expiresIn: '1h' });
    res.json({ token });
});

app.post('/api/itens', authenticateToken, async (req, res) => {
    const item = new Item({
        nome: req.body.nome,
        quantidade: req.body.quantidade,
        preco: req.body.preco
    });
    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


app.get('/api/itens', authenticateToken, async (req, res) => {
    try {
        const itens = await Item.find();
        res.json(itens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.put('/api/itens/:id', authenticateToken, async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Item não encontrado' });
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


app.delete('/api/itens/:id', authenticateToken, async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item não encontrado' });
        res.json({ message: 'Item deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
