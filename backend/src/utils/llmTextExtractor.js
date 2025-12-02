// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { getSysPrompt,recruiterSysPrompt } from "./systemPrompt.js";
// import dotenv from 'dotenv';
 
// dotenv.config();
 
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // set API key in .env
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
 
// export const extractResumeSections = async (text,role) => {
//   console.log('inside llm logic')
//   console.log('role', role)
//  let prompt;
//   if (role === "candidate") {
//     prompt = getSysPrompt(text);
//   } else {
//     prompt = recruiterSysPrompt(text);
//   } // check  the systemprompth file for the prompt
 
//   const result = await model.generateContent(prompt);
//   let rawText = result.response.text().trim();
//   rawText = rawText.replace(/```json|```/g, '').trim();

//   // Try parsing JSON safely
//   try {
//     const parsed = JSON.parse(rawText);
//     return parsed
//   } catch(error) {
//     console.log("error while parsing llm response",error.message)
//   }
// };



import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSysPrompt, recruiterSysPrompt, cvRankerPrompt, generateJobDescriptionPrompt } from "./systemPrompt.js";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const extractResumeSections = async (text, role, extra = {}) => {
  console.log("inside llm logic | role:", role);

  let prompt;

  // Normal behavior for candidate parsing
  if (role === "candidate") {
    prompt = getSysPrompt(text);

  // Recruiter prompt
  } else if (role === "company") {
    prompt = recruiterSysPrompt(text);

  // NEW: CV RANKER LOGIC
  } else if (role === "cvranker") {
    const { jobDescription, candidateDetails } = extra;
    prompt = cvRankerPrompt(jobDescription, candidateDetails);

  } else if (role === "generatejd") {
    const { jobdetails } = extra;
    prompt = generateJobDescriptionPrompt(jobdetails);

  } else {
    throw new Error("Invalid role passed to extractResumeSections()");
  }

  // Call Gemini
  const result = await model.generateContent(prompt);

  // Clean output
  let rawText = result.response.text().trim();
  rawText = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.log("JSON parse error:", err.message);
    console.log("LLM raw output:", rawText);
    return null;
  }
};
