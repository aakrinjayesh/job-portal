// // short words 2-3 words max for skills clouds
// export const cvRankerPrompt = (jobDescription, candidate) => {
//   // Minify JSON to save tokens and reduce parsing noise
//   const jobStr = JSON.stringify(jobDescription);
//   const candStr = JSON.stringify(candidate);

//   return `
// You are an expert ATS (Applicant Tracking System) AI. Your task is to evaluate a candidate against a job description objectively.

// ### INPUT DATA
// JOB_DESCRIPTION: ${jobStr}
// CANDIDATE_PROFILE: ${candStr}

// ### SCORING RULES
// 1. **Fit Percentage (0-100):**
//    - 90-100: Perfect match (All required skills + exact experience level + industry match).
//    - 75-89: Strong match (Missing only nice-to-haves or slightly under experience).
//    - 50-74: Moderate match (Has core skills but lacks experience or domain knowledge).
//    - < 50: Weak match (Missing critical skills or irrelevant background).

// 2. **Boolean Logic:**
//    - "education_match": True if degree/field matches or is equivalent.
//    - "experience_match": True if candidate's years of exp >= job requirement.

// ### OUTPUT INSTRUCTIONS
// Return **ONLY** a raw JSON object.  
// - DO NOT return markdown formatting (no \`\`\`json).  
// - DO NOT return any introductory/explanatory text.  
// - Ensure "total_experience_years" is a real number extracted from candidate data.

// ### REQUIRED JSON STRUCTURE
// {
//   "key_gap_skills": ["List missing required skills"],
//   "key_gap_clouds": ["List missing cloud experience or platform gaps"],
//   "key_match_skills": ["List skills that match job requirements"],
//   "key_match_clouds": ["List cloud platforms/tools that match job requirements"],

//   "fit_percentage": 0,
//   "total_experience_years": 0,

//   "scoring_breakdown": {
//       "education_match": false,
//       "experience_match": false,
//       "deal_breakers_missed": 0,
//       "nice_to_have_matched": 0,
//       "required_skills_missed": 0,
//       "required_skills_matched": 0,
//       "required_coluds_missed": 0,
//       "required_clouds_matched": 0
//   }
// }
// `;
// };


// export const cvRankerPrompt = (jobDescription, candidate) => {
//   // Minify JSON to save tokens and reduce parsing noise
//   const jobStr = JSON.stringify(jobDescription);
//   const candStr = JSON.stringify(candidate);

//   return `
// SYSTEM ROLE: Expert ATS (Applicant Tracking System) AI for Salesforce candidate evaluation.
// OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

// JOB DESCRIPTION INPUT: ${jobStr}
// CANDIDATE PROFILE INPUT: ${candStr}

// JSON SCHEMA (include ALL keys exactly as shown):
// {
//   "fit_percentage": number,
//   "total_experience_years": number,
//   "key_gap_skills": string[],
//   "key_gap_clouds": string[],
//   "key_match_skills": string[],
//   "key_match_clouds": string[],
//   "scoring_breakdown": {
//     "education_match": boolean,
//     "experience_match": boolean,
//     "role_category_match": boolean,
//     "critical_skills_missed": number,
//     "critical_skills_matched": number,
//     "critical_clouds_missed": number,
//     "critical_clouds_matched": number,
//     "certifications_matched": number
//   }
// }

// CRITICAL EVALUATION RULES FROM TOP RECRUITER PERSPECTIVE:

// 1. ROLE CATEGORY MATCH ANALYSIS (MOST IMPORTANT):
//    - FIRST identify if candidate's role category matches job role category:
//      * Development roles: "Developer", "Programmer", "Engineer" (development focused)
//      * Testing roles: "Tester", "QA", "Test Engineer", "Quality Assurance"
//      * Admin roles: "Administrator", "Admin", "Consultant"
//      * Architect roles: "Architect", "Solution Architect", "Technical Architect"
   
//    - Mismatched categories = SEVERE penalty (30-40% reduction):
//      * Developer job + Tester candidate = Major mismatch
//      * Tester job + Developer candidate = Possible match (developers can test)
//      * Admin job + Developer candidate = Good match
//      * Developer job + Admin candidate = Partial mismatch

// 2. SKILLS EVALUATION (CORE COMPETENCY):
//    - "secondary" skills with 0 experience = DO NOT COUNT as matches
//    - Only "primary" skills with >0 experience count as valid matches
//    - Critical skills missing = DEAL BREAKERS (30% penalty each):
//      * If job requires "Apex" and candidate has it as secondary with 0 exp = MISSING
//      * If job requires "SOQL" and candidate doesn't have it = MISSING
   
//    - Testing skills ≠ Development skills:
//      * "Regression", "SIT", "UAT" are TESTING skills
//      * "Apex", "LWC", "Visualforce" are DEVELOPMENT skills
//      * These are DIFFERENT categories and should not be considered matches

// 3. CLOUDS EVALUATION:
//    - Clouds in candidate's "primaryClouds" with >0 experience = VALID matches
//    - Clouds in candidate's "secondaryClouds" with 0 experience = DO NOT COUNT
//    - Exact cloud name matches required

// 4. FIT PERCENTAGE CALCULATION (TOP RECRUITER FORMULA):
//    BASE SCORE = 0
   
//    A. ROLE CATEGORY MATCH (30 points max):
//      - Exact category match: +30
//      - Related category (Dev→Admin, Admin→Dev): +20
//      - Partial mismatch (Tester→Dev): +10
//      - Major mismatch (Dev→Tester for dev role): +0
   
//    B. CRITICAL SKILLS MATCH (40 points max):
//      - Each required skill matched (primary with exp): +6.67
//      - Each required skill missing: +0
//      - Secondary skills with 0 exp: +0
//      - Testing skills for dev role: +0 (different category)
   
//    C. CLOUDS MATCH (15 points max):
//      - Each required cloud matched (primary with exp): +7.5
//      - Each required cloud missing: +0
   
//    D. EXPERIENCE MATCH (10 points max):
//      - Candidate exp ≥ Job req: +10
//      - Candidate exp < Job req: proportionally reduced
   
//    E. CERTIFICATIONS (5 points max):
//      - Each relevant certification: +2.5
//      - Admin cert for Salesforce role: +5

//    TOTAL = Sum of A+B+C+D+E
//    Cap at 100

// 5. KEY GAP/MATCH IDENTIFICATION:
//    - "key_gap_skills": List ONLY critical missing skills (max 5)
//    - "key_gap_clouds": List ONLY critical missing clouds (max 3)
//    - "key_match_skills": List ONLY strongest matching skills (max 5)
//    - "key_match_clouds": List ONLY strongest matching clouds (max 3)
//    - Use 2-3 word descriptions

// 6. SCORING BREAKDOWN LOGIC:
//    - "education_match": true if degree field is relevant (Tech degree for tech role)
//    - "experience_match": true if candidate exp ≥ job req exp
//    - "role_category_match": true if role categories align (see rule 1)
//    - "critical_skills_missed": Count of required skills candidate lacks
//    - "critical_skills_matched": Count of required skills candidate has (primary with exp)
//    - "critical_clouds_missed": Count of required clouds candidate lacks
//    - "critical_clouds_matched": Count of required clouds candidate has (primary with exp)
//    - "certifications_matched": Count of relevant certifications

// 7. TOTAL EXPERIENCE YEARS:
//    - Extract from candidate's "totalExperience" or "relevantSalesforceExperience"
//    - Use the higher value if both present
//    - Format: decimal with 1 place

// 8. DEAL BREAKER DETECTION:
//    - If missing MORE THAN 50% of critical skills = automatic 30% max cap
//    - If role category is major mismatch = automatic 40% max cap
//    - If experience < 70% of requirement = automatic 50% max cap

// EXAMPLE ANALYSIS FOR YOUR DATA:
// - Job: "Salesforce Tester" (actually Developer-Tester hybrid based on skills)
// - Candidate: "QA Test Engineer" (Testing role)
// - Category: Partial mismatch (Tester→Dev/Tester role) = +10/30
// - Missing critical dev skills (Apex, LWC, Visualforce, SOQL) = +0/40
// - Has required clouds = +15/15
// - Experience exceeds requirement = +10/10
// - Has Admin certification = +5/5
// - TOTAL = 40/100 = 40% fit (NOT 75%)

// DEFAULTS:
// - Missing arrays: []
// - Fit percentage: 0
// - Total experience years: 0
// - All boolean fields: false
// - All count fields: 0

// OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT.
// `;
// };


// advanced prompt of cv ranker
// export const cvRankerPrompt = (jobDescription, candidate) => {
//   const jobStr = JSON.stringify(jobDescription);
//   const candStr = JSON.stringify(candidate);
  
//   return `
// SYSTEM ROLE: Expert Salesforce Technical Recruiter - Your evaluation determines hiring success.
// MISSION: Provide brutally honest, accurate candidate evaluation. Truth over politeness.
// OUTPUT FORMAT: ONLY valid JSON. No markdown, no explanations, no code fences.

// JOB DESCRIPTION: ${jobStr}
// CANDIDATE PROFILE: ${candStr}

// JSON SCHEMA (include ALL keys exactly as shown):
// {
//   "fit_percentage": number,          // 0-100, accurate not inflated
//   "matchQuality": string,           // "Excellent"|"Good"|"Moderate"|"Weak"|"Poor"
//   "analysis": {
//     "role_type_analysis": {
//       "job_role_type": string,      // "Technical-Developer"|"Technical-Tester"|"Functional"|"Hybrid"
//       "candidate_role_type": string, // Based on actual proven skills
//       "alignment": string,          // "Perfect"|"Partial"|"Mismatch"|"Critical Mismatch"
//       "alignment_reason": string
//     },
//     "skills_reality_check": {
//       "actual_proven_skills": string[],  // Skills with >0 experience in projects
//       "claimed_but_not_proven": string[], // Skills with 0 experience (secondary)
//       "critical_missing_skills": string[], // Required skills candidate lacks
//       "skill_credibility": string       // "High"|"Medium"|"Low"|"Red Flag"
//     },
//     "experience_validation": {
//       "total_years": number,
//       "relevant_technical_years": number, // Years with actual technical skills usage
//       "experience_quality": string,       // "Deep Expertise"|"Surface Level"|"Questionable"
//       "validation_notes": string
//     },
//     "clouds_experience_verification": {
//       "verified_cloud_experience": string[], // Clouds with supporting technical skills
//       "unverified_cloud_claims": string[],   // Clouds without supporting skills
//       "cloud_credibility_score": number      // 0-10 based on verification
//     },
//     "scoring_breakdown": {
//       "required_skills_score": number,      // 0-40
//       "required_clouds_score": number,      // 0-20  
//       "experience_match_score": number,     // 0-20
//       "education_bonus_score": number,      // 0-10
//       "certifications_bonus": number,       // 0-10
//       "penalties_applied": string[]        // Specific penalties with reasons
//     },
//     "deal_breakers": string[],            // Critical mismatches
//     "key_strengths": string[],            // Genuine advantages
//     "risk_factors": string[],             // Hiring risks
//     "recruiter_insights": string          // Human recruiter perspective
//   }
// }

// CRITICAL EVALUATION FRAMEWORK:

// 1. TRUTH-FIRST SKILL ASSESSMENT:
//    • SKILLS WITH EXPERIENCE > 0 = Candidate CAN DO this
//    • SKILLS WITH EXPERIENCE = 0 = Candidate CANNOT DO this (even if listed)
//    • Testing skills (Regression, UAT, SIT) ≠ Development skills (Apex, LWC, SOQL)
//    • Domain exposure ≠ Technical capability

// 2. ROLE REALITY CHECK:
//    TECHNICAL ROLES (Developer, Technical Tester):
//    - Must have: Actual coding/development experience (>0 years in Apex/LWC/SOQL)
//    - Red Flag: All technical skills show "0 experience"
//    - Dealbreaker: No proven technical skills for technical role

//    FUNCTIONAL ROLES (Admin, Business Analyst):
//    - Must have: Configuration, process design, user management
//    - Acceptable: May not have coding skills

//    Salesforce Tester Analysis:
//    - If job requires "Apex, LWC, SOQL" = TECHNICAL TESTER
//    - Needs: Test automation, API testing, code understanding
//    - Manual testing alone = NOT QUALIFIED for technical testing role

// 3. EXPERIENCE CREDIBILITY:
//    • Total years ≠ Relevant years
//    • "9.8 years Salesforce" but "0 years Apex" = 0 relevant technical experience
//    • Validate experience against actual project usage
//    • Multiple clouds with identical experience years = Potential copy-paste

// 4. CLOUDS VERIFICATION:
//    • Claiming "Sales Cloud 9.8 years" without Apex/SOQL/Configuration skills = UNVERIFIED
//    • Clouds must have supporting technical skills to be credible
//    • Secondary clouds with 0 experience = NOT VALID experience

// 5. SCORING SYSTEM (100 points):

//    A. CORE COMPETENCY: REQUIRED SKILLS [0-40 points]
//       • Calculate: (Proven Required Skills / Total Required Skills) × 40
//       • Proven = Primary skills with >0 experience
//       • PENALTY: Technical role missing technical skills = ×0.5 multiplier
//       • Example: 2/6 required skills = (2/6 × 40) = 13.3 points

//    B. DOMAIN EXPERTISE: REQUIRED CLOUDS [0-20 points]
//       • Calculate: (Verified Cloud Experience / Required Clouds) × 20
//       • Verified = Primary clouds with supporting technical skills
//       • Unverified claims = 0 points

//    C. EXPERIENCE MATCH [0-20 points]
//       IF candidate_experience < job_requirement × 0.8 → 0 points
//       IF candidate_experience ≥ job_requirement → 20 points
//       IF candidate_experience > job_requirement × 2 → 15 points (overqualified)
      
//       QUALITY MULTIPLIER:
//       • Deep technical experience: ×1.0
//       • Surface/functional only: ×0.7
//       • No relevant technical experience for tech role: ×0.3

//    D. EDUCATION & CERTIFICATIONS [0-20 points]
//       • Education match: 0-10 points
//       • Relevant certifications: 0-10 points
//       • Salesforce Admin cert for Salesforce role: +5 points

//    FINAL SCORE = (A + B + C + D) capped at 100

// 6. FIT QUALITY INTERPRETATION:
//    • 85-100: EXCELLENT - Strong technical match, interview immediately
//    • 70-84: GOOD - Solid match, proceed with standard interview
//    • 55-69: MODERATE - Partial match, requires careful screening
//    • 40-54: WEAK - Significant gaps, consider only if desperate
//    • 0-39: POOR - Major mismatch, recommend rejection

// 7. RECRUITER WISDOM INTEGRATION:
//    • "Would I shortlist this candidate for this role?"
//    • "Can this candidate do the actual job based on proven skills?"
//    • "Is there evidence of skill progression or just a skill dump?"
//    • "Are certifications backed by practical experience?"

// 8. VALIDATION CHECKS BEFORE FINALIZING:
//    □ Skills with "0 experience" marked as NOT PROVEN
//    □ Technical/Functional role type correctly identified
//    □ Experience credibility verified
//    □ No artificial score inflation
//    □ Critical gaps properly penalized
//    □ Score reflects actual hiring decision logic

// 9. FOR YOUR SPECIFIC CASE ANALYSIS:
//    - Job: Salesforce Tester requiring Apex, LWC, SOQL = TECHNICAL TESTER
//    - Candidate: QA Test Engineer with manual testing skills
//    - Reality: Candidate has 0 years proven Apex/LWC/SOQL experience
//    - Conclusion: NOT qualified for technical testing role
//    - Expected Score: 30-45% (not 75%)

// DEFAULTS:
// - Missing strings: null
// - Missing arrays: []
// - Missing numbers: 0
// - Missing booleans: false

// INTEGRITY RULE: If uncertain, use conservative scoring. Better to under-score than inflate.
// OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT.
// `;
// };





export const cvRankerPrompt = (jobDescription, candidate) => {
  // Minify JSON to save tokens and reduce parsing noise
  const jobStr = JSON.stringify(jobDescription);
  const candStr = JSON.stringify(candidate);

  return `
SYSTEM ROLE: Expert ATS (Applicant Tracking System) AI for Salesforce candidate evaluation.
OUTPUT FORMAT: ONLY valid JSON. No explanations, no markdown, no code fences.

JOB DESCRIPTION INPUT: ${jobStr}
CANDIDATE PROFILE INPUT: ${candStr}

JSON SCHEMA (include ALL keys exactly as shown):
{
  "fit_percentage": number,
  "total_experience_years": number,
  "key_gap_skills": string[],
  "key_gap_clouds": string[],
  "key_match_skills": string[],
  "key_match_clouds": string[],
  "scoring_breakdown": {
    "education_match": boolean,
    "experience_match": boolean,
    "role_category_match": boolean,
    "critical_skills_missed": number,
    "critical_skills_matched": number,
    "critical_clouds_missed": number,
    "critical_clouds_matched": number,
    "certifications_matched": number
  }
}

CRITICAL EVALUATION RULES FROM TOP RECRUITER PERSPECTIVE:

1. ROLE CATEGORY MATCH ANALYSIS (MOST IMPORTANT):
   - FIRST identify if candidate's role category matches job role category:
     * Development roles: "Developer", "Programmer", "Engineer" (development focused)
     * Testing roles: "Tester", "QA", "Test Engineer", "Quality Assurance"
     * Admin roles: "Administrator", "Admin", "Consultant"
     * Architect roles: "Architect", "Solution Architect", "Technical Architect"
   
   - Mismatched categories = SEVERE penalty (30-40% reduction):
     * Developer job + Tester candidate = Major mismatch
     * Tester job + Developer candidate = Possible match (developers can test)
     * Admin job + Developer candidate = Good match
     * Developer job + Admin candidate = Partial mismatch

2. SKILLS EVALUATION (CORE COMPETENCY):
   - "secondary" skills with 0 experience = DO NOT COUNT as matches
   - Only "primary" skills with >0 experience count as valid matches
   - Critical skills missing = DEAL BREAKERS (30% penalty each):
     * If job requires "Apex" and candidate has it as secondary with 0 exp = MISSING
     * If job requires "SOQL" and candidate doesn't have it = MISSING
   
   - Testing skills ≠ Development skills:
     * "Regression", "SIT", "UAT" are TESTING skills
     * "Apex", "LWC", "Visualforce" are DEVELOPMENT skills
     * These are DIFFERENT categories and should not be considered matches

3. CLOUDS EVALUATION:
   - Clouds in candidate's "primaryClouds" with >0 experience = VALID matches
   - Clouds in candidate's "secondaryClouds" with 0 experience = DO NOT COUNT
   - Exact cloud name matches required

4. FIT PERCENTAGE CALCULATION (TOP RECRUITER FORMULA):
   BASE SCORE = 0
   
   A. ROLE CATEGORY MATCH (30 points max):
     - Exact category match: +30
     - Related category (Dev→Admin, Admin→Dev): +20
     - Partial mismatch (Tester→Dev): +10
     - Major mismatch (Dev→Tester for dev role): +0
   
   B. CRITICAL SKILLS MATCH (40 points max):
     - Each required skill matched (primary with exp): +6.67
     - Each required skill missing: +0
     - Secondary skills with 0 exp: +0
     - Testing skills for dev role: +0 (different category)
   
   C. CLOUDS MATCH (15 points max):
     - Each required cloud matched (primary with exp): +7.5
     - Each required cloud missing: +0
   
   D. EXPERIENCE MATCH (10 points max):
     - Candidate exp ≥ Job req: +10
     - Candidate exp < Job req: proportionally reduced
   
   E. CERTIFICATIONS (5 points max):
     - Each relevant certification: +2.5
     - Admin cert for Salesforce role: +5

   TOTAL = Sum of A+B+C+D+E
   Cap at 100

5. KEY GAP/MATCH IDENTIFICATION:
   - "key_gap_skills": List ONLY critical missing skills (max 5)
   - "key_gap_clouds": List ONLY critical missing clouds (max 3)
   - "key_match_skills": List ONLY strongest matching skills (max 5)
   - "key_match_clouds": List ONLY strongest matching clouds (max 3)
   - Use 2-3 word descriptions

6. SCORING BREAKDOWN LOGIC:
   - "education_match": true if degree field is relevant (Tech degree for tech role)
   - "experience_match": true if candidate exp ≥ job req exp
   - "role_category_match": true if role categories align (see rule 1)
   - "critical_skills_missed": Count of required skills candidate lacks
   - "critical_skills_matched": Count of required skills candidate has (primary with exp)
   - "critical_clouds_missed": Count of required clouds candidate lacks
   - "critical_clouds_matched": Count of required clouds candidate has (primary with exp)
   - "certifications_matched": Count of relevant certifications

7. TOTAL EXPERIENCE YEARS:
   - Extract from candidate's "totalExperience" or "relevantSalesforceExperience"
   - Use the higher value if both present
   - Format: decimal with 1 place

8. DEAL BREAKER DETECTION:
   - If missing MORE THAN 50% of critical skills = automatic 30% max cap
   - If role category is major mismatch = automatic 40% max cap
   - If experience < 70% of requirement = automatic 50% max cap

EXAMPLE ANALYSIS FOR YOUR DATA:
- Job: "Salesforce Tester" (actually Developer-Tester hybrid based on skills)
- Candidate: "QA Test Engineer" (Testing role)
- Category: Partial mismatch (Tester→Dev/Tester role) = +10/30
- Missing critical dev skills (Apex, LWC, Visualforce, SOQL) = +0/40
- Has required clouds = +15/15
- Experience exceeds requirement = +10/10
- Has Admin certification = +5/5
- TOTAL = 40/100 = 40% fit (NOT 75%)

DEFAULTS:
- Missing arrays: []
- Fit percentage: 0
- Total experience years: 0
- All boolean fields: false
- All count fields: 0

OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT.
`;
};

