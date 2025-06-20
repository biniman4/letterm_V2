import express from "express";
import multer from "multer";
import {
  createLetter,
  getLetters,
  downloadFile,
  viewFile,
  updateLetterStatus,
  getSentLetters,
  deleteLetter,
  approveLetter,
  getPendingLetters,
} from "../controllers/letterController.js";

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, JPEG, and PNG files are allowed."
        ),
        false
      );
    }
  },
});

// Routes
router.post("/", upload.single("attachment"), createLetter);
router.get("/", getLetters);
router.get("/sent", getSentLetters);
router.get("/download/:letterId/:filename", downloadFile);
router.get("/view/:letterId/:filename", viewFile);
router.post("/status", updateLetterStatus);
router.delete("/:id", deleteLetter);
router.post("/approve", approveLetter);
router.get("/pending", getPendingLetters);

export default router;
