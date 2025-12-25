const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "info@eynthrasolution.com",
    pass: "GMAIL_APP_PASSWORD" // App Password only
  }
});

app.post("/lead", async (req, res) => {
  const { name, email } = req.body;

  try {
    await transporter.sendMail({
      from: `"Eynthra Chatbot" <info@eynthrasolution.com>`,
      to: "info@eynthrasolution.com",   // ✅ EMAIL SENT HERE
      subject: "New Chatbot Lead – Eynthra Solution",
      text: `New lead received from chatbot:\n\nName: ${name}\nEmail: ${email}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
