import { CohereClient } from 'cohere-ai';
import Tesseract from 'tesseract.js';
import dotenv from 'dotenv';
import { matchMedicinesInDatabase } from './helpers.js';

dotenv.config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || 'YOUR_MOCK_KEY',
});

/**
 * 1. Classifier Node:
 * Determines if the input (message or file content) is related to health, medicine, symptoms, or diseases.
 */
export async function classifierNode(state) {
  const file = state.fileData;
  if (file) {
    return { isHealthTopic: true };
  }

  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage ? lastMessage.content : "";

  let textToClassify = query;

  if (!process.env.COHERE_API_KEY) {
    return { isHealthTopic: true };
  }

  try {
    const classificationPrompt = `
You are a health query classifier. Your job is to analyze the user input (which can be a text message or details of an uploaded file) and determine if it is related to health, symptoms, medical queries, diseases, lab reports, doctor consultations, or medicines.

User Input: "${textToClassify}"

Reply ONLY with "YES" if it is related to these medical/health topics.
Reply ONLY with "NO" if it is completely unrelated to health (e.g. general knowledge, programming, history, politics, sports, entertainment, building things, recipe for non-medical foods).

Your answer (YES or NO):`;

    const response = await cohere.chat({
      message: classificationPrompt,
      preamble: "You are a precise classifier. Answer only YES or NO.",
    });

    const answer = response.text.trim().toUpperCase();
    const isHealthTopic = answer.includes("YES");

    if (!isHealthTopic) {
      const politeOutOfRangeMessage = {
        role: "assistant",
        content: "I'm sorry, but that is out of my range. As a medical assistant, I can only help you with health-related queries, symptoms, diseases, prescriptions, and lab reports. Please let me know how I can assist you with your health!"
      };
      if (state.onToken) {
        state.onToken({ text: politeOutOfRangeMessage.content });
      }
      return {
        isHealthTopic: false,
        messages: [politeOutOfRangeMessage]
      };
    }

    return { isHealthTopic: true };
  } catch (error) {
    console.error("❌ Error in classifier node:", error);
    return { isHealthTopic: true }; // Default to true in case of errors to proceed with consultation
  }
}

/**
 * 2. Doctor Node:
 * Acts as an experienced doctor to consult, answer doubts, and provide compassionate advice.
 */
export async function doctorNode(state) {
  const history = state.messages || [];

  // Format history for Cohere chat
  const chatHistory = history.slice(0, -1).map(msg => ({
    role: msg.role === 'user' ? 'USER' : 'CHATBOT',
    message: msg.content
  }));

  const lastUserMsg = history[history.length - 1]?.content || "";

  try {
    const preamble = "You are an experienced, warm, and highly knowledgeable medical doctor. Answer the patient's doubts about health issues, symptoms, diseases, treatments, or healthcare in a supportive, professional, and clear manner. KEEP YOUR ANSWERS EXTREMELY SHORT, CONCISE, AND TO THE POINT (MAX 2-3 SENTENCES). Always end with a very brief one-sentence medical disclaimer in bold italics.";
    let fullText = "";

    if (state.onToken) {
      const stream = await cohere.chatStream({
        chatHistory: chatHistory,
        message: lastUserMsg,
        preamble: preamble
      });

      for await (const chunk of stream) {
        if (chunk.eventType === "text-generation") {
          fullText += chunk.text;
          state.onToken({ text: chunk.text });
        }
      }
    } else {
      const response = await cohere.chat({
        chatHistory: chatHistory,
        message: lastUserMsg,
        preamble: preamble
      });
      fullText = response.text;
    }

    const assistantMsg = {
      role: "assistant",
      content: fullText
    };

    return { messages: [assistantMsg] };
  } catch (error) {
    console.error("❌ Error in doctor node:", error);
    const errText = "I apologize, but I am having trouble connecting to my medical database. How else can I help today?";
    if (state.onToken) {
      state.onToken({ text: errText });
    }
    return {
      messages: [{
        role: "assistant",
        content: errText
      }]
    };
  }
}

/**
 * 3. File Processor Node:
 * Summarizes lab reports or extracts medicines from prescriptions (handles retry feedback).
 */
export async function fileProcessorNode(state) {
  const file = state.fileData;
  const feedback = state.retryFeedback;

  if (!file) return {};

  const fileNameLower = file.name.toLowerCase();

  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage ? lastMessage.content : "";

  const isBase64 = file.content && file.content.startsWith('data:');
  let extractedText = isBase64 ? "" : (file.content || "");

  if (isBase64) {
    try {
      if (state.onToken) state.onToken({ text: "🔍 Reading document image... " });
      console.log("🔍 Running OCR on base64 image...");
      const { data: { text } } = await Tesseract.recognize(file.content, 'eng');
      extractedText = text;
      console.log("✅ OCR extracted text:", extractedText.substring(0, 100) + "...");
    } catch (ocrErr) {
      console.error("❌ OCR Error:", ocrErr);
    }
  }

  const searchString = (fileNameLower + " " + query + " " + extractedText).toLowerCase();

  // Smart check to see if it is a lab report
  const isLabReport = searchString.includes('report') ||
    searchString.includes('lab') ||
    searchString.includes('mg/dl') ||
    searchString.includes('hemoglobin') ||
    searchString.includes('cholesterol') ||
    searchString.includes('reference range') ||
    searchString.includes('cbc') ||
    searchString.includes('lipid') ||
    searchString.includes('test');

  const isPrescription = !isLabReport;

  if (isLabReport) {
    if (state.onToken) state.onToken({ text: "\n🧪 **Lab Report Detected**. Summarizing results...\n\n" });
    // Process Lab Report
    try {
      let summaryPrompt = `
You are an experienced clinical doctor. Summarize this lab report in a patient-friendly manner:
File Name: ${file.name}
Report Data: 
---
${extractedText || "No readable text found."}
---

Explain all values, highlight abnormal levels (high/low), provide medical insights on what these could mean, and give supportive health advice. KEEP IT EXTREMELY SHORT AND CONCISE (MAX 3-4 BULLET POINTS). End with a brief medical disclaimer in bold italics.`;

      let fullText = "";

      if (state.onToken) {
        const stream = await cohere.chatStream({
          message: summaryPrompt,
          preamble: "You are an experienced, empathetic doctor who simplifies lab reports concisely."
        });

        for await (const chunk of stream) {
          if (chunk.eventType === "text-generation") {
            fullText += chunk.text;
            state.onToken({ text: chunk.text });
          }
        }
      } else {
        const response = await cohere.chat({
          message: summaryPrompt,
          preamble: "You are an experienced, empathetic doctor who simplifies lab reports concisely."
        });
        fullText = response.text;
      }

      const assistantMsg = {
        role: "assistant",
        content: fullText
      };

      return {
        summary: fullText,
        messages: [assistantMsg]
      };
    } catch (e) {
      console.error("❌ Error parsing lab report:", e);
      const errMsg = "I uploaded your lab report, but encountered an issue compiling the medical summary. Please try again or paste the report text.";
      if (state.onToken) {
        state.onToken({ text: errMsg });
      }
      return {
        summary: "Unable to process the lab report fully at this time.",
        messages: [{
          role: "assistant",
          content: errMsg
        }]
      };
    }
  } else {
    // Process Prescription (Medicine Extraction)
    if (state.onToken) state.onToken({ text: "\n📝 **Prescription Detected**. Extracting medicines...\n" });
    try {
      let matchedMeds = [];

      let extractionPrompt = `
You are a highly precise medical data extraction system. Extract all prescription medicines listed in this document or text.
File Name: ${file.name}
Prescription content:
---
${extractedText || "No readable text found."}
---`;

      if (feedback) {
        extractionPrompt += `\n\nCRITICAL USER FEEDBACK FOR CORRECTION:\n"${feedback}"\nApply this feedback to correct the extraction.`;
      }

      extractionPrompt += `
Extract the medicines and return them ONLY as a valid JSON array of objects.
Do not write any preamble, explanation, or notes outside the JSON array.
If no medicines are found, return an empty array: []

IMPORTANT RULES:
- ONLY extract medicines that are explicitly mentioned in the content. Do NOT guess or invent medicines.
- CALCULATE QUANTITY CORRECTLY: Analyze the dosage and duration to compute the total quantity. For example, if it says "1 tablet twice a day for 5 days", the quantity is 10. If duration is not specified but a total quantity is, use that.
- Do not include general advice, just the list of medicines.

Each object in the array MUST have exactly these fields:
1. "name": The exact name of the medicine (e.g., "Aspirin")
2. "dosage": Dosage instructions extracted (e.g., "50mg, twice a day")
3. "quantity": Total integer quantity of tablets/capsules to be ordered (e.g., 10)

Format:
[
  { "name": "MedicineName", "dosage": "Dosage details", "quantity": 10 }
]`;

      const response = await cohere.chat({
        message: extractionPrompt,
        preamble: "You are a strict JSON-only extractor. Respond ONLY with a valid JSON array and nothing else."
      });

      // Clean the response text to find the JSON array
      let rawText = response.text.trim();
      const startIdx = rawText.indexOf('[');
      const endIdx = rawText.lastIndexOf(']');
      
      let parsedMeds = [];
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = rawText.substring(startIdx, endIdx + 1);
        try {
          parsedMeds = JSON.parse(jsonStr);
        } catch (err) {
          console.error("❌ JSON parse error from LLM extraction response:", err);
          parsedMeds = [];
        }
      }

      if (parsedMeds && parsedMeds.length > 0) {
        matchedMeds = await matchMedicinesInDatabase(parsedMeds);
      }

      let replyContent = "";
      if (matchedMeds.length === 0) {
        replyContent = "The file is not clear enough to extract medicines. Please upload a clearer copy or verify the text.";
      } else {
        const availableMeds = matchedMeds.filter(m => !m.unmatched).map(m => `• **${m.name}** (Brand: ${m.brand || "Generics"}, Price: ₹${m.price}/pack)`).join("\n");
        const unavailableMeds = matchedMeds.filter(m => m.unmatched).map(m => `• **${m.name}** (Not stocked in local pharmacy)`).join("\n");

        replyContent = `📝 **Prescription Summary:**
I have successfully analyzed your prescription and extracted the listed medicines.

📋 **All Extracted Medicines:**
${matchedMeds.map(m => `- ${m.name} (${m.description || "dosage unspecified"})`).join("\n")}

✅ **Available in Pharmacy (Can be ordered):**
${availableMeds || "• *None of the extracted medicines are currently available.*"}

⚠️ **Unavailable Items (Out of stock/Not stocked):**
${unavailableMeds || "• *All items are available in our pharmacy!*"}

You can add the available medicines directly to your pharmacy cart below, retry the extraction with new feedback, or cancel to clear the parsing results.`;
      }

      if (state.onToken) {
        state.onToken({ 
          text: replyContent, 
          extractedMedicines: matchedMeds 
        });
      }

      const assistantMsg = {
        role: "assistant",
        content: replyContent,
        extractedMedicines: matchedMeds
      };

      return {
        extractedMedicines: matchedMeds,
        messages: [assistantMsg]
      };
    } catch (e) {
      console.error("❌ Error parsing prescription:", e);
      const errMsg = "I had trouble parsing the prescription. Let's try again. Please ensure the prescription text is clear.";
      if (state.onToken) {
        state.onToken({ text: errMsg });
      }
      return {
        messages: [{
          role: "assistant",
          content: errMsg
        }]
      };
    }
  }
}
