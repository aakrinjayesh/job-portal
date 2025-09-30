import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCj3C19RXKxE1XoVuurPN95F3JH6-Z2OCU"); // set API key in .env
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const extractResumeSections = async (text) => {
  console.log('inside llm logic')
  const prompt = `
  You are extracting structured candidate details from a resume. Parse the text and return ONLY valid JSON (no code fences, no explanations) with the following exact keys:
  - preferredLocation: string | null
  - preferredJobType: string[]  // Allowed values: "FullTime", "Contract", "Freelance". Max 2 items.
  - currentCTC: string | null   // Keep as string, preserve currency if present
  - expectedCTC: string | null  // Keep as string, preserve currency if present
  - rateCardPerHour: string | null // For freelance, keep as string with currency if present
  - joiningPeriod: string | null // e.g., "15 days", "Immediate", "2 months"
  - totalExperience: string | null // e.g., "6 years", "3.5 years"
  - relevantSalesforceExperience: string | null // e.g., "4 years"
  - skills: string[]
  - certifications: string[]
  - workExperience: string[] // Bullet points or role summaries

  If a field is not found, set it to null (for strings) or an empty array (for lists). Normalize preferredJobType values to exactly these strings when possible: "FullTime", "Contract", "Freelance". Do not include any extra fields.

  Example output:
  {
    "preferredLocation": "Bengaluru, India",
    "preferredJobType": ["FullTime", "Contract"],
    "currentCTC": "₹18 LPA",
    "expectedCTC": "₹24–28 LPA",
    "rateCardPerHour": null,
    "joiningPeriod": "30 days",
    "totalExperience": "6.5 years",
    "relevantSalesforceExperience": "4 years",
    "skills": ["Salesforce", "Apex", "LWC", "REST APIs"],
    "certifications": ["Salesforce Platform Developer I"],
    "workExperience": [
      "Senior Salesforce Developer at Acme Corp (2021–Present): Led LWC migration and Apex integrations.",
      "Salesforce Developer at Beta Ltd (2018–2021): Built custom triggers and flows."
    ]
  }

  Resume Text:
  ${text}
  `;

  const result = await model.generateContent(prompt);
  let rawText = result.response.text().trim();
  rawText = rawText.replace(/```json|```/g, '').trim();

  // Try parsing JSON safely
  try {
    const parsed = JSON.parse(rawText);

    // Light normalization/safeguards
    const preferredJobType = Array.isArray(parsed.preferredJobType) ? parsed.preferredJobType.slice(0, 2) : [];

    return {
      preferredLocation: parsed.preferredLocation ?? null,
      preferredJobType,
      currentCTC: parsed.currentCTC ?? null,
      expectedCTC: parsed.expectedCTC ?? null,
      rateCardPerHour: parsed.rateCardPerHour ?? null,
      joiningPeriod: parsed.joiningPeriod ?? null,
      totalExperience: parsed.totalExperience ?? null,
      relevantSalesforceExperience: parsed.relevantSalesforceExperience ?? null,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
      raw: undefined
    };
  } catch {
    return {
      preferredLocation: null,
      preferredJobType: [],
      currentCTC: null,
      expectedCTC: null,
      rateCardPerHour: null,
      joiningPeriod: null,
      totalExperience: null,
      relevantSalesforceExperience: null,
      skills: [],
      certifications: [],
      workExperience: [],
      raw: rawText
    };
  }
};
