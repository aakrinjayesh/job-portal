import { Groq } from "groq-sdk";
import { jsonrepair } from "jsonrepair";
import { CandidateDetailsSysPrompt } from "./prompts/candidate.prompt.js";
import { recruiterSysPrompt } from "./prompts/recruiter.prompt.js";
import { cvRankerPrompt } from "./prompts/ranker.prompt.js";
import { generateJobDescriptionPrompt } from "./prompts/jd.prompt.js";
import { aiCandidatefilterPrompt } from "./prompts/filters/candidateFilter.prompt.js";
import { aiJobfilterPrompt } from "./prompts/filters/jobFilter.prompt.js";
import { aiUnifiedFilterPrompt } from "./prompts/aiUnifiedFilterPrompt.js";
import sendEmail from "../../utils/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new Groq({
  apiKey: process.env["GROQ_API_KEY"],
});

const modelName = process.env.GROQ_MODEL;
console.log("modelName", modelName);
console.log("model tokens", parseInt(process.env["GROQ_MAX_TOKENS"]));

const MAX_RETRIES = 2;

// ─── Shared HTML email style ────────────────────────────────────────────────
const emailStyle = `
  body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; color: #333; }
  .card { background: #fff; border-radius: 8px; padding: 24px; max-width: 700px; margin: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  h2 { color: #c0392b; margin-top: 0; border-bottom: 2px solid #c0392b; padding-bottom: 10px; }
  h3 { color: #555; margin: 20px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  td { padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; vertical-align: top; }
  td.label { background: #f9f9f9; font-weight: bold; width: 160px; color: #555; }
  pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 6px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  .badge-red { display: inline-block; background: #c0392b; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
  .badge-orange { display: inline-block; background: #e67e22; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
  .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
`;

const timestamp = () =>
  new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

// ─── Email: API failure ──────────────────────────────────────────────────────
const sendApiFailureEmail = async ({ role, attempt, err, inputLength }) => {
  const ts = timestamp();
  await sendEmail({
    to: process.env.EMAIL_LLM || "vsaijayesh94@gmail.com",
    subject: `🔥 [LLM API FAILURE] ${role} — attempt ${attempt}/${MAX_RETRIES}`,
    html: `
<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>${emailStyle}</style></head>
<body><div class="card">
  <h2>🔥 LLM API Failure</h2>

  <h3>📋 Failure Details</h3>
  <table>
    <tr><td class="label">Timestamp</td><td>${ts}</td></tr>
    <tr><td class="label">Type</td><td><span class="badge-red">API Error</span></td></tr>
    <tr><td class="label">Role</td><td><code>${role}</code></td></tr>
    <tr><td class="label">Attempt</td><td>${attempt} / ${MAX_RETRIES}</td></tr>
    <tr><td class="label">Model</td><td>${modelName}</td></tr>
    <tr><td class="label">Max Tokens</td><td>${process.env.GROQ_MAX_TOKENS}</td></tr>
    <tr><td class="label">Input Length</td><td>${inputLength} chars</td></tr>
    <tr><td class="label">Error</td><td><strong>${err.message}</strong></td></tr>
  </table>

  <h3>🧵 Stack Trace</h3>
  <pre>${err.stack || "No stack available"}</pre>

  <div class="footer">ForceHead AI Monitor • ${ts}</div>
</div></body></html>`,
  });
};

// ─── Email: Invalid JSON ─────────────────────────────────────────────────────
const sendInvalidJsonEmail = async ({
  role,
  attempt,
  parseErr,
  repairErr,
  rawText,
  tokenUsage,
  finishReason,
  prompt,
}) => {
  const ts = timestamp();
  await sendEmail({
    to: process.env.EMAIL_LLM || "vsaijayesh94@gmail.com",
    subject: `⚠️ [LLM INVALID JSON] ${role} — attempt ${attempt}/${MAX_RETRIES}`,
    html: `
<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>${emailStyle}</style></head>
<body><div class="card">
  <h2>⚠️ LLM Invalid JSON Response</h2>

  <h3>📋 Failure Details</h3>
  <table>
    <tr><td class="label">Timestamp</td><td>${ts}</td></tr>
    <tr><td class="label">Type</td><td><span class="badge-orange">JSON Parse + Repair Failed</span></td></tr>
    <tr><td class="label">Role</td><td><code>${role}</code></td></tr>
    <tr><td class="label">Attempt</td><td>${attempt} / ${MAX_RETRIES}</td></tr>
    <tr><td class="label">Model</td><td>${modelName}</td></tr>
    <tr><td class="label">Finish Reason</td><td>${finishReason || "—"}</td></tr>
    <tr><td class="label">Parse Error</td><td>${parseErr.message}</td></tr>
    <tr><td class="label">Repair Error</td><td>${repairErr.message}</td></tr>
  </table>

  <h3>🔢 Token Usage</h3>
  <table>
    <tr><td class="label">Prompt Tokens</td><td>${tokenUsage?.prompt ?? "—"}</td></tr>
    <tr><td class="label">Completion Tokens</td><td>${tokenUsage?.completion ?? "—"}</td></tr>
    <tr><td class="label">Total Tokens</td><td>${tokenUsage?.total ?? "—"}</td></tr>
  </table>

  <h3>📄 Raw LLM Output</h3>
  <pre>${rawText || "— empty —"}</pre>

  <h3>🧠 Prompt Preview</h3>
  <pre>${(prompt?.system?.substring(0, 500) || "") + "\n\n" + (prompt?.user?.substring(0, 500) || "")}</pre>

  <div class="footer">ForceHead AI Monitor • ${ts}</div>
</div></body></html>`,
  });
};

// ─── Email: Unexpected error ─────────────────────────────────────────────────
const sendUnexpectedErrorEmail = async ({ role, attempt, error, inputLength }) => {
  const ts = timestamp();
  await sendEmail({
    to: process.env.EMAIL_LLM || "vsaijayesh94@gmail.com",
    subject: `🚨 [LLM UNEXPECTED ERROR] ${role} — attempt ${attempt}/${MAX_RETRIES}`,
    html: `
<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>${emailStyle}</style></head>
<body><div class="card">
  <h2>🚨 Unexpected LLM Error</h2>

  <h3>📋 Error Details</h3>
  <table>
    <tr><td class="label">Timestamp</td><td>${ts}</td></tr>
    <tr><td class="label">Type</td><td><span class="badge-red">Unexpected Error</span></td></tr>
    <tr><td class="label">Role</td><td><code>${role}</code></td></tr>
    <tr><td class="label">Attempt</td><td>${attempt} / ${MAX_RETRIES}</td></tr>
    <tr><td class="label">Environment</td><td>${process.env.NODE_ENV || "—"}</td></tr>
    <tr><td class="label">Model</td><td>${modelName}</td></tr>
    <tr><td class="label">Input Length</td><td>${inputLength} chars</td></tr>
    <tr><td class="label">Error</td><td><strong>${error.message}</strong></td></tr>
  </table>

  <h3>🧵 Stack Trace</h3>
  <pre>${error.stack || "No stack available"}</pre>

  <div class="footer">ForceHead AI Monitor • ${ts}</div>
</div></body></html>`,
  });
};

// ─── Prompt builder ──────────────────────────────────────────────────────────
const buildPrompt = (text, role, extra) => {
  if (role === "candidate") return CandidateDetailsSysPrompt(text);
  if (role === "company") return recruiterSysPrompt(text);
  if (role === "cvranker") {
    const { jobDescription, candidateDetails } = extra;
    return cvRankerPrompt(jobDescription, candidateDetails);
  }
  if (role === "generatejd") return generateJobDescriptionPrompt(extra.jobdetails);
  if (role === "aicandidatefilter") return aiUnifiedFilterPrompt(extra.JD);
  if (role === "aijobfilter") return aiUnifiedFilterPrompt(extra.JD);
  throw new Error("Invalid role passed to extractResumeSections()");
};

// ─── Main AI function ────────────────────────────────────────────────────────
export const extractAIText = async (text, role, extra = {}) => {
  console.log("inside llm logic | role:", role);

  let input = text;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let prompt;
    let result;

    try {
      prompt = buildPrompt(input, role, extra);

      try {
        result = await genAI.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          temperature: 0.1,
          max_tokens: parseInt(process.env["GROQ_MAX_TOKENS"]),
        });
      } catch (apiErr) {
        console.error(`❌ LLM API Error (attempt ${attempt}):`, apiErr.message);

        await sendApiFailureEmail({
          role,
          attempt,
          err: apiErr,
          inputLength: input.length,
        });

        if (attempt < MAX_RETRIES) {
          input = input.slice(0, Math.floor(input.length * 0.7));
          console.log(`🔁 Retrying with reduced input (${input.length} chars)`);
          continue;
        }
        return null;
      }

      // Handle LLM truncation
      if (result?.choices?.[0]?.finish_reason === "length") {
        console.warn(`⚠️ LLM output truncated (attempt ${attempt})`);
        if (attempt < MAX_RETRIES) {
          input = input.slice(0, Math.floor(input.length * 0.7));
          console.log(`🔁 Retrying with reduced input (${input.length} chars)`);
          continue;
        }
      }

      const tokenUsage = {
        prompt: result?.usage?.prompt_tokens,
        completion: result?.usage?.completion_tokens,
        total: result?.usage?.total_tokens,
      };

      console.log("🔢 Token Usage:", tokenUsage);

      let rawText = result?.choices?.[0]?.message?.content?.trim() || "";
      rawText = rawText.replace(/```json|```/g, "").trim();

      // Try standard JSON parse first
      try {
        const parsed = JSON.parse(rawText);
        return { data: parsed, tokenUsage };
      } catch (parseErr) {
        console.warn(`⚠️ JSON parse failed (attempt ${attempt}), trying jsonrepair...`);

        try {
          const repaired = JSON.parse(jsonrepair(rawText));
          console.log("✅ jsonrepair recovered valid JSON");
          return { data: repaired, tokenUsage };
        } catch (repairErr) {
          console.error("❌ jsonrepair also failed:", repairErr.message);

          await sendInvalidJsonEmail({
            role,
            attempt,
            parseErr,
            repairErr,
            rawText,
            tokenUsage,
            finishReason: result?.choices?.[0]?.finish_reason,
            prompt,
          });

          if (attempt < MAX_RETRIES) {
            input = input.slice(0, Math.floor(input.length * 0.7));
            console.log(`🔁 Retrying with reduced input (${input.length} chars)`);
            continue;
          }

          return null;
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected LLM error (attempt ${attempt}):`, error.message);

      await sendUnexpectedErrorEmail({
        role,
        attempt,
        error,
        inputLength: input.length,
      });

      if (attempt < MAX_RETRIES) {
        input = input.slice(0, Math.floor(input.length * 0.7));
        console.log(`🔁 Retrying with reduced input (${input.length} chars)`);
        continue;
      }

      return null;
    }
  }

  return null;
};
