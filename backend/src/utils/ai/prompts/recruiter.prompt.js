// export const recruiterSysPrompt = (text) => `
// You are extracting structured recruiter-related information from a resume text. Parse the text and return **ONLY valid JSON**...

// ### **Updated JSON Schema & Data Type Compliance**

// | Key | Data Type | Notes & Normalization Rules | Default Value |
// | :--- | :--- | :--- | :--- |
// | **role** | \`string | null\` | Job title or designation and **remove all special characters** (only letters, numbers, spaces allowed)| \`null\` |
// | **description** | \`string | null\` | Full job description text. | \`null\` |
// | **employmentType** | \`string | null\` | Normalize into: **"FullTime"**, **"PartTime"**, **"Contract"**. | \`null\` |
// | **experience** | \`object | null\` | Must contain: **number: int**, **type: "year" | "month"** | \`{ "number": 0, "type": year }\` |
// | **experienceLevel** | \`string | null\` | One of: **"Internship"**, **"EntryLevel"**, **"Mid"**, **"Senior"**, **"Lead"** | \`null\` |
// | **location** | \`string | null\` | Job location | \`null\` |
// | **skills** | \`string[]\` | List of skills | \`[]\` |
// | **salary** | \`number\` | Numeric annual salary | \`0\` |
// | **companyName** | \`string | null\` | Hiring company | \`null\` |
// | **responsibilities** | \`string | null\` | A single concatenated string of responsibilities | \`null\` |
// | **qualifications** | \`string[]\` | Required qualifications | \`[]\` |
// | **jobType** | \`string | null\` | One of **"Onsite"**, **"Remote"**, **"Hybrid"** | \`null\` |
// | **status** | \`string | null\` | Default = "Open" | \`"Open"\` |
// | **applicationDeadline** | \`string | null\` | Format: YYYY-MM-DD | \`null\` |

// ---

// ### **Extraction & Normalization Rules**

// 1. **Output Format:**  
//    - Return **only the JSON object**, no markdown, no explanation.

// 2. **Default Values:**  
//    - Missing fields must use defaults defined above.

// 3. ** ROLE (UPDATED RULE)**
// - Extract the job title  
// - **Remove all special characters**  
// - Keep **only letters, numbers, spaces**  
// - Collapse multiple spaces into a single space  
// - Trim leading/trailing spaces 

// 4. **Experience Parsing (UPDATED):**
//    - Extract experience like:  
//      - "3 years" → \`{ "number": 3, "type": "year" }\`
//      - "5 months" → \`{ "number": 5, "type": "month" }\`
//      - "2-5 years" → number = lower bound → \`{ "number": 2, "type": "year" }\`
//    - If unit not clear: default \`type = "year"\`
//    - If nothing found:  
//      \`{ "number": 0, "type": null }\`

// 5. **Responsibilities (UPDATED):**
//    - **Extract the responsibilities block EXACTLY as found**  
//    - Preserve:
//      - Bullet points  
//      - New lines  
//      - Hyphens  
//      - Formatting  
//      - Capitalization  
//    - No splitting, no merging, no cleaning.

// 6. Extract only education-related requirements, such as:
//    - Degrees (B.Tech, M.Tech, BSc, MSc, PhD)
//    - Fields of study (Computer Science, Electrical Engineering)
//    - Minimum education requirement (Bachelor’s required)
//    - GPA requirements
//    - Graduation year requirements
//    - Academic eligibility criteria

//     ❌ Do NOT include:
//    - Skills
//    - Responsibilities
//    - Tools
//    - Certifications

// 7. **Normalization Rules:**

//    **employmentType:**  
//    - "full time", "permanent", "regular", "ft" → **"FullTime"**  
//    - "part time", "pt" → **"PartTime"**  
//    - "contract", "contractual", "consultant", "temp" → **"Contract"**

//    **experienceLevel:**  
//    - "intern" → **Internship**  
//    - "entry", "junior", "fresher", "<3 years" → **EntryLevel**  
//    - "mid", "3-6 years" → **Mid**  
//    - "senior", "7+ years" → **Senior**  
//    - "lead", "principal" → **Lead**

//    **jobType:**  
//    Normalize to **"Onsite"**, **"Remote"**, or **"Hybrid"**

//    **salary:**  
//    - Remove ₹, $, commas, "LPA", etc.
//    - Extract digits only.

//    **applicationDeadline:**  
//    - If partial, convert to closest valid date  
//    - Else → null


// 8. **Skills Extraction:**  
//    - Extract all technical terms  
//    - No duplicates  
//    - Clean array of strings

// 9. **Status:**  
//    - Default = "Open"

// ---

// ### **STRICT OUTPUT RULE**
// Return **only valid JSON**.  
// No markdown. No commentary.

// ---

// ### **Resume Text (Unstructured):**
// ${text}
// `;

export const recruiterSysPrompt = (text) => `
SYSTEM ROLE: Expert recruiter job description parser and data normalizer.
OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

JOB DESCRIPTION TEXT TO PARSE: ${text}

JSON SCHEMA (include ALL keys exactly as shown):
{
  "role": string|null,
  "description": string|null,
  "employmentType": string|null, // "FullTime", "PartTime", "Contract" only
  "experience": {"number": number, "type": "year"|"month"|null},
  "experienceLevel": string|null, // "Internship", "EntryLevel", "Mid", "Senior", "Lead" only
  "location": string|null,
  "skills": string[],
  "clouds": string[], // Salesforce products only
  "salary": number,
  "companyName": string|null,
  "responsibilities": string|null,
  "qualifications": string[],
  "jobType": string|null, // "Onsite", "Remote", "Hybrid" only
  "status": string, // Default: "Open"
  "applicationDeadline": string|null // Format: "YYYY-MM-DD"
}

CRITICAL NORMALIZATION RULES:

1. ROLE EXTRACTION:
   - Extract job title/designation from the job description.
   - Remove ALL special characters (keep only letters, numbers, spaces).
   - Collapse multiple spaces into single space.
   - Trim leading/trailing spaces.
   - If no clear role found → null.

2. EXPERIENCE PARSING:
   - "3 years" → {"number": 3, "type": "year"}
   - "5 months" → {"number": 5, "type": "month"}
   - "2-5 years" → Use lower bound: {"number": 2, "type": "year"}
   - "3+ years" → {"number": 3, "type": "year"}
   - If unit not specified → type: "year"
   - If not found → {"number": 0, "type": "year"}
   - Based on experienceLevel set the number 

3. DESCRIPTION EXTRACTION:
   - Extract the full job description text as found in the job posting.
   - Look for sections with headings like: "Description", "Purpose", "Overview", "Summary", "Job Summary", "Role Summary", "Position Summary", "About the Role", "Job Purpose", "Objective", "Introduction", "Main purpose of the role", etc.
   - Remove redundant prefixes like "Job Description:", "Description:", "Overview:", "Summary:", "Main purpose of the role:" from the beginning of extracted text.
   - If "Main purpose of the role" section exists, use it as primary description.
   - For the given example text, extract from "Main purpose of the role" through the entire meaningful content.
   - PRESERVE all meaningful formatting including paragraphs and bullet points.
   - DO NOT truncate or summarize - include the complete description text.
   - DO NOT clean, split, or merge content beyond fixing OCR issues as per Rule 15.
   - Remove any markdown formatting but keep the textual content intact.
   - Preserve new lines using \`\n\` format.
   - If no proper description section is found but job details exist in the text, read the entire text and create a detailed summary by capturing the main purpose of the role.
   - If absolutely no job details found → null.

4. RESPONSIBILITIES:
   - Extract responsibilities block EXACTLY as found in text.
   - Look for sections with headings: "Key responsibilities", "Responsibilities", "Accountabilities", "Key responsibilities / accountabilities", "Duties", etc.
   - For the given example, extract from "Key responsibilities / accountabilities" section including all bullet points.
   - PRESERVE all formatting: bullet points, new lines, hyphens, capitalization.
   - DO NOT clean, split, or merge content beyond fixing OCR issues as per Rule 15.
   - Preserve new lines using \`\n\` format.
   - If multiple responsibility sections exist, combine them.
   - If no responsibilities section → null.


5. QUALIFICATIONS EXTRACTION:
   - Extract ONLY education-related requirements:
     * Degrees: "B.Tech", "M.Tech", "BSc", "MSc", "PhD", "Bachelor's", "Master's"
     * Fields of study: "Computer Science", "Electrical Engineering"
     * Minimum education: "Bachelor's required", "Graduate"
     * GPA requirements: "3.0 GPA", "First Class"
     * Graduation year: "2023 or later", "Recent graduate"
     * Academic eligibility criteria
   - DO NOT INCLUDE:
     * Skills, Tools, Certifications
     * Work experience requirements
     * Job responsibilities

6. EMPLOYMENT TYPE NORMALIZATION:
   - "full time", "permanent", "regular", "ft" → "FullTime"
   - "part time", "pt" → "PartTime"
   - "contract", "contractual", "consultant", "temp" → "Contract"

7. EXPERIENCE LEVEL NORMALIZATION:
   - "intern", "internship" → "Internship"
   - "entry", "junior", "fresher", "associate", "<3 years", "0-2 years" → "EntryLevel"
   - "mid", "mid-level", "3-6 years", "4-7 years" → "Mid"
   - "senior", "7+ years", "8+ years", "experienced" → "Senior"
   - "lead", "principal", "manager", "architect" → "Lead"

8. JOB TYPE NORMALIZATION:
   - "onsite", "office", "in-office" → "Onsite"
   - "remote", "work from home", "wfh" → "Remote"
   - "hybrid", "flexible", "partial remote" → "Hybrid"

9. SALARY EXTRACTION:
   - Remove all currency symbols (₹, $, €, etc.)
   - Remove "LPA", "per annum", "annual", "lakhs", etc.
   - Remove commas and spaces.
   - Extract numeric value only.
   - If no salary Found set to 0

10. SKILLS EXTRACTION:
   - Extract all technical terms mentioned in skills/requirements section.
   - Remove duplicates.
   - Capitalize first letter where appropriate (e.g., "Apex", not "apex").
   - Clean array of strings.

11. CLOUDS EXTRACTION:
   - Look for explicit mentions of Salesforce clouds/products in requirements.
   - Standardize naming:
      * "SFDC", "Salesforce.com" → "Platform"
      * "Community Cloud" → "Experience Cloud"
      * "Pardot" → "Marketing Cloud"
      * "Tableau CRM" → "CRM Analytics"
      * "FSL" → "Field Service Lightning"
      * "CPQ" → Include as is
   - Capitalize properly (e.g., "Sales Cloud", not "sales cloud")
   - Remove duplicates.
12. APPLICATION DEADLINE:
    - Convert to "YYYY-MM-DD" format.
    - If partial date (e.g., "15th Dec"): use current year → "2024-12-15"
    - If only month/year: use first day → "2024-12-01"
    - If not found → null.

13. STATUS:
    - Default: "Open"
    - Only change if explicitly mentioned as "Closed", "Filled", etc.
   
14. DATA CLEANING:
    - Remove markdown, asterisks, excessive whitespace from extracted text fields.
    - For role field: remove prefixes like "Senior", "Junior", "Lead" only if they're part of the job title (keep "Senior Salesforce Developer").
    - For companyName: remove "Inc.", "Ltd.", "Pvt. Ltd." suffixes unless essential.

15. TEXT CLEANING FOR OCR/FORMATTING ISSUES:
   - Remove random spaces within words (e.g., "D escription" → "Description", "Re lease" → "Release").
   - Fix split words that should be together (e.g., "manag ing" → "managing", "optimis ing" → "optimising").
   - Remove duplicate words and phrases caused by OCR errors.
   - Fix broken words: "cro ss" → "cross", "A cro ss" → "Across".
   - Remove page headers and footers like "Confidential Job Description:" on each page.
   - Remove page numbers and section markers (e.g., "Date: July 2025 1", "Date: July 2025 2").
   - Fix hyphenated words that are incorrectly split across lines (e.g., "end - to - end" → "end-to-end").
   - Clean up text formatting issues while preserving meaningful content.

DEFAULTS:
- Missing strings: null
- Missing arrays: []
- Missing numbers: 0
- Missing objects: {"number": 0, "type": null} for experience
- Status: "Open"

IF UNCERTAIN: Use null for strings, [] for arrays, 0 for numbers.
OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT.
`;