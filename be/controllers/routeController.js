const supabase = require('../config/db');

exports.prepareGraphHopperPayload = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.body;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const { data: pointPemberat, error } = await supabase
      .from('laporan_kerusakan') 
      .select('latitude, longitude, skor_kerusakan')
      .order('skor_kerusakan', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    let customModel = null;

    if (pointPemberat) {
      const pLat = parseFloat(pointPemberat.latitude);
      const pLng = parseFloat(pointPemberat.longitude);
      const offset = 0.0001; 

      customModel = {
        "priority": [
          {
            "if": "in_area_rusak",
            "multiply_by": 0
          }
        ],
        "areas": {
          "area_rusak": {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [[
                [pLng - offset, pLat + offset],
                [pLng + offset, pLat + offset],
                [pLng + offset, pLat - offset],
                [pLng - offset, pLat - offset],
                [pLng - offset, pLat + offset]
              ]]
            }
          }
        }
      };
    }

    const ghPayload = {
      points: [
        [parseFloat(startLng), parseFloat(startLat)],
        [parseFloat(endLng), parseFloat(endLat)]
      ],
      profile: "walk",
      locale: "id_ID",
      elevation: false,
      instructions: true,
      calc_points: true,
      "ch.disable": true,
      custom_model: customModel
    };

    res.json({
      message: "Payload berhasil dibuat",
      titik_dihindari: pointPemberat,
      graphhopper_ready_data: ghPayload
    });

  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
};