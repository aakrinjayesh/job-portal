export const aiUnifiedFilterPrompt = (inputText) => {
  return `
SYSTEM ROLE:
Ultra-strict extraction AI for Job Descriptions OR Candidate Resumes.

TASK:
Extract ONLY explicitly written information.
Apply NORMALIZATION rules ONLY when the source value itself is explicit.
NO inference. NO assumptions. NO enrichment.

OUTPUT FORMAT:
ONLY valid JSON.
NO explanations.
NO markdown.
NO code fences.

INPUT TEXT:
${inputText}

========================
ABSOLUTE GLOBAL RULE
========================
If a value is NOT explicitly written → use null.
Normalization is allowed ONLY on extracted values, NEVER to create values.

========================
ENTITY TYPE (LABEL ONLY)
========================
Set "entityType":
- "job" → if company name OR employment type OR salary is explicitly written.
- "candidate" → if person name OR joining period is explicitly written.
- null → if unclear or mixed.

This label MUST NOT trigger field extraction.

========================
JSON SCHEMA (ALL KEYS REQUIRED)
========================
{
  "entityType": "job" | "candidate" | null,

  "name": string | null,
  "title": string | null,
  "companyName": string | null,

  "employmentType": "FullTime" | "PartTime" | "Contract" | "Freelancer" | null,

  "experience": {
    "type": "year" | "month" | null,
    "number": string | null
  },

  "salary": string | null,

  "skills": string[] | null,
  "clouds": string[] | null,

  "location": string[] | null,

  "joiningPeriod": string | null
}

========================
FIELD NORMALIZATION RULES
========================

1. NAME
- Extract ONLY if a human name is explicitly written.
- Do NOT extract emails, usernames, or company names.
- Preserve original capitalization.
- Otherwise → null.

2. TITLE
- Extract ONLY explicit job titles.
- Example:
  "role salesforce developer" → "Salesforce Developer"
- Do NOT infer from skills, clouds, or experience.
- Otherwise → null.

3. COMPANY NAME
- Extract ONLY explicitly written company names.
- No guessing from email domains.
- Otherwise → null.

4. EMPLOYMENT TYPE
- Extract ONLY if explicitly written.
- Normalize ONLY to these exact values:
  - "Full Time", "Full-Time" → FullTime
  - "Part Time", "Part-Time" → PartTime
  - "Contract", "Contractual" → Contract
  - "Freelancer", "Freelance" → Freelancer
- Any other wording → null.

5. EXPERIENCE
- Extract ONLY if number + unit is explicitly present.
- Normalize:
  - "years", "yrs", "yr" → type: "year"
  - "months", "mos", "mo" → type: "month"
- Keep number as STRING.
- Example:
  "3.5 years" → number: "3.5", type: "year"
- If missing → { "type": null, "number": null }

6. SALARY
- Extract ONLY explicit salary values.
- Normalize:
  - Remove currency symbols (₹, $, LPA, INR, USD)
  - Keep numbers and ranges exactly as written
- Examples:
  "₹12 LPA" → "12"
  "10-15 LPA" → "10-15"
- If unclear → null.

7. SKILLS
- Extract ONLY explicitly listed technical skills.
- Do NOT extract from titles or clouds.
- Capitalization normalization:
  Apex, LWC, Aura, SOQL, SOSL, Visualforce
- Remove duplicates.
- Empty array → null.

8. CLOUDS (STRICT)
- Extract ONLY Salesforce PRODUCT NAMES.
- Allowed list:
  Sales Cloud
  Service Cloud
  Marketing Cloud
  Experience Cloud
  Commerce Cloud
  App Cloud
  Analytics Cloud
  Health Cloud
  Financial Services Cloud

- Apply fuzzy matching ONLY to these cloud names.
- "Salesforce" alone → NOT a cloud.
- Apex, LWC, SOQL → NOT clouds.
- Empty array → null.

9. LOCATION
- Extract ONLY explicitly written locations.
- Remove prepositions like "in", "at", "located in".
- Normalize capitalization:
  "bangalore" → "Bangalore"
- Multiple allowed.
- Empty array → null.

10. JOINING PERIOD
- Extract ONLY if availability or notice period is explicitly written.
- Normalize ONLY format, not meaning:
  - "30 days notice" → "30 days"
  - "Immediate" → "Immediate"
- Do NOT infer availability.
- Otherwise → null.

========================
FINAL ENFORCEMENT
========================
- Empty arrays → null
- No cross-field inference
- Presence of one field MUST NOT affect another
- When in doubt → null

RETURN ONLY THE JSON OBJECT.
`;
};
