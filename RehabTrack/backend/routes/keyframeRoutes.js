const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const Keyframe = require("../models/Keyframe");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, uuid() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload/:sessionId", auth, upload.single("image"), async (req, res) => {
  const keyframe = await Keyframe.create({
    session: req.params.sessionId,
    imageUrl: req.file.path
  });
  res.json(keyframe);
});

module.exports = router;
