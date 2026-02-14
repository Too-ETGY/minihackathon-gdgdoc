const supabase = require("../config/db");

const locationController = {
  // Get all locations
  getAll: async (req, res) => {
    try {
      // Mengambil data locations dan join dengan categories tanpa mengekstrak lat/long mentah yang null
      const { data, error } = await supabase.from("locations").select(`
          *,
          categories (name)
        `);

      if (error) throw error;

      // Proses data untuk mengekstrak latitude dan longitude dari objek coords (PostGIS)
      // atau dari kolom latitude/longitude jika sudah ada
      const processedData = data.map((loc) => {
        const result = { ...loc };

        // Jika coords dikembalikan sebagai objek oleh PostGIS/Supabase
        if (
          loc.coords &&
          typeof loc.coords === "object" &&
          loc.coords.coordinates
        ) {
          result.latitude = loc.coords.coordinates[1];
          result.longitude = loc.coords.coordinates[0];
        }
        // Jika kolom latitude/longitude ada nilainya, gunakan itu (fallback)
        else {
          result.latitude = loc.latitude || null;
          result.longitude = loc.longitude || null;
        }

        // Hapus field coords (binary/obj) jika tidak ingin ditampilkan di frontend
        // delete result.coords;

        return result;
      });

      res.status(200).json({
        status: true,
        message: "success",
        data: processedData,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  },

  // Get locations within radius (using PostGIS)
  // Query: /locations/nearby?lat=-6.123&long=106.123&radius=1000
  getNearby: async (req, res) => {
    try {
      const { lat, long, radius } = req.query;

      if (!lat || !long || !radius) {
        return res.status(400).json({
          status: false,
          message: "lat, long, and radius are required",
          data: null,
        });
      }

      // Gunakan RPC (Stored Procedure) di Supabase untuk query PostGIS yang kompleks
      // Atau bisa gunakan filter st_dwithin jika sudah di-expose
      // Untuk kemudahan, kita asumsikan menggunakan query mentah via rpc jika tersedia
      // Jika tidak, kita bisa gunakan select biasa dengan filter koordinat

      const { data, error } = await supabase.rpc("get_locations_nearby", {
        lat: parseFloat(lat),
        long: parseFloat(long),
        radius_meters: parseFloat(radius),
      });

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

  // Create location
  create: async (req, res) => {
    try {
      const { category_id, name, description, lat, long } = req.body;

      // PostGIS Point format: POINT(long lat)
      const point = `POINT(${long} ${lat})`;

      const { data, error } = await supabase
        .from("locations")
        .insert([
          {
            category_id,
            name,
            description,
            coords: point,
            latitude: lat,
            longitude: long,
            is_verified: true,
          },
        ])
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

  // Update location
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { category_id, name, description, lat, long, is_verified } =
        req.body;

      const updateData = { category_id, name, description, is_verified };

      if (lat !== undefined && long !== undefined) {
        updateData.coords = `POINT(${long} ${lat})`;
        updateData.latitude = lat;
        updateData.longitude = long;
      }

      const { data, error } = await supabase
        .from("locations")
        .update(updateData)
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

  // Delete location
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from("locations").delete().eq("id", id);

      if (error) throw error;
      res.status(200).json({
        status: true,
        message: "Location deleted successfully",
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

module.exports = locationController;
