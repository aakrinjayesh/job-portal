import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSysPrompt } from "./systemPrompt.js";

const genAI = new GoogleGenerativeAI("AIzaSyCj3C19RXKxE1XoVuurPN95F3JH6-Z2OCU"); // set API key in .env
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const extractResumeSections = async (text) => {
  console.log('inside llm logic')
 const prompt = getSysPrompt(text); // check  the systemprompth file for the prompt

  const result = await model.generateContent(prompt);
  let rawText = result.response.text().trim();
  rawText = rawText.replace(/```json|```/g, '').trim();

  const toArray = (value) => Array.isArray(value) ? value : [];
  // Function to safely check if value is a finite number, otherwise null
  const toNumber = (value) => typeof value === 'number' && isFinite(value) ? value : null;


  // Try parsing JSON safely
  try {
    const parsed = JSON.parse(rawText);

    // Light normalization/safeguards
    const preferredJobType = Array.isArray(parsed.preferredJobType) ? parsed.preferredJobType.slice(0, 2) : [];

    return {
      profilePicture: parsed.profilePicture ?? null,
      title: parsed.title ?? null,
      currentCTC: parsed.currentCTC ?? null,
      expectedCTC: parsed.expectedCTC ?? null,
      rateCardPerHour: parsed.rateCardPerHour ?? null,
      joiningPeriod: parsed.joiningPeriod ?? null,
      totalExperience: toNumber(parsed.totalExperience),
      relevantSalesforceExperience: toNumber(parsed.relevantSalesforceExperience),
      linkedInUrl: parsed.linkedInUrl ?? null,
      trailheadUrl: parsed.trailheadUrl ?? null,
      preferredLocation: toArray(parsed.preferredLocation),
      preferredJobType,
      skillsJson: toArray(parsed.skillsJson), // New key
      primaryClouds: toArray(parsed.primaryClouds), // New key
      secondaryClouds: toArray(parsed.secondaryClouds), // New key
      certifications: toArray(parsed.certifications),
      workExperience: toArray(parsed.workExperience),
      raw: undefined
    };
  } catch {
    return {
      profilePicture: null,
      title: null,
      preferredLocation: [],
      preferredJobType: [],
      currentCTC: null,
      expectedCTC: null,
      rateCardPerHour: null,
      joiningPeriod: null,
      totalExperience: null,
      relevantSalesforceExperience: null,
      skillsJson: [],
      primaryClouds: [],
      secondaryClouds: [],
      certifications: [],
      workExperience: [],
      linkedInUrl: null,
      trailheadUrl: null,
      raw: rawText
    };
  }
};
