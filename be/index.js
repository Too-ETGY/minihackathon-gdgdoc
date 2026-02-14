const express = require("express");
const cors = require("cors");
const supabase = require("./config/db");
require("dotenv").config();

const categoryRoutes = require("./routes/categoryRoutes");
const locationRoutes = require("./routes/locationRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

app.use(express.json());

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running and APIs are ready!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  if (supabase) {
    console.log("Supabase client initialized");
  }
});
