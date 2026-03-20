import { Router, RequestHandler } from "express";
import { Settings } from "../models/Settings";

const router = Router();

// Get setting by key
const getSetting: RequestHandler = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });
    
    if (!setting) {
      return res.json({ success: true, data: null });
    }
    
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get setting",
    });
  }
};

// Update or create setting
const updateSetting: RequestHandler = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update setting",
    });
  }
};

// Serve logo as image
const serveLogo: RequestHandler = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: "company-logo" });
    
    if (!setting || !setting.value) {
      return res.status(404).send("Logo not found");
    }
    
    // Extract base64 data and mime type
    const matches = setting.value.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).send("Invalid logo format");
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    res.send(buffer);
  } catch (error) {
    res.status(500).send("Failed to serve logo");
  }
};

router.get("/:key", getSetting);
router.put("/:key", updateSetting);
router.get("/logo/image", serveLogo); // Serve logo as image

export { router as settingsRouter };
