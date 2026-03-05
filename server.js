require("dotenv").config();

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const resend = new Resend(process.env.RESEND_API_KEY);

/* -------------------------------
   Ensure uploads folder exists
-------------------------------- */

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* -------------------------------
   Multer setup
-------------------------------- */

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* -------------------------------
   Test Route
-------------------------------- */

app.get("/", (req, res) => {
  res.send("Server is running");
});

/* -------------------------------
   Form Submit Route
-------------------------------- */

app.post(
  "/submit",
  upload.fields([
    { name: "fileUpload", maxCount: 1 },
    { name: "sampleFile", maxCount: 1 }
  ]),
  async (req, res) => {
    try {

      console.log("Form received");

      /* -------------------------------
         Attachments (if uploaded)
      -------------------------------- */

      const attachments = [];

      if (req.files?.fileUpload) {
        attachments.push({
          filename: req.files.fileUpload[0].originalname,
          path: req.files.fileUpload[0].path
        });
      }

      if (req.files?.sampleFile) {
        attachments.push({
          filename: req.files.sampleFile[0].originalname,
          path: req.files.sampleFile[0].path
        });
      }

      /* -------------------------------
         Send Email using Resend
      -------------------------------- */

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: process.env.CLIENT_EMAIL,
        subject: "New SWAG Form Submission",
        html: `
        <h2>New SWAG Form Submission</h2>

        <p><b>Name:</b> ${req.body.name || ""}</p>
        <p><b>Email:</b> ${req.body.email || ""}</p>
        <p><b>Phone:</b> ${req.body.phone || ""}</p>

        <p><b>Project Description:</b> ${req.body.project_description || ""}</p>
        <p><b>Quantity:</b> ${req.body.quantity || ""}</p>

        <p><b>Need Date:</b> ${req.body.need_date || ""}</p>

        <p><b>Department:</b> ${req.body.department || ""}</p>

        <p><b>Site:</b> ${req.body.site || ""}</p>

        <p><b>Project Owner:</b> ${req.body.project_owner || ""}</p>
        `
      });

      /* -------------------------------
         Delete uploaded files
      -------------------------------- */

      attachments.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.log("File delete error:", err);
        });
      });

      res.json({ success: true });

    } catch (error) {

      console.error("UPLOAD ERROR:", error);
      res.status(500).json({ error: "Email sending failed" });

    }
  }
);

/* -------------------------------
   Start Server
-------------------------------- */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
