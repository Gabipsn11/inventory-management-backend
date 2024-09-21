const Category = require('../models/Category');

exports.create = async (req, res) => {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
};

exports.getAll = async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
};

exports.getById = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    res.json(category);
};

exports.update = async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    res.json(category);
};

exports.delete = async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).send();
};
