import { Groq } from "groq-sdk";
import { CandidateDetailsSysPrompt } from "./prompts/candidate.prompt.js";
import { recruiterSysPrompt } from "./prompts/recruiter.prompt.js";
import { cvRankerPrompt } from "./prompts/ranker.prompt.js";
import { generateJobDescriptionPrompt } from "./prompts/jd.prompt.js";
import { aiCandidatefilterPrompt } from "./prompts/filters/candidateFilter.prompt.js";
import { aiJobfilterPrompt } from "./prompts/filters/jobFilter.prompt.js";
import { aiUnifiedFilterPrompt } from "./prompts/aiUnifiedFilterPrompt.js";
import sendEmail from "../../utils/sendEmail.js";
import dotenv from "dotenv";
// import { guardAIOutput } from './guards/aiOutputGuard.js';

dotenv.config();
const genAI = new Groq({
  apiKey: process.env["GROQ_API_KEY"], // This is the default and can be omitted
});

const modelName = process.env.GROQ_MODEL;
console.log("modelName", modelName);
console.log("model tokens", parseInt(process.env["GROQ_MAX_TOKENS"]));

export const extractAIText = async (text, role, extra = {}) => {
  console.log("inside llm logic | role:", role);

  let prompt;
  try {
    // Normal behavior for candidate parsing
    if (role === "candidate") {
      prompt = CandidateDetailsSysPrompt(text);

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
      prompt = aiUnifiedFilterPrompt(JD);
    } else if (role === "aijobfilter") {
      const { JD } = extra;
      prompt = aiUnifiedFilterPrompt(JD);
    } else {
      throw new Error("Invalid role passed to extractResumeSections()");
    }

    // Call Gemini
    let result;
    try {
      result = await genAI.chat.completions.create({
        model: modelName,
        // messages: [{ role: "system", content: prompt }],
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        temperature: 0.1,
        max_tokens: parseInt(process.env["GROQ_MAX_TOKENS"]),
      });

      // 🔥 Check if output was cut due to token limit
      if (result?.choices?.[0]?.finish_reason === "length") {
        throw new Error("LLM output truncated due to token limit");
      }
    } catch (err) {
      console.error("❌ LLM API Error:", err);

      const finishReason = result?.choices?.[0]?.finish_reason;
      const usage = result?.usage;

      await sendEmail({
        to: process.env.EMAIL_LLM || "vsaijayesh94@gmail.com",
        subject: `⚠️ LLM FAILURE – ${role}`,
        text: `
          🚨 LLM ERROR DETECTED

          Error Message:
          ${err.message}

          Finish Reason:
          ${finishReason}

          Model Info:
          Model: ${modelName}
          Max Tokens: ${process.env.GROQ_MAX_TOKENS}
          Temperature: 0.1

          Token Usage:
          ${JSON.stringify(usage, null, 2)}

          Prompt Stats:
          Length (chars): ${(prompt?.system?.length ?? 0) + (prompt?.user?.length ?? 0)}

          Prompt Preview (First 1000 chars):
          ${prompt?.system?.substring(0, 500) || ""}\n\n${prompt?.user?.substring(0, 500) || ""}

          Extra Payload:
          ${JSON.stringify(extra, null, 2)}

          Stack Trace:
          ${err.stack}
          `,
      });
      throw err;
    }

    // Clean output
    // console.log("groq output", result)

    const tokenUsage = {
      prompt: result?.usage?.prompt_tokens,
      completion: result?.usage?.completion_tokens,
      total: result?.usage?.total_tokens,
    };

    console.log("🔢 Token Usage:", tokenUsage);
    let rawText = result?.choices?.[0]?.message?.content?.trim() || "";
    rawText = rawText.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(rawText);
      return {
        data: parsed,
        tokenUsage,
      };
      // return guardAIOutput({role, output: parsed});
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);

      // Send Failure Email
      await sendEmail({
        to: process.env.EMAIL_LLM || "vsaijayesh94@gmail.com",
        subject: `⚠️ LLM INVALID JSON – ${role}`,
        text: `
          ❌ JSON PARSE FAILED

          Error:
          ${err.message}

          Model: ${modelName}
          Max Tokens: ${process.env.GROQ_MAX_TOKENS}

          Finish Reason:
          ${result?.choices?.[0]?.finish_reason}

          Token Usage:
          ${JSON.stringify(tokenUsage, null, 2)}

          Raw LLM Output:
          ${rawText}

          Prompt Preview:
          ${prompt?.system?.substring(0, 500) || ""}\n\n${prompt?.user?.substring(0, 500) || ""}
          `,
      });

      return null; // or handle gracefully
    }
  } catch (error) {
    console.error("❌ Unexpected LLM error:", error.message);

    // Send Failure Email
    await sendEmail({
      to: process.env.EMAIL_LLM || "vsaijayesh94@gmail.com",
      subject: `⚠️ LLM UNEXPECTED ERROR – ${role}`,
      text: `
        🚨 UNEXPECTED ERROR IN extractAIText()

        Time: ${new Date().toISOString()}
        Environment: ${process.env.NODE_ENV}

        Error Message:
        ${error.message}

        Stack Trace:
        ${error.stack}

        Role:
        ${role}

        Model:
        ${modelName}

        Max Tokens:
        ${process.env.GROQ_MAX_TOKENS}

        Prompt Length (chars):
        ${(prompt?.system?.length ?? 0) + (prompt?.user?.length ?? 0) || "N/A"}

        Extra Payload:
        ${JSON.stringify(extra, null, 2)}
        `,
    });

    return null;
  }
};
