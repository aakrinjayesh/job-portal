// export const aiJobfilterPrompt = (filterText) => {
//   return `
// You are an advanced AI that extracts ONLY specific job-related filter fields from natural language text.

// The user may provide:
// - Full sentences (e.g., "Looking for a Salesforce Developer with 3 years experience and Apex skills")
// - Short or single-word inputs (e.g., "QA", "3 years", "apex", "contract")
// You MUST intelligently identify which job filter fields the text refers to.

// Output MUST be a JSON object with the exact fields below.  
// If a field is not found, return it as null.  
// If no relevant information is found → return all fields as null.

// ------------------------------------------
// ### STRICT OUTPUT FIELDS
// {
//   "role": string | null,
//   "employmentType": string | null,      // FullTime, PartTime, Contract, Freelancer
//   "companyName": string | null,
//   "experience": {
//       "type": "year" | "month" | null,
//       "number": string | null
//   },
//   "salary": string | null,             // Always string; if range like "10-20", return "10"
//   "skills": string[] | null,
//   "clouds": string[] | null
//   "location": string | null
// }
// ------------------------------------------

// ### EXTRACTION RULES

// 1. **ONLY these fields may be returned. Never add new fields.**

// 2. **Role**
//    - Extract job roles (e.g., “Salesforce Developer”, “QA Engineer”, “Frontend developer”)
//    - Single-word roles like “developer”, “QA”, “tester” are allowed
//    - If multiple appear, choose the strongest match

// 3. **Employment Type**
//    Allowed values:
//    - FullTime
//    - PartTime
//    - Contract
//    - Freelancer

//    Detect variations:
//    - “full time” → FullTime  
//    - “contractual”, “contract basis” → Contract  
//    - “freelance / freelancer” → Freelancer  

// 4. **Company Name**
//    - Extract ONLY explicit company names (TCS, Accenture, Infosys, Google, etc.)
//    - Do NOT infer names like "MNC" or "startup"

// 5. **Experience**
//    Format:
//    {
//      "type": "year" | "month",
//      "number": number
//    }

//    Rules:
//    - Support "years" & "months"
//    - If a range is given (e.g. "3–5 years"), take ONLY the MIN value → 3
//    - If only "3" is provided but context implies experience → treat as 3 years

// 6. **Salary**
//    - Always return salary as a string
//    - If range is provided (e.g., "10-20 LPA"), return ONLY the minimum → "10"
//    - If currency appears, KEEP it (“10 LPA”, “5k USD”)
//    - If number only → return number as string

// 7. **Skills**
//    - Extract individual skills
//    - Split shorthand: "apex lwc soql" → ["apex", "lwc", "soql"]
//    - Auto-correct minor spelling mistakes

// 8. **Clouds**
//    - Extract clouds like: Sales Cloud, Service Cloud, Marketing Cloud
//    - Auto-correct fuzzy matches:
//      - “salse cloude” → Sales Cloud
//      - “srvc cloud” → Service Cloud

// 9. **Short or Single-Word Input**
//    Must detect intent:
//    - "apex" → skills
//    - "sales cloud" → clouds
//    - "3 year" → experience
//    - "contract" → employmentType
//    - "tcs" → companyName
//    - "developer" → role

// 10. **If nothing relevant is found**
// Return:

// {
//   "role": null,
//   "employmentType": null,
//   "companyName": null,
//   "experience": { "type": null, "number": null },
//   "salary": null,
//   "skills": null,
//   "clouds": null
//   "location": null
// }

// ### OUTPUT FORMAT
// - Output ONLY raw JSON, no explanation, no markdown.

// ------------------------------------------
// ### USER INPUT:
// ${filterText}
// ------------------------------------------
// `;
// };


// export const aiJobfilterPrompt = (filterText) => {
//   return `
// SYSTEM ROLE: Advanced AI for extracting specific job-related filter fields from natural language text.
// OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

// USER INPUT TEXT TO PARSE: ${filterText}

// JSON SCHEMA (include ALL keys exactly as shown):
// {
//   "role": string|null,
//   "employmentType": string|null,
//   "companyName": string|null,
//   "experience": {"type": "year"|"month"|null, "number": string|null},
//   "salary": string|null,
//   "skills": string[]|null,
//   "clouds": string[]|null,
//   "location": string|null
// }

// CRITICAL EXTRACTION RULES:

// 1. INPUT ANALYSIS:
//    - Analyze text to determine what job filter information is provided.
//    - Text may be full sentences, short phrases, or single words.
//    - Detect information type from minimal input.

// 2. ROLE EXTRACTION:
//    - Extract job titles and professional roles.
//    - Standardize format with proper capitalization.
//    - Remove special characters from role names.

// 3. EMPLOYMENT TYPE EXTRACTION:
//    - Extract and normalize employment type.
//    - Valid values only: "FullTime", "PartTime", "Contract", "Freelancer"
//    - Normalize variations to these standard values.

// 4. COMPANY NAME EXTRACTION:
//    - Extract only explicit company names.
//    - Do not infer or assume company names.
//    - Capitalize company names properly.

// 5. EXPERIENCE EXTRACTION:
//    - Extract experience duration from text.
//    - "type" field: "year" or "month" based on unit mentioned.
//    - "number" field: string representation of the experience duration.
//    - If range is provided, use the minimum value.
//    - If no unit specified, default to "year".

// 6. SALARY EXTRACTION:
//    - Extract salary information as string.
//    - If range provided, extract the minimum value.
//    - Include currency or unit indicators when present.
//    - Do not convert or normalize currency values.

// 7. SKILLS EXTRACTION:
//    - Extract technical skills and tools.
//    - Capitalize skill names appropriately.
//    - Remove duplicate entries.

// 8. CLOUDS EXTRACTION:
//    - Extract only Salesforce platform products and clouds.
//    - Use proper naming conventions for Salesforce products.
//    - Apply fuzzy matching for misspelled cloud names.
//    - Remove duplicate entries.

// 9. LOCATION EXTRACTION:
//    - Extract geographic location references.
//    - Capitalize location names properly.
//    - Remove prepositions and location indicators.

// 10. MULTIPLE ENTITIES HANDLING:
//     - A single text may contain multiple filter criteria.
//     - Extract each field type separately when present.
//     - Do not merge different field types.

// 11. AMBIGUITY RESOLUTION:
//     - When text is ambiguous between multiple interpretations, set field to null.
//     - Do not make assumptions about unclear references.
//     - Prioritize clear, unambiguous extraction.

// 12. DATA VALIDATION:
//     - If text contains no relevant information for any field, set all fields to null.
//     - Empty arrays should be null, not empty arrays.
//     - Do not extract information that is not clearly present.

// DEFAULTS:
// - Missing strings: null
// - Missing arrays: null
// - Missing objects: {"type": null, "number": null} for experience
// - All fields default to null when no relevant information is found

// IF UNCERTAIN: Use null. Do not guess or assume.
// OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT.
// `;
// };


export const aiJobfilterPrompt = (filterText) => {
  return `
SYSTEM ROLE: Strict job filter extraction AI.
TASK: Extract ONLY explicitly stated fields from text. No inference. No assumptions.

OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

USER INPUT TEXT:
${filterText}

JSON SCHEMA (ALL keys required):
{
  "role": string|null,
  "employmentType": string|null,
  "companyName": string|null,
  "experience": {"type": "year"|"month"|null, "number": string|null},
  "salary": string|null,
  "skills": string[]|null,
  "clouds": string[]|null,
  "location": string|null
}

========================
STRICT GLOBAL RULE
========================
A field MUST be null unless the value is EXPLICITLY written in the input text.
DO NOT infer fields from related words, platforms, skills, or context.

========================
FIELD RULES
========================

1. ROLE
- Extract ONLY if an explicit job title appears (e.g. "Salesforce Developer").
- ❌ DO NOT infer role from Salesforce, Apex, clouds, or skills.
- If no explicit title → null.

2. EMPLOYMENT TYPE
- Extract ONLY if explicitly mentioned.
- Valid values ONLY:
  "FullTime", "PartTime", "Contract", "Freelancer"
- ❌ No defaults.
- ❌ No inference.
- If not written → null.

3. EXPERIENCE
- Extract ONLY if a number + unit is explicitly present (e.g. "3 years", "6 months").
- ❌ DO NOT infer experience from skills or clouds.
- ❌ DO NOT default to 1 year.
- If absent → {"type": null, "number": null}

4. COMPANY NAME
- Extract ONLY explicit company names.
- ❌ No guessing.
- If absent → null.

5. SALARY
- Extract ONLY explicitly written salary values.
- normalization to only number no prefix.
- If absent → null.

6. SKILLS
- Extract explicitly mentioned technical skills.
- Apex is ALWAYS a SKILL.
- Examples of valid Salesforce skills:
  Apex, LWC, Aura, SOQL, SOSL, Visualforce
- Capitalize properly.
- Remove duplicates.
- If none explicitly stated → null.

7. CLOUDS (VERY IMPORTANT)
- Extract ONLY Salesforce PRODUCTS (not skills, not platform name).
- Allowed examples:
  Sales Cloud
  Service Cloud
  Marketing Cloud
  Experience Cloud
  Commerce Cloud
  App Cloud
  Analytics Cloud
  Health Cloud
  Financial Services Cloud

- ❌ "Salesforce" alone is NOT a cloud.
- ❌ Apex is NOT a cloud.
- ❌ LWC, SOQL, Aura are NOT clouds.
- Apply fuzzy matching ONLY to cloud names.
- If no valid Salesforce product is explicitly mentioned → null.

8. LOCATION
- Extract explicitly mentioned geographic locations.
- Remove prepositions like "in", "at", "located in".
- Capitalize properly.
- If absent → null.

========================
DATA VALIDATION
========================
- Empty arrays MUST be null.
- Do NOT auto-fill any field.
- If uncertain → null.

FINAL OUTPUT:
Return ONLY the JSON object.
`;
};

