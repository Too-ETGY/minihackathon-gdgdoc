const supabase = require('../config/db');

const categoryController = {
  // Get all categories
  getAll: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single category
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create category
  create: async (req, res) => {
    try {
      const { name, icon_url } = req.body;
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, icon_url }])
        .select();
      
      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update category
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, icon_url } = req.body;
      const { data, error } = await supabase
        .from('categories')
        .update({ name, icon_url })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      res.status(200).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete category
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = categoryController;
