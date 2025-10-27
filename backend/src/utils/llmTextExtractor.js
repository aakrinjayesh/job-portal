import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSysPrompt,recruiterSysPrompt } from "./systemPrompt.js";
import dotenv from 'dotenv';
 
dotenv.config();
 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // set API key in .env
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
 
export const extractResumeSections = async (text,role) => {
  console.log('inside llm logic')
 let prompt;
  if (role === "candidate") {
    prompt = getSysPrompt(text);
  } else {
    prompt = recruiterSysPrompt(text);
  } // check  the systemprompth file for the prompt
 
  const result = await model.generateContent(prompt);
  let rawText = result.response.text().trim();
  rawText = rawText.replace(/```json|```/g, '').trim();

  // Try parsing JSON safely
  try {
    const parsed = JSON.parse(rawText);
    return parsed
  } catch(error) {
    console.log("error while parsing llm response",error.message)
  }
};