const Product = require('../models/Product');

exports.create = async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
};

exports.getAll = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};

exports.getById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(product);
};

exports.update = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(product);
};

exports.delete = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
};
