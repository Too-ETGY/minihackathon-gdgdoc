const supabase = require('../config/db');

exports.prepareGraphHopperPayload = (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.body;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        error: "Data tidak lengkap"
      });
    }

    const sLat = parseFloat(startLat);
    const sLng = parseFloat(startLng);
    const eLat = parseFloat(endLat);
    const eLng = parseFloat(endLng);

    const ghPayload = {
      points: [
        [sLng, sLat], 
        [eLng, eLat] 
      ],
      profile: "walk",      
      locale: "id_ID",     
      elevation: false,    
      instructions: true,  
      calc_points: true,   
      "ch.disable": true,  
      custom_model: null 
    };

    res.json({
      message: "Payload berhasil dibuat",
      graphhopper_ready_data: ghPayload
    });

  } catch (error) {
    console.error("Error creating payload:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
};