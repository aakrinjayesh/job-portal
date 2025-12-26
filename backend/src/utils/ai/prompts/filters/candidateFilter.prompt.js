// export const aiCandidatefilterPrompt = (filterText) => {
//   return `
// You are an advanced AI that extracts ONLY specific candidate filter fields from natural language text.

// The user may provide:
// - A full sentence like: "I am looking for a candidate with apex skills and sales cloud experience"
// - Or very short / minimal text like: "shruti", "apex", "service cloud", "rahul lwc"
// Your job is to intelligently determine what type of information the user provided, and map it ONLY to the allowed fields.

// Your task is to analyze the text and produce a JSON object containing ONLY the following fields.  
// If a field is not found, set it to null.  
// If the text contains no relevant information at all, return null for every field.

// ### ALLOWED OUTPUT FIELDS (STRICT)
// {
//   "name": string | null,
//   "title": string | null,
//   "skills": string[] | null,
//   "clouds": string[] | null,
//   "preferredLocation": string[] | null,
//   "joiningPeriod": string | null,

// }

// ### EXTRACTION BEHAVIOR

// 1. **Extract ONLY these fields. Never add any new fields.**

// 2. **User may enter a single word or a short phrase.**  
//    You MUST detect whether it represents:
//    - a **name** (e.g., "shruti", "rahul", "jay"),  
//    - a **skill** (e.g., "apex", "lwc", "javascript"),  
//    - a **cloud** (e.g., "sales cloud", "service cloud"),  
//    - a **title** (e.g., "developer", "qa engineer").
//    - a **preferredLocation** (e.g., "bangalore", "hydrabad").   

//    Example:  
//    - "shruti" → { name: "shruti" }  
//    - "apex" → { skills: ["apex"] }  
//    - "sales cloud" → { clouds: ["Sales Cloud"] }  
//    - "rahul lwc" → name: "rahul", skills: ["lwc"]
//    - "bangalore" → { preferredLocation: ["bangalore] }

// 3. **Name**: Extract only if the text clearly refers to a person name (shorthand allowed).

// 4. **Title**: Extract job titles like "Salesforce Developer", "QA Engineer", etc.

// 5. **Skills**: Extract skill names (Apex, LWC, SOQL, JavaScript, etc.).  
//    Shorthand allowed: "apex lwc flows" → ["apex", "lwc", "flows"]

// 6. **Clouds**: Extract clouds (Sales Cloud, Service Cloud, Marketing Cloud, etc.).  
//    Fuzzy matches allowed:  
//    - "salse cloude" → "Sales Cloud"

// 7. **Preferred Location**: Extract any location the user prefers.


// 8. **Joining Period**: Extract periods like "Immediate", "15 days", "1 week".



// ### CRITICAL RULES
// - If nothing relevant is in the text → return ALL FIELDS AS NULL.  
// - Do NOT hallucinate.  
// - Do NOT assume anything not clearly present.  
// - Output **ONLY raw JSON**, no markdown or explanation.

// ### USER INPUT:
// ${filterText}
// `;
// };


// export const aiCandidatefilterPrompt = (filterText) => {
//   return `
// SYSTEM ROLE: Advanced AI for extracting specific candidate filter fields from natural language text.
// OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

// USER INPUT TEXT TO PARSE: ${filterText}

// JSON SCHEMA (include ALL keys exactly as shown):
// {
//   "name": string|null,
//   "title": string|null,
//   "skills": string[]|null,
//   "clouds": string[]|null,
//   "preferredLocation": string[]|null,
//   "joiningPeriod": string|null
// }

// CRITICAL EXTRACTION RULES:

// 1. INPUT ANALYSIS:
//    - Analyze the text to determine what type of information is provided.
//    - Text may be full sentences, short phrases, or single words.
//    - You must detect information type from minimal input.

// 2. NAME EXTRACTION:
//    - Extract only if text clearly refers to a person's name.
//    - Capitalize names properly (first letter uppercase, rest lowercase).
//    - If ambiguous or could be interpreted as something else, set to null.

// 3. TITLE EXTRACTION:
//    - Extract job titles and professional roles.
//    - Standardize format with proper capitalization.
//    - Remove unnecessary prefixes if they appear standalone.

// 4. SKILLS EXTRACTION:
//    - Extract technical skills and programming languages.
//    - Extract software tools and technologies.
//    - Capitalize skill names appropriately.
//    - Remove duplicate entries.

// 5. CLOUDS EXTRACTION:
//    - Extract only Salesforce platform products and clouds.
//    - Use proper naming conventions for Salesforce products.
//    - Apply fuzzy matching for misspelled cloud names.
//    - Remove duplicate entries.

// 6. PREFERRED LOCATION EXTRACTION:
//    - Extract city names, regions, and location references.
//    - Capitalize location names properly.
//    - Remove prepositions and location indicators.

// 7. JOINING PERIOD EXTRACTION:
//    - Extract availability timelines and notice periods.
//    - Normalize to standard joining period formats.
//    - Convert various date formats to standardized values.

// 8. MULTIPLE ENTITIES HANDLING:
//    - A single text may contain multiple entity types.
//    - Extract each entity type separately when present.
//    - Do not merge different entity types.

// 9. AMBIGUITY RESOLUTION:
//    - When text is ambiguous between multiple interpretations, set field to null.
//    - Do not make assumptions about unclear references.
//    - Prioritize clear, unambiguous extraction.

// 10. DATA VALIDATION:
//     - If text contains no relevant information for any field, set all fields to null.
//     - Do not extract information that is not clearly present.
//     - Empty or irrelevant text results in null fields.

// DEFAULTS:
// - All fields default to null when no relevant information is found.
// - Do not use empty arrays - use null instead for missing array fields.

// IF UNCERTAIN: Use null. Do not guess or assume.
// OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT.
// `;
// };


export const aiCandidatefilterPrompt = (filterText) => {
  return `
SYSTEM ROLE: Strict AI for extracting candidate filter fields ONLY when they are EXPLICITLY stated.

OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

USER INPUT TEXT TO PARSE: ${filterText}

JSON SCHEMA (include ALL keys exactly as shown):
{
  "name": string|null,
  "title": string|null,
  "skills": string[]|null,
  "clouds": string[]|null,
  "preferredLocation": string[]|null,
  "joiningPeriod": string|null
}

CRITICAL EXTRACTION RULES (STRICT):

⚠️ ABSOLUTE RULE:
DO NOT infer, derive, assume, or auto-fill any field.
ONLY extract information that is explicitly written in the input text.

---

1. INPUT ANALYSIS:
   - Text may be short, partial, or minimal.
   - Extract ONLY what is clearly and explicitly stated.

2. NAME EXTRACTION:
   - Extract ONLY if a person's name is clearly mentioned.
   - If the text refers to a role or skill, set name to null.

3. TITLE EXTRACTION:
   - Extract job titles ONLY if the text clearly refers to a role.
   - Example:
     - "role salesforce developer" → title = "Salesforce Developer"
   - Do NOT extract skills or clouds from the title.

4. SKILLS EXTRACTION (NO DERIVATION):
   - Extract skills ONLY if they are explicitly listed as skills.
   - ❌ DO NOT extract skills from job titles.
   - ❌ DO NOT infer skills from company, role, or cloud names.
   - Example:
     - "Salesforce Developer" → skills = null
     - "skills apex lwc" → skills = ["Apex", "LWC"]

5. CLOUDS EXTRACTION (NO DERIVATION):
   - Extract ONLY when a Salesforce product only is explicitly mentioned.
   - ❌ DO NOT infer clouds from skills or job titles.
   - Example:
     - "Salesforce Developer" → clouds = null
     - "experience in sales cloud" → clouds = ["Sales Cloud"]

6. PREFERRED LOCATION EXTRACTION:
   - Extract ONLY if locations are explicitly stated.
   - Do not infer remote or onsite unless clearly mentioned.

7. JOINING PERIOD EXTRACTION:
   - Extract ONLY when availability or notice period is explicitly mentioned.
   - Normalize formats if present.

8. MULTIPLE ENTITIES HANDLING:
   - Extract each field independently.
   - Presence of one field must NOT trigger another.

9. AMBIGUITY HANDLING:
   - If a value could belong to multiple fields, extract NONE.
   - When in doubt → null.

10. DATA VALIDATION:
    - If a field is not explicitly mentioned, set it to null.
    - Do not use empty arrays — use null instead.

DEFAULT BEHAVIOR:
- No inference
- No assumptions
- No enrichment
- Literal extraction only

IF IT IS NOT CLEARLY WRITTEN → USE null.

OUTPUT ONLY THE JSON OBJECT. NOTHING ELSE.
`;
};
