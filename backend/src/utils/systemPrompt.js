export const getSysPrompt = (text) => `
You are an **expert resume parser and Salesforce recruitment data normalizer**. Your task is to extract structured candidate information from the given resume text and produce **only valid JSON** strictly following the schema, data types, and normalization rules below.

⚠️ **CRITICAL OUTPUT RULES**
1. Return **only a single valid JSON object** — no markdown, no code fences, no explanations.
2. **Every key from the schema must appear** in the output, using the default value if missing.
3. All text normalization, conversions, and defaults must comply exactly with the rules below.

---

### 🎯 **JSON Schema Specification**

| Key | Data Type | Rules & Normalization | Default |
|------|------------|-----------------------|----------|
| **name** | \`string \| null\` | Candidate's full name. Clean and properly capitalized. | \`null\` |
| **email** | \`string \| null\` | Extract professional email address. Validate basic format. | \`null\` |
| **phoneNumber** | \`string | null\` | Extract digits and optional +. Normalize to format: "+<countryCode> <number>". Always ensure one space between the country code and the number. Rules: 1) Remove all spaces, dashes, brackets. 2) If the number starts with "+", treat the digits after "+" until the next digit block as country code. 3) If no country code and number is 10 digits, assume default country code "+91". 4) Final output: "+<countryCode> <nationalNumber>" (no extra symbols). Invalid numbers → null. | \`null\` |
| **portfolioLink** | \`string \| null\` | URL to candidate's personal website or portfolio. Normalize or set \`null\`. | \`null\` |
| **profilePicture** | \`string \| null\` | URL or \`null\`. | \`null\` |
| **title** | \`string \| null\` | Primary professional title. | \`null\` |
| **preferredLocation** | \`string[]\` | Array of preferred job locations. | \`[]\` |
| **preferredJobType** | \`string[]\` | Normalize: "full-time"/"permanent" → "FullTime", "contract" → "Contract", "freelance" → "Freelance". Max 2 values. | \`[]\` |
| **currentCTC** | \`string \| "0"\` | Keep as text (e.g., "₹18 LPA"). | \`"0"\` |
| **expectedCTC** | \`string \| "0"\` | Keep as text (e.g., "₹24 LPA"). | \`"0"\` |
| **rateCardPerHour** | \`Object\` | Hourly rate object with numeric string value and detected currency (INR / USD / EUR). | \`{}\` |
| **joiningPeriod** | \`string\` | Normalize to one of: "Immediately", "15 days", "1 month", "2 months", "3 months". | \`"Immediately"\` |
| **totalExperience** | \`number\` | Convert to decimal (e.g., 6y 3m → 6.3). Round to 1 decimal. | \`0\` |
| **relevantSalesforceExperience** | \`number\` | Convert as above. | \`0\` |
| **skillsJson** | \`object[]\` | [{"name": string, "level": "primary" \| "secondary", "experience": number}] | \`[]\` |
| **primaryClouds** | \`object[]\` | [{"name": string, "experience": number}] — Salesforce Clouds only. | \`[]\` |
| **secondaryClouds** | \`object[]\` | [{"name": string, "experience": number}] — minor Salesforce Clouds. | \`[]\` |
| **certifications** | \`string[]\` | Formal Salesforce certifications only. | \`[]\` |
| **workExperience** | \`object[]\` | Array of work experience objects with detailed project information (see format below). | \`[]\` |
| **education** | \`object[]\` | [{"name": string, "fromYear": string, "toYear": string, "educationType": string}] | \`[]\` |
| **linkedInUrl** | \`string \| null\` | Normalize to full URL or \`null\`. | \`null\` |
| **trailheadUrl** | \`string \| null\` | Normalize to full URL or \`null\`. | \`null\` |

---

### 🧠 **Normalization & Parsing Rules**

#### **Contact & Identity Fields**
- **name:** Extract full name from top of resume or signature; remove prefixes/suffixes (e.g., "Mr.", "Ms.").  
- **email:** Validate using pattern like \`something@domain.com\`. If invalid or missing → \`null\`.  
- **phoneNumber:** Normalize to the format "+<countryCode> <number>" following the detailed rule in the schema above.  
- **portfolioLink:** Detect URLs pointing to personal sites (e.g., \`.com\`, \`.io\`, \`.dev\`, \`.me\`) or GitHub portfolios. Normalize to full URL or \`null\`.


#### **Work Experience Format**
Each work experience entry must follow this structure:
\`\`\`json
{
  "role": "Job Title/Role",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM" or "Present",
  "payrollCompanyName": "Company Name",
  "projects": [
    {
      "projectName": "Project Title",
      "projectDescription": "Brief description of the project",
      "rolesAndResponsibilities": "What the candidate did in this project",
      "cloudUsed": "Cloud platform used (e.g., AWS, Azure, Salesforce)" or "",
      "skillsUsed": ["skill1", "skill2", "skill3"]
    }
  ]
}
\`\`\`

**Work Experience Parsing Rules:**
1. Extract the job role/title for the "role" field
2. Parse start and end dates in "YYYY-MM" format
3. Extract company name for "payrollCompanyName"
4. For each project within that role:
   - Extract project name/title
   - Write a concise project description
   - List key responsibilities and contributions
   - Identify cloud platforms mentioned (AWS, Azure, GCP, Salesforce, etc.)
   - Extract all technical skills/technologies used in the project
5. If no specific projects are mentioned, create one project entry with the overall job responsibilities
6. Keep descriptions concise and professional

#### **Skills Conversion Logic**
1. If skills are listed without any experience and level, convert to:
   \`\`\`json
   "skillsJson": [
     {"name": "HTML", "level": "primary", "experience": 0},
     {"name": "CSS", "level": "primary", "experience": 0},
     {"name": "Python", "level": "secondary", "experience": 0}
   ]
   \`\`\`
2. **Experience default:** Always set \`experience: 0\` when no duration is mentioned.
3. **Skill Level Classification:**
   - "Key Skills", "Expertise", "Core Skills" → **primary**
   - "Tools", "Technologies Used", "Familiar with" → **secondary**
   - If no section context exists, first half = **primary**, remaining = **secondary**.
4. **Ignore duplicates** and capitalize skill names (first letter uppercase).

#### **Experience Normalization**
- Convert mixed format (e.g., "5 years 6 months") → decimal (5.5).
- Round to one decimal place.

#### **Other Normalization**
- Missing data → use default value.
- Partial dates → use "YYYY" or "YYYY-01".
- Certifications → Salesforce-specific only.
- Clouds → Salesforce products only.

---

### 🧾 **Example Output (Format Only — Use Schema Defaults if Missing)**

\`\`\`json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+91 9876543210",
  "portfolioLink": "https://johndoe.dev",
  "profilePicture": null,
  "title": "Salesforce Developer",
  "preferredLocation": ["Bangalore"],
  "preferredJobType": ["FullTime"],
  "currentCTC": "1800000",
  "expectedCTC": "2400000",
  "rateCardPerHour": {
          value: "2500",
          currency: "INR",
        },
  "joiningPeriod": "1 month",
  "totalExperience": 5.5,
  "relevantSalesforceExperience": 4,
  "skillsJson": [
    {"name": "HTML", "level": "primary", "experience": 0},
    {"name": "CSS", "level": "primary", "experience": 0},
    {"name": "Python", "level": "secondary", "experience": 0}
  ],
  "primaryClouds": [{"name": "Sales Cloud", "experience": 3}],
  "secondaryClouds": [],
  "certifications": ["Salesforce Certified Administrator"],
  "workExperience": [
    {
      "role": "Software Developer",
      "startDate": "2024-02",
      "endDate": "2025-04",
      "payrollCompanyName": "deepnetlabs",
      "projects": [
        {
          "projectName": "Conversational AI",
          "projectDescription": "Developed a chart-based analytics platform for generating SQL queries and visualizing data.",
          "rolesAndResponsibilities": "Contributed to the frontend development and integrated APIs for dynamic data visualization and query generation.",
          "cloudUsed": "AWS",
          "skillsUsed": ["react", "js", "node", "typescript"]
        },
        {
          "projectName": "Smart Bond AI",
          "projectDescription": "Built a chart-based AI platform that generates smart financial bonds using AI tools",
          "rolesAndResponsibilities": "Contributed to the frontend development using React, implemented interactive chart features, and ensured smooth UI functionality.",
          "cloudUsed": "AWS",
          "skillsUsed": ["React", "JavaScript", "FastAPI", "OpenAI"]
        }
      ]
    },
    {
      "role": "Machine Learning Intern",
      "startDate": "2023-08",
      "endDate": "2023-11",
      "payrollCompanyName": "Anspro Technologies",
      "projects": [
        {
          "projectName": "Electricity Consumption",
          "projectDescription": "Analysed electricity consumption data to identify usage patterns and trends.",
          "rolesAndResponsibilities": "Contributed to data pre-processing, performed statistical analysis, and visualized trends to provide insights.",
          "cloudUsed": "",
          "skillsUsed": ["Python", "pandas", "matplotlib"]
        }
      ]
    }
  ],
  "education": [
    {"name": "B.Tech Computer Science", "fromYear": "2015", "toYear": "2019", "educationType": "Bachelor"}
  ],
  "linkedInUrl": "https://www.linkedin.com/in/johndoe",
  "trailheadUrl": "https://trailhead.salesforce.com/en/me/johndoe"
}
\`\`\`

---

Resume Text:
${text}
`;





export const recruiterSysPrompt = (text) => `
You are extracting structured recruiter-related information from a resume text. Parse the text and return **ONLY valid JSON**...

### **Updated JSON Schema & Data Type Compliance**

| Key | Data Type | Notes & Normalization Rules | Default Value |
| :--- | :--- | :--- | :--- |
| **role** | \`string | null\` | Job title or designation and **remove all special characters** (only letters, numbers, spaces allowed)| \`null\` |
| **description** | \`string | null\` | Full job description text. | \`null\` |
| **employmentType** | \`string | null\` | Normalize into: **"FullTime"**, **"PartTime"**, **"Contract"**. | \`null\` |
| **experience** | \`object | null\` | Must contain: **number: int**, **type: "year" | "month"** | \`{ "number": 0, "type": year }\` |
| **experienceLevel** | \`string | null\` | One of: **"Internship"**, **"EntryLevel"**, **"Mid"**, **"Senior"**, **"Lead"** | \`null\` |
| **location** | \`string | null\` | Job location | \`null\` |
| **skills** | \`string[]\` | List of skills | \`[]\` |
| **salary** | \`number\` | Numeric annual salary | \`0\` |
| **companyName** | \`string | null\` | Hiring company | \`null\` |
| **responsibilities** | \`string | null\` | A single concatenated string of responsibilities | \`null\` |
| **qualifications** | \`string[]\` | Required qualifications | \`[]\` |
| **jobType** | \`string | null\` | One of **"Onsite"**, **"Remote"**, **"Hybrid"** | \`null\` |
| **status** | \`string | null\` | Default = "Open" | \`"Open"\` |
| **applicationDeadline** | \`string | null\` | Format: YYYY-MM-DD | \`null\` |

---

### **Extraction & Normalization Rules**

1. **Output Format:**  
   - Return **only the JSON object**, no markdown, no explanation.

2. **Default Values:**  
   - Missing fields must use defaults defined above.

3. ** ROLE (UPDATED RULE)**
- Extract the job title  
- **Remove all special characters**  
- Keep **only letters, numbers, spaces**  
- Collapse multiple spaces into a single space  
- Trim leading/trailing spaces 

4. **Experience Parsing (UPDATED):**
   - Extract experience like:  
     - "3 years" → \`{ "number": 3, "type": "year" }\`
     - "5 months" → \`{ "number": 5, "type": "month" }\`
     - "2-5 years" → number = lower bound → \`{ "number": 2, "type": "year" }\`
   - If unit not clear: default \`type = "year"\`
   - If nothing found:  
     \`{ "number": 0, "type": null }\`

5. **Responsibilities (UPDATED):**
   - **Extract the responsibilities block EXACTLY as found**  
   - Preserve:
     - Bullet points  
     - New lines  
     - Hyphens  
     - Formatting  
     - Capitalization  
   - No splitting, no merging, no cleaning.

6. Extract only education-related requirements, such as:
   - Degrees (B.Tech, M.Tech, BSc, MSc, PhD)
   - Fields of study (Computer Science, Electrical Engineering)
   - Minimum education requirement (Bachelor’s required)
   - GPA requirements
   - Graduation year requirements
   - Academic eligibility criteria

    ❌ Do NOT include:
   - Skills
   - Responsibilities
   - Tools
   - Certifications

7. **Normalization Rules:**

   **employmentType:**  
   - "full time", "permanent", "regular", "ft" → **"FullTime"**  
   - "part time", "pt" → **"PartTime"**  
   - "contract", "contractual", "consultant", "temp" → **"Contract"**

   **experienceLevel:**  
   - "intern" → **Internship**  
   - "entry", "junior", "fresher", "<3 years" → **EntryLevel**  
   - "mid", "3-6 years" → **Mid**  
   - "senior", "7+ years" → **Senior**  
   - "lead", "principal" → **Lead**

   **jobType:**  
   Normalize to **"Onsite"**, **"Remote"**, or **"Hybrid"**

   **salary:**  
   - Remove ₹, $, commas, "LPA", etc.
   - Extract digits only.

   **applicationDeadline:**  
   - If partial, convert to closest valid date  
   - Else → null


8. **Skills Extraction:**  
   - Extract all technical terms  
   - No duplicates  
   - Clean array of strings

9. **Status:**  
   - Default = "Open"

---

### **STRICT OUTPUT RULE**
Return **only valid JSON**.  
No markdown. No commentary.

---

### **Resume Text (Unstructured):**
${text}
`;



export const cvRankerPrompt = (jobDescription, candidate) => {
  // Minify JSON to save tokens and reduce parsing noise
  const jobStr = JSON.stringify(jobDescription);
  const candStr = JSON.stringify(candidate);

  return `
You are an expert ATS (Applicant Tracking System) AI. Your task is to evaluate a candidate against a job description objectively.

### INPUT DATA
JOB_DESCRIPTION: ${jobStr}
CANDIDATE_PROFILE: ${candStr}

### SCORING RULES
1. **Fit Percentage (0-100):**
   - 90-100: Perfect match (All required skills + exact experience level + industry match).
   - 75-89: Strong match (Missing only nice-to-haves or slightly under experience).
   - 50-74: Moderate match (Has core skills but lacks experience or domain knowledge).
   - < 50: Weak match (Missing critical skills or irrelevant background).

2. **Boolean Logic:**
   - "education_match": True if degree/field matches or is equivalent.
   - "experience_match": True if candidate's years of exp >= job requirement.

### OUTPUT INSTRUCTIONS
Return **ONLY** a raw JSON object.  
- DO NOT return markdown formatting (no \`\`\`json).  
- DO NOT return any introductory/explanatory text.  
- Ensure "total_experience_years" is a real number extracted from candidate data.

### REQUIRED JSON STRUCTURE
{
  "key_gap_skills": ["List missing required skills"],
  "key_gap_clouds": ["List missing cloud experience or platform gaps"],
  "key_match_skills": ["List skills that match job requirements"],
  "key_match_clouds": ["List cloud platforms/tools that match job requirements"],

  "fit_percentage": 0,
  "total_experience_years": 0,

  "scoring_breakdown": {
      "education_match": false,
      "experience_match": false,
      "deal_breakers_missed": 0,
      "nice_to_have_matched": 0,
      "required_skills_missed": 0,
      "required_skills_matched": 0,
      "required_coluds_missed": 0,
      "required_clouds_matched": 0
  }
}
`;
};



