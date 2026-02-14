const supabase = require('../config/db');

const locationController = {
  // Get all locations
  getAll: async (req, res) => {
    try {
      // Kita ambil data locations dan join dengan categories
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          categories (name)
        `);
      
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get locations within radius (using PostGIS)
  // Query: /locations/nearby?lat=-6.123&long=106.123&radius=1000
  getNearby: async (req, res) => {
    try {
      const { lat, long, radius } = req.query;
      
      if (!lat || !long || !radius) {
        return res.status(400).json({ error: 'lat, long, and radius are required' });
      }

      // Gunakan RPC (Stored Procedure) di Supabase untuk query PostGIS yang kompleks
      // Atau bisa gunakan filter st_dwithin jika sudah di-expose
      // Untuk kemudahan, kita asumsikan menggunakan query mentah via rpc jika tersedia
      // Jika tidak, kita bisa gunakan select biasa dengan filter koordinat
      
      const { data, error } = await supabase
        .rpc('get_locations_nearby', {
          lat: parseFloat(lat),
          long: parseFloat(long),
          radius_meters: parseFloat(radius)
        });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create location
  create: async (req, res) => {
    try {
      const { category_id, name, description, lat, long } = req.body;
      
      // PostGIS Point format: POINT(long lat)
      const point = `POINT(${long} ${lat})`;

      const { data, error } = await supabase
        .from('locations')
        .insert([{ 
          category_id, 
          name, 
          description, 
          coords: point,
          is_verified: true
        }])
        .select();
      
      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update location
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { category_id, name, description, lat, long, is_verified } = req.body;
      
      const updateData = { category_id, name, description, is_verified };
      
      if (lat && long) {
        updateData.coords = `POINT(${long} ${lat})`;
      }

      const { data, error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      res.status(200).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete location
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = locationController;
