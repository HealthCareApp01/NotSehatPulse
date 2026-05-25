import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Generate a valid patient token to authenticate
const token = jwt.sign(
  { userId: "6a04726cab1425418e2529e7", role: "Patient" },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function run() {
  console.log("Sending POST request with base64 image prescription named cold_prescription.png...");
  try {
    const file = {
      name: "cold_prescription.png",
      type: "image/png",
      content: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
    };

    const response = await fetch('http://localhost:5000/api/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "",
        chatHistory: [
          { role: "bot", content: "Hello! I am your AI Doctor Chatbot." }
        ],
        file: file
      })
    });

    console.log("Response Status:", response.status);
    const bodyText = await response.text();
    console.log("Response Body Text:", bodyText);

  } catch (error) {
    console.error("Fetch error:", error);
  }
}

run();
