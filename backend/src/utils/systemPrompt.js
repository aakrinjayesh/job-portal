export const getSysPrompt = (text) => `
You are extracting structured candidate details from a resume text. Parse the text and return **ONLY valid JSON** (no code fences, no explanations, no filler text) that strictly adheres to the schema, data types, and normalization rules provided below.

### **Required JSON Schema & Data Type Compliance**

| Key | Data Type | Notes & Normalization Rules | Default Value (If Not Found) |
| :--- | :--- | :--- | :--- |
| **profilePicture** | \`string | null\` | URL or set to \`null\`. | \`null\` |
| **title** | \`string | null\` | Candidate's primary professional title. | \`null\` |
| **preferredLocation** | \`string[]\` | List of preferred job locations. | \`[]\` |
| **preferredJobType** | \`string[]\` | **Normalization Required:** Maximum of two values. Must be from: **"FullTime"**, **"Contract"**, **"Freelance"**. | \`[]\` |
| **currentCTC** | \`string | 0\` | Keep as the original text (e.g., "₹18 LPA", "18"). | \`0\` |
| **expectedCTC** | \`string | 0\` | Keep as the original text (e.g., "₹24 LPA", "24"). | \`0\` |
| **rateCardPerHour** | \`number | 0\` | Hourly rate. | \`0\` |
| **joiningPeriod** | \`string | Immediately\` | **Normalization Required:** Closest fit from: **"Immediately"**, **"15 days"**, **"1 month"**, **"2 months"**, **"3 months"**. | \`"Immediately"\` |
| **totalExperience** | \`number | 0\` | Total years of professional experience, converted to a **number** (e.g., 6, 3.5). | \`0\` |
| **relevantSalesforceExperience** | \`number | 0\` | Relevant years of experience, converted to a **number** (e.g., 4, 2). | \`0\` |
| **skillsJson** | \`object[]\` | Array of skill objects: \`{"name": string, "level": "primary" | "secondary", "experience": number \| 0}\`. Distinguish **primary** (core expertise) vs. **secondary** (familiarity/supportive) skills. Experience is in years as a **number**. Empty array \`[]\` if not found. |
| **primaryClouds** | \`object[]\` | Array of **Salesforce Cloud** experience: \`{"name": string, "experience": number \| 0}\`. These are core Salesforce Clouds the candidate has worked extensively with (e.g., Sales Cloud, Service Cloud, Marketing Cloud). Empty array \`[]\` if not found. |
| **secondaryClouds** | \`object[]\` | Array of less-focused **Salesforce Cloud** experience: \`{"name": string, "experience": number \| 0}\`. These are Salesforce Clouds the candidate has minor or supporting experience with. Empty array \`[]\` if not found. |
| **certifications** | \`string[]\` | List of certification names. Empty array \`[]\` if not found. |
| **workExperience** | \`object[]\` | Array of work entries: \`{"startDate": string, "endDate": string, "projects": string[]}\`. Use **YYYY-MM** format for dates if possible. | \`[]\` |
| **education** | \`object[]\` | Array of education entries: \`{"name": string, "toYear": string, "fromYear": string, "educationType": string}\`. Use **YYYY** format for years. | \`[]\` |
| **linkedInUrl** | \`string | null\` | Candidate's LinkedIn profile URL. | \`null\` |
| **trailheadUrl** | \`string | null\` | Candidate's Salesforce Trailhead URL. | \`null\` |

---

### **Extraction & Default Instructions**

1. **Output Format:** Return **ONLY** the JSON object. Do not include markdown code fences (\`\`\`), any introductory text, or explanations.
2. **Default Values:** If a field's information is not explicitly found in the resume, you **must** use the designated **Default Value** from the table above (e.g., \`null\` for URLs, \`0\` for numbers, \`[]\` for lists).
3. **Normalization Rules:**
   - **preferredJobType:** Extract and normalize values like "permanent", "freelance", "full-time", "contract", etc. to the allowed values: **"FullTime"**, **"Contract"**, **"Freelance"**. Choose a maximum of **2** values.
   - **joiningPeriod:** Map notice periods to the closest standardized value: **"Immediately"**, **"15 days"**, **"1 month"**, **"2 months"**, **"3 months"**.
   
4. **Experience Parsing:**
   - Ensure **totalExperience** and **relevantSalesforceExperience** are extracted and converted to a **single decimal number**.
   - If experience is given in both years and months (e.g., "6 years 3 months"), convert to decimal format and round to **one decimal place** (e.g., "6 years 3 months" → **6.3**, "2 years 6 months" → **2.5**).
5. **Skill Classification:**
   - For \`skillsJson\`, use **"primary"** for core expertise and **"secondary"** for supporting/lesser expertise.
   - Group based on placement and emphasis. If found under "Expertise", "Key Skills", "Core Skills" → treat as **primary**. If found under "Tools", "Technologies Used", "Familiar with" → treat as **secondary**.
6. **Work Experience Normalization**  
   - For each item in the \`workExperience\` array, the \`projects\` field should be an array of strings.  
   - The **first item** in the \`projects\` array **must be the company name**.  
   - Any project descriptions can follow as additional items in the array.  
   - If only the company name is available, include it as the sole item.



---

### **Additional Normalization & Fallback Instructions**

- **Date Handling:**  
  If dates (work/education) are partially written (e.g., only year), use "YYYY" or "YYYY-01" format. If any date is missing, set it as an empty string "".

- **Certifications:**  
  Only include formal certifications (e.g., "Salesforce Certified Administrator"). Ignore course names unless explicitly labeled as a certification.

- **Salesforce Clouds (primaryClouds & secondaryClouds):**  
  These refer only to Salesforce products such as Sales Cloud, Service Cloud, Marketing Cloud, Commerce Cloud, etc.  
  Do not include AWS, GCP, Azure, or other general cloud platforms.

- **LinkedIn & Trailhead URLs:**  
  If the URL is incomplete (e.g., starts with "linkedin.com" or "trailhead.salesforce.com"), still extract and normalize it to a proper full URL if possible. Otherwise, set to \`null\`.

- **Final Output Rule (Strict):**  
  ⚠️ Return only a raw JSON object. **No markdown formatting, no explanations, no surrounding text, no code blocks. Only valid, parseable JSON will be accepted.**


---
Resume Text (Unstructured):  
${text}
`;



export const recruiterSysPrompt = (text) => `
You are extracting structured recruiter-related information from a resume text. Parse the text and return **ONLY valid JSON**...
### **Required JSON Schema & Data Type Compliance**

| Key | Data Type | Notes & Normalization Rules | Default Value (If Not Found) |
| :--- | :--- | :--- | :--- |
| **role** | \`string | null\` | Job title or designation (e.g., "Machine Learning Engineer"). | \`null\` |
| **description** | \`string | null\` | Full job description text. | \`null\` |
| **employmentType** | \`string | null\` | **Normalization Required:** Choose one from **"FullTime"**, **"PartTime"**, **"Contract"**, **"Internship"**, or **"Freelance"**. | \`null\` |
| **experience** | \`string | null\` | Text form of required experience (e.g., "3 years", "2-5 years"). | \`null\` |
| **experienceLevel** | \`string | null\` | Normalize into **"Intern"**, **"Junior"**, **"Mid"**, **"Senior"**, or **"Lead"**. | \`null\` |
| **location** | \`string | null\` | Job location (e.g., "Bangalore, India"). | \`null\` |
| **skills** | \`string[]\` | List of skills mentioned (e.g., ["Python", "TensorFlow", "SQL"]). | \`[]\` |
| **salary** | \`number | 0\` | Annual salary (numeric only). Remove symbols like ₹ or $, e.g., "₹12,00,000" → 1200000. | \`0\` |
| **companyName** | \`string | null\` | Name of the hiring company. | \`null\` |
| **responsibilities** | \`string[]\` | List of job responsibilities. | \`[]\` |
| **qualifications** | \`string[]\` | Required educational or professional qualifications. | \`[]\` |
| **jobType** | \`string | null\` | Work type: one of **"Onsite"**, **"Remote"**, or **"Hybrid"**. | \`null\` |
| **status** | \`string | null\` | Job posting status (e.g., "Open", "Closed", "Draft"). | \`"Open"\` |
| **applicationDeadline** | \`string | null\` | Deadline date for applications in **YYYY-MM-DD** format if possible. | \`null\` |

---

### **Extraction & Normalization Rules**

1. **Output Format:**  
   - Return **only the JSON object**, no markdown code fences (\`\`\`), no text before or after.  
   - Example ✅  
     \`\`\`json
     {"role": "Machine Learning Engineer", "skills": ["Python", "TensorFlow"]}
     \`\`\`
     ❌ Wrong → "Here is your JSON output"

2. **Default Values:**  
   - If a field is missing, use the provided default value from the table above.

3. **Normalization Rules:**
   - **employmentType:**  
     Normalize similar words:  
     "full time", "permanent" → **"FullTime"**  
     "contractual", "consultant" → **"Contract"**  
     "intern" → **"Internship"**  
     "part time" → **"PartTime"**  
     "freelance" → **"Freelance"**
   
   - **experienceLevel:**  
     - If text mentions "junior", "entry", or "<3 years" → **"Junior"**  
     - "mid-level", "intermediate", "3-6 years" → **"Mid"**  
     - "senior", "lead", "7+ years" → **"Senior" or "Lead"**  
     - "intern" → **"Intern"**

   - **jobType:**  
     Normalize to **"Onsite"**, **"Remote"**, or **"Hybrid"**.

   - **salary:**  
     Extract only numbers, remove currency symbols or text like "LPA", "per annum", etc.

   - **applicationDeadline:**  
     - If only month/year found, format as "YYYY-MM" or "YYYY-MM-01".  
     - If no valid date is found, set as \`null\`.

4. **Responsibilities & Qualifications:**  
   - Must be arrays of strings.  
   - If given as a paragraph, split by bullet points or sentences.

5. **Experience Parsing:**  
   - Keep as readable text, don’t convert to a number (e.g., “3 years” → **3 years**).  
   - If range like “2–5 years”, keep it as is.

6. **Skills Extraction:**  
   - Extract all technical, domain, or software-related terms.  
   - Convert them into a clean array of strings.  
   - Avoid duplicates, symbols, or phrases like "knowledge of".

7. **Status Field:**  
   - Default = "Open" unless text says "Closed", "Expired", or similar.

---

### **Additional Notes**
- If any key information (like companyName or salary) is missing, still include the key with its default value.
- The JSON must be **valid, parseable, and syntactically correct**.
- No markdown, explanations, or surrounding text — only JSON.

---

### **Final Output Rule (Strict)**
⚠️ Return **only** the JSON object.
Do **not** include markdown formatting (\`\`\`), explanations, or text around it.
Only valid, machine-readable JSON is accepted.

---

### **Job Post Text (Unstructured):**
--- 
// Resume Text (Unstructured):  
${text}
`;

