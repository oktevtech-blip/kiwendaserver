// heroController.js
import db from "../config/db.js";
import multer from "multer";

// Store uploaded file in memory (BLOB)
const storage = multer.memoryStorage();
export const upload = multer({ storage });


// ===============================
// ✅ UPLOAD HERO IMAGE
// ===============================
export const uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const imageBuffer = req.file.buffer;
    const description = req.body.description || "Hero background image";

    // Remove old hero image — we only allow ONE
    await db.query("DELETE FROM image_data");

    // Insert new image as BLOB
    await db.query(
      "INSERT INTO image_data (image, description) VALUES (?, ?)",
      [imageBuffer, description]
    );

    res.json({ success: true, message: "Hero image uploaded successfully" });

  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ===============================
// ✅ GET HERO IMAGE
// ===============================
export const getHeroImage = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM image_data LIMIT 1");

    if (rows.length === 0) {
      return res.json({ image: null, description: null });
    }

    const hero = rows[0];

    // Convert BLOB to base64
    const base64Image = hero.image
      ? Buffer.from(hero.image).toString("base64")
      : null;

    res.json({
      image: base64Image,
      description: hero.description,
    });

  } catch (error) {
    console.error("❌ Fetch error:", error);
    res.status(500).json({ message: "Error fetching hero image" });
  }
};
