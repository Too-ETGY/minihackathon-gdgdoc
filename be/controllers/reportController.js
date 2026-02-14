const supabase = require("../config/db");

const reportController = {
  // Get all reports
  getAll: async (req, res) => {
    try {
      const { data, error } = await supabase.from("reports").select(`
          *,
          locations (name)
        `);

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create report
  create: async (req, res) => {
    try {
      const { location_id, reason } = req.body;

      // 1. Simpan laporan
      const { data, error } = await supabase
        .from("reports")
        .insert([{ location_id, reason }])
        .select();

      if (error) throw error;

      // 2. Increment report_count di tabel locations
      // Kita bisa gunakan RPC atau query update manual
      const { error: updateError } = await supabase.rpc(
        "increment_report_count",
        {
          loc_id: location_id,
        },
      );

      // Jika RPC tidak ada, kita lakukan update manual (fallback)
      if (updateError) {
        const { data: locData } = await supabase
          .from("locations")
          .select("report_count")
          .eq("id", location_id)
          .single();

        await supabase
          .from("locations")
          .update({ report_count: (locData.report_count || 0) + 1 })
          .eq("id", location_id);
      }

      res.status(201).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete report
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from("reports").delete().eq("id", id);

      if (error) throw error;
      res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = reportController;
