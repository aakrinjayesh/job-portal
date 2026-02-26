// export const generateJobDescriptionPrompt = (jobdetails) => {
//   return `
// You are an expert Salesforce HR job description writer.
// Generate a complete, professional Job Description based strictly on the jobdetails provided below.

// ---------------------------------------
// JOB DETAILS (INPUT JSON)
// ${JSON.stringify(jobdetails, null, 2)}
// ---------------------------------------

// ### IMPORTANT INSTRUCTIONS
// 1. Use ONLY the jobdetails provided above to craft the JD.
// 2. "description" MUST be a well-written paragraph (3–5 lines).
// 3. "responsibilities" MUST be a well-written paragraph (3–5 lines).
// 4. "skills" MUST include Salesforce-related skills such as Apex, Visualforce, LWC, SOQL, integrations, etc.
// 5. "clouds" MUST list Salesforce clouds such as Sales Cloud, Service Cloud, Marketing Cloud, Experience Cloud, etc. (if relevant).
// 6. "qualifications" MUST be simple, such as:
//    - "BTech (any degree)"
//    - "BTech in Computer Science or related field"
//    - "Any relevant bachelor's degree"
// 7. "certifications" MUST be Salesforce certifications only (if not applicable, return an empty array).
// 8. Do NOT include any special characters other than standard punctuation.
// 9. KEEP OUTPUT STRICTLY JSON — no explanations, no markdown, no extra text.

// ### OUTPUT JSON FORMAT (MANDATORY)

// {
//   "role": "string",
//   "description": "paragraph text",
//   "responsibilities": "paragraph text",
//   "skills": ["skill 1", "skill 2", "..."],
//   "clouds": ["cloud 1", "cloud 2", "..."],
//   "qualifications": ["qualification 1", "qualification 2"],
//   "certifications": ["certification 1", "certification 2"]
// }

// ### RULES FOR OUTPUT
// - ALWAYS return valid JSON only.
// - Do NOT wrap response in code blocks.
// - Ensure description and responsibilities are paragraphs, not lists.
// - Skills and clouds must be different categories.
// - Infer missing details intelligently but realistically.
// - Do NOT hallucinate company names or salaries.
// - Keep paragraphs clean, professional, and concise.

// Now generate the final JSON output based on the provided jobdetails.
//   `;
// };

// export const generateJobDescriptionPrompt = (jobdetails) => {
//   return `
// SYSTEM ROLE: Expert Salesforce HR job description writer and generator.
// OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

// JOB DETAILS INPUT: ${JSON.stringify(jobdetails, null, 2)}

// JSON SCHEMA (include ALL keys exactly as shown):
// {
//   "role": string,
//   "description": string,
//   "responsibilities": string,
//   "skills": string[],
//   "clouds": string[],
//   "qualifications": string[],
//   "certifications": string[]
// }

// CRITICAL GENERATION RULES:

// 1. INPUT STRUCTURE ANALYSIS:
//    - "role" (REQUIRED): Use the exact role provided in jobdetails.
//    - "experience" (REQUIRED): Use the experience value to determine appropriate skill levels.
//    - "experienceLevel" (OPTIONAL): Use if provided, otherwise infer from experience value.
//    - "extraInstructions" (OPTIONAL): Consider any additional preferences if provided.

// 2. ROLE GENERATION:
//    - Use the exact "role" from jobdetails input.
//    - Capitalize properly (e.g., "Salesforce Developer", not "salesforce developer").
//    - Do not modify or enhance the role title.

// 3. DESCRIPTION GENERATION:
//    - MUST be a well-written paragraph (3–5 lines).
//    - Structure: Start with role significance, mention experience level, describe main objectives.
//    - Include: Role purpose, team/organization impact, key focus areas.
//    - Example template: "As a [Role], you will play a crucial role in [primary function]. With [experience] of experience, you will be responsible for [key activities]. This position requires [key traits] and offers opportunities for [growth/impact]."

// 4. RESPONSIBILITIES GENERATION:
//    - MUST be a well-written paragraph (3–5 lines).
//    - Structure: Cover day-to-day tasks, project involvement, team collaboration.
//    - Include: Specific Salesforce-related responsibilities based on role type.
//    - Example template: "Your daily responsibilities will include [task1], [task2], and [task3]. You will collaborate with [teams] to [objective]. Additionally, you will contribute to [projects/initiatives]."

// 5. SKILLS GENERATION:
//    - MUST include Salesforce-related technical skills.
//    - Categorize skills appropriately:
//      * Development: "Apex", "Visualforce", "LWC", "Aura Components", "SOQL", "SOSL"
//      * Integration: "REST API", "SOAP API", "Middleware", "Data Migration"
//      * Tools: "Salesforce DX", "Git", "Jenkins", "Copado"
//      * Admin: "Workflows", "Process Builder", "Flows", "Security Model"
//    - Select 5-8 most relevant skills based on role and experience level.
//    - Capitalize properly (e.g., "Apex", not "apex").

// 6. CLOUDS GENERATION:
//    - MUST list relevant Salesforce clouds based on role:
//      * Developer: "Platform", "Sales Cloud", "Service Cloud"
//      * Admin: "Sales Cloud", "Service Cloud", "Experience Cloud"
//      * Consultant: "Sales Cloud", "Service Cloud", "Marketing Cloud"
//      * Architect: Multiple clouds based on complexity
//    - Select 2-4 most relevant clouds.
//    - Use proper names: "Sales Cloud", not "SalesCloud".

// 7. QUALIFICATIONS GENERATION:
//    - MUST be simple educational requirements:
//      * Entry Level: "BTech in Computer Science or related field"
//      * Mid Level: "BTech/BE in IT/Computer Science or equivalent"
//      * Senior Level: "Bachelor's degree in Computer Science or related field"
//    - Include only ONE qualification in the array.
//    - Do not include experience requirements here.

// 8. CERTIFICATIONS GENERATION:
//    - MUST be Salesforce certifications only.
//    - Select based on experience level:
//      * Entry/Mid (0-5 years): ["Salesforce Administrator", "Platform Developer I"]
//      * Senior (5-8 years): ["Salesforce Advanced Administrator", "Platform Developer II"]
//      * Lead/Architect (8+ years): ["Application Architect", "System Architect", "Technical Architect"]
//    - If role doesn't require certifications → [] (empty array).

// 9. EXPERIENCE-BASED CUSTOMIZATION:
//    - 0-2 years (EntryLevel): Focus on foundational skills, basic clouds.
//    - 3-5 years (Mid): Include advanced skills, multiple clouds.
//    - 6-8 years (Senior): Include architecture skills, complex clouds.
//    - 8+ years (Lead): Include leadership skills, multiple advanced clouds.

// 10. FORMATTING RULES:
//     - All strings must use standard punctuation only.
//     - Paragraphs must be coherent and professionally written.
//     - Arrays must contain strings without special formatting.
//     - No markdown, no HTML, no code blocks.

// DEFAULTS:
// - Missing role: Cannot proceed - use "Salesforce Developer" as fallback
// - Missing experience: Assume 3 years (Mid level)
// - Skills: Minimum 5 relevant Salesforce skills
// - Clouds: Minimum 2 relevant Salesforce clouds
// - Qualifications: ["BTech in Computer Science or related field"]
// - Certifications: [] (empty array if unsure)

// OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT.
// `;
// };

export const generateJobDescriptionPrompt = (jobdetails) => {
  return `
SYSTEM ROLE: Expert Salesforce HR job description writer and generator.
OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

JOB DETAILS INPUT: ${JSON.stringify(jobdetails, null, 2)}

JSON SCHEMA (include ALL keys exactly as shown):
{
  "role": string,
  "description": string,
  "responsibilities": string,
  "skills": string[],
  "clouds": string[],
  "qualifications": string[],
  "certifications": string[]
}

CRITICAL GENERATION RULES:

1. INPUT STRUCTURE ANALYSIS:
   - "role" (REQUIRED): Use the exact role provided in jobdetails.
   - "experience" (REQUIRED): Use the experience value to determine appropriate skill levels.
   - "experienceLevel" (OPTIONAL): Use if provided, otherwise infer from experience value.
   - "extraInstructions" (OPTIONAL): Consider any additional preferences if provided.

2. ROLE GENERATION:
   - Use the exact "role" from jobdetails input.
   - Capitalize properly (e.g., "Salesforce Developer", not "salesforce developer").
   - Do not modify or enhance the role title.

3. DESCRIPTION GENERATION:
   - MUST be atleast 120–160 words.
   - MUST be written in resume-quality, enterprise JD language.
   - Include business context, platform ownership, and technical scope.
   - Reflect seniority clearly based on experience level.

4. RESPONSIBILITIES GENERATION:
   - MUST be a single string containing atleast 6–8 bullet-style statements.
   - Each statement must end with "\n".
   - Each responsibility MUST include:
   * Action verb
   * Salesforce feature or technology
   * Outcome or impact
   - Reflect complexity, scale, and ownership based on experience level.

5. SKILLS GENERATION:
   - MUST include Salesforce-related technical skills.
   - Categorize skills appropriately:
     * Development: "Apex", "Visualforce", "LWC", "Aura Components", "SOQL", "SOSL"
     * Integration: "REST API", "SOAP API", "Middleware", "Data Migration"
     * Tools: "Salesforce DX", "Git", "Jenkins", "Copado"
     * Admin: "Workflows", "Process Builder", "Flows", "Security Model"
   - Select 6–8 highly specific, non-overlapping Salesforce skills.
   - Skills MUST reflect hands-on implementation, not theoretical knowledge.
   - Avoid repeating similar skills (e.g., Flow + Process Builder together unless role requires both).
   - Capitalize properly (e.g., "Apex", not "apex").

6. CLOUDS GENERATION:
   - MUST list Salesforce products with "Salesforce" prefix.
   - Select clouds that are actively used in the responsibilities.
   - Do NOT include clouds unless they logically align with the role.
   - Always use "Salesforce" prefix followed by cloud name (e.g., "Salesforce App Cloud", not "App Cloud").

7. QUALIFICATIONS GENERATION:
   - MUST be simple educational requirements.
   - Use appropriate qualification based on experience level.
   - Include only ONE qualification in the array.
   - Do not include experience requirements here.

8. CERTIFICATIONS GENERATION:
   - MUST be Salesforce certifications only.
   - Select based on experience level and role type.
   - If role doesn't require certifications → [] (empty array).

9. EXPERIENCE-BASED CUSTOMIZATION (STRICT):
   - Entry (0–2): Configuration, basic Apex, standard objects, supervision.
   - Mid (3–5): End-to-end delivery, integrations, complex Flows, deployment tools.
   - Senior (6–8): Architecture decisions, performance optimization, security design, mentoring.
   - Lead (8+): Platform ownership, solution architecture, cross-team leadership, governance.
   - Output MUST clearly reflect the correct band; do not blur levels.

10. FORMATTING RULES:
    - All strings must use standard punctuation only.
    - Paragraphs must be coherent and professionally written.
    - Arrays must contain strings without special formatting.
    - No markdown, no HTML, no code blocks.

11. TECHNICAL DEPTH RULES:
   - Avoid generic phrases like "good understanding" or "knowledge of".
   - Use enterprise terminology such as:
   * governor limits
   * bulkification
   * asynchronous processing
   * security and sharing model
   * CI/CD pipelines
   * scalable architecture
   - Senior and Lead roles MUST reference architecture or performance considerations.

RESUME QUALITY ENFORCEMENT:
- Output must be suitable for direct inclusion in a professional JD or resume.
- Avoid fluff, buzzwords, or vague statements.
- Prioritize clarity, impact, and technical credibility.

DEFAULTS:
- Missing role: Cannot proceed - use "Salesforce Developer" as fallback
- Missing experience: Assume 3 years (Mid level)
- Skills: Minimum 5 relevant Salesforce skills
- Clouds: Minimum 2 relevant Salesforce clouds
- Qualifications: ["BTech in Computer Science or related field"]
- Certifications: [] (empty array if unsure)

OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT.
`;
};
