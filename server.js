require("dotenv").config();

const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());


if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* Storage Setup */
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* Form API */
app.post("/submit", upload.fields([
  { name: "fileUpload" },
  { name: "sampleFile" }
]), async (req, res) => {

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const attachments = [];

    if (req.files?.fileUpload) {
      attachments.push({
        filename: req.files.fileUpload[0].originalname,
        path: req.files.fileUpload[0].path
      });
    }

    if (req.files.sampleFile) {
      attachments.push({
        filename: req.files.sampleFile[0].originalname,
        path: req.files.sampleFile[0].path
      });
    }

    await transporter.sendMail({
      from: '"Swag Form" <rajvip0409@gmail.com>',
      to: process.env.CLIENT_EMAIL,
      subject: "rajvip0409@gmail.com",
      html: `
        <h3>New Submission</h3>
        <p><b>Name:</b> ${req.body.name}</p>
        <p><b>Email:</b> ${req.body.email}</p>
        <p><b>Quantity:</b> ${req.body.quantity}</p>
      `,
      attachments: attachments
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




