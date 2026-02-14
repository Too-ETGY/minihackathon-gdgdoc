const supabase = require("../config/db");

const categoryController = {
  // Get all categories
  getAll: async (req, res) => {
    try {
      const { data, error } = await supabase.from("categories").select("*");

      if (error) throw error;
      res.status(200).json({
        status: true,
        message: "success",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },

  // Get single category
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      res.status(200).json({
        status: true,
        message: "success",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },

  // Create category
  create: async (req, res) => {
    try {
      const { name, icon_url } = req.body;
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name, icon_url }])
        .select();

      if (error) throw error;
      res.status(201).json({
        status: true,
        message: "success",
        data: data[0],
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },

  // Update category
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, icon_url } = req.body;
      const { data, error } = await supabase
        .from("categories")
        .update({ name, icon_url })
        .eq("id", id)
        .select();

      if (error) throw error;
      res.status(200).json({
        status: true,
        message: "success",
        data: data[0],
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },

  // Delete category
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
      res.status(200).json({
        status: true,
        message: "Category deleted successfully",
        data: null,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },
};

module.exports = categoryController;
