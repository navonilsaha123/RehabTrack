const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const Session = require("../models/Session");

router.post("/start", auth, async (req, res) => {
  const session = await Session.create({
    patient: req.user.id,
    doctor: req.body.doctorId,
    startTime: new Date()
  });
  res.json(session);
});

module.exports = router;
