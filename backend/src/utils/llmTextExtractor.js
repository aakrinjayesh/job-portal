// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { getSysPrompt, recruiterSysPrompt, cvRankerPrompt, generateJobDescriptionPrompt, aiCandidatefilterPrompt, aiJobfilterPrompt } from "./systemPrompt.js";
// import sendEmail from "./sendEmail.js";
// import dotenv from 'dotenv';

// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// export const extractResumeSections = async (text, role, extra = {}) => {
//   console.log("inside llm logic | role:", role);

//   let prompt;
// try {
//    // Normal behavior for candidate parsing
//   if (role === "candidate") {
//     prompt = getSysPrompt(text);

//   // Recruiter prompt
//   } else if (role === "company") {
//     prompt = recruiterSysPrompt(text);

//   // NEW: CV RANKER LOGIC
//   } else if (role === "cvranker") {
//     const { jobDescription, candidateDetails } = extra;
//     prompt = cvRankerPrompt(jobDescription, candidateDetails);

//   } else if (role === "generatejd") {
//     const { jobdetails } = extra;
//     prompt = generateJobDescriptionPrompt(jobdetails);

//   } else if (role === "aicandidatefilter") {
//     const { JD } = extra;
//     prompt = aiCandidatefilterPrompt(JD)
//   }else if (role === "aijobfilter") {
//     const { JD } = extra;
//     prompt = aiJobfilterPrompt(JD)
//   }
//   else {
//     throw new Error("Invalid role passed to extractResumeSections()");
//   }

//   // Call Gemini
//     let result;
//     try {
//       result = await model.generateContent(prompt);
//     } catch (err) {
//       console.error("❌ LLM API Error:", err.message);

//       // Send Failure Email
//       await sendEmail({
//         to: "vsaijayesh94@gmail.com",
//         subject: "⚠️ LLM FAILURE – Gemini API Error",
//         text: `Error calling LLM:\n${err.message}\n\nRole: ${role}`
//       });

//       throw err;
//     }

//   // Clean output
//   let rawText = result?.response?.text()?.trim() || "";
  
//   rawText = rawText.replace(/```json|```/g, "").trim();

//   try {
//     return JSON.parse(rawText);
//   } catch (err) {
//     console.error("❌ JSON parse error:", err.message);

//       // Send Failure Email
//       await sendEmail({
//         to: "vsaijayesh94@gmail.com",
//         subject: "⚠️ LLM FAILURE – Invalid JSON Output",
//         text: `LLM returned invalid JSON.\n\nError: ${err.message}\n\nLLM Raw Output:\n${rawText}`
//       });

//       return null; // or handle gracefully
//   }
  
// } catch (error) {
//   console.error("❌ Unexpected LLM error:", error.message);

//     // Send Failure Email
//     await sendEmail({
//       to: 'vsaijayesh94@gmail.com',
//       subject: "⚠️ LLM FAILURE – Unexpected Error",
//       text: `Unexpected error in extractResumeSections:\n${error.message}`
//     });

//     return null;
// }
 
// };


import { Groq } from 'groq-sdk';
import { getSysPrompt, recruiterSysPrompt, cvRankerPrompt, generateJobDescriptionPrompt, aiCandidatefilterPrompt, aiJobfilterPrompt } from "./systemPrompt.js";
import sendEmail from "./sendEmail.js";
import dotenv from 'dotenv';

dotenv.config();
const genAI = new Groq({
  apiKey: process.env['GROQ_API_KEY'], // This is the default and can be omitted
});

const modelName = "llama-3.1-8b-instant";
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const extractResumeSections = async (text, role, extra = {}) => {
  console.log("inside llm logic | role:", role);

  let prompt;
try {
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

  } else if (role === "aicandidatefilter") {
    const { JD } = extra;
    prompt = aiCandidatefilterPrompt(JD)
  }else if (role === "aijobfilter") {
    const { JD } = extra;
    prompt = aiJobfilterPrompt(JD)
  }
  else {
    throw new Error("Invalid role passed to extractResumeSections()");
  }

  // Call Gemini
    let result;
    try {
      result = await genAI.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: prompt },
        ],
        temperature: 0,
      });
    } catch (err) {
      console.error("❌ LLM API Error:", err.message);

      // Send Failure Email
      await sendEmail({
        to: "vsaijayesh94@gmail.com",
        subject: "⚠️ LLM FAILURE – Gemini API Error",
        text: `Error calling LLM:\n${err.message}\n\nRole: ${role}\n\n prompt data: ${extra}`
      });

      throw err;
    }

  // Clean output
  console.log("groq output", result)
  let rawText = result?.choices?.[0]?.message?.content?.trim() || "";
  rawText = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error("❌ JSON parse error:", err.message);

      // Send Failure Email
      await sendEmail({
        to: "vsaijayesh94@gmail.com",
        subject: "⚠️ LLM FAILURE – Invalid JSON Output",
        text: `LLM returned invalid JSON.\n\nError: ${err.message}\n\nLLM Raw Output:\n${rawText}`
      });

      return null; // or handle gracefully
  }
  
} catch (error) {
  console.error("❌ Unexpected LLM error:", error.message);

    // Send Failure Email
    await sendEmail({
      to: 'vsaijayesh94@gmail.com',
      subject: "⚠️ LLM FAILURE – Unexpected Error",
      text: `Unexpected error in extractResumeSections:\n${error.message}`
    });

    return null;
}
 
};
