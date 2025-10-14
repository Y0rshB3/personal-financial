const { Category } = require('../models/postgres');
const ActivityLog = require('../models/mongodb/ActivityLog');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  try {
    const categoryData = {
      ...req.body,
      userId: req.user.id
    };
    
    const category = await Category.create(categoryData);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'create_category',
      details: { 
        categoryId: category.id,
        name: category.name,
        type: category.type
      }
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await category.update(req.body);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_category',
      details: { categoryId: category.id }
    });

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await category.destroy();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete_category',
      details: { categoryId: req.params.id }
    });

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
