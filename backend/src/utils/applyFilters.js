
const levenshtein = (a, b) => {
  if (!a || !b) return Infinity;

  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
};


// const smartMatch = (text, search) => {
//   if (!text || !search) return false;

//   text = text.toLowerCase();
//   search = search.toLowerCase();

//   const words = text.split(/\s+/);

//   // 1. Exact token match
//   if (words.includes(search)) return true;

//   // 2. Levenshtein on each token (allows misspellings)
//   for (const word of words) {
//     const dist = levenshtein(word, search);
//     if (dist <= 2) return true;
//   }

//   // 3. Prefix match (hyd → hyderabad)
//   for (const word of words) {
//     if (word.startsWith(search) || search.startsWith(word)) {
//       return true;
//     }
//   }

//   return false;
// };


const smartMatchScore = (text, search) => {
  if (!text || !search) return 0;

  text = text.toLowerCase();
  search = search.toLowerCase();
  const words = text.split(/\s+/);

  // 1️⃣ Exact token match → strongest
  if (words.includes(search)) return 1;

  // 2️⃣ Prefix match
  for (const word of words) {
    if (word.startsWith(search) || search.startsWith(word)) {
      return 0.8;
    }
  }

  // 3️⃣ Levenshtein distance
  let bestScore = 0;
  for (const word of words) {
    const dist = levenshtein(word, search);
    if (dist <= 2) {
      bestScore = Math.max(bestScore, 1 - dist * 0.2); // dist 0→1, 1→0.8, 2→0.6
    }
  }

  return bestScore; // 0 if no match
};



// const fuzzyMatch = (a, b) => {
//   if (!a || !b) return false;

//   a = a.toLowerCase().trim();
//   b = b.toLowerCase().trim();

//   // 1. Direct substring check
//   if (a.includes(b) || b.includes(a)) return true;

//   // 2. Regex partial match
//   const pattern = b.split("").join(".*");
//   const regex = new RegExp(pattern, "i");
//   if (regex.test(a)) return true;

//   // 3. Similarity score
//   let matches = 0;
//   for (let char of b) {
//     if (a.includes(char)) matches++;
//   }
//   const score = matches / Math.max(a.length, b.length);
//   return score >= 0.6;
// };

// ============================================
// MAIN FILTERING LOGIC
// ============================================


const fuzzyMatchScore = (a, b) => {
  if (!a || !b) return 0;

  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();

  // 1️⃣ Direct substring
  if (a.includes(b) || b.includes(a)) return 1;

  // 2️⃣ Regex partial match
  const pattern = b.split("").join(".*");
  const regex = new RegExp(pattern, "i");
  if (regex.test(a)) return 0.8;

  // 3️⃣ Character similarity
  let matches = 0;
  for (let char of b) {
    if (a.includes(char)) matches++;
  }
  const score = matches / Math.max(a.length, b.length);

  return score >= 0.6 ? score : 0;
};

/**
 * Apply filters to jobs in-memory
 * (Called after fetching from database)
 */
// const applyFilters = (jobs, filters) => {
//   return jobs.filter((job) => {
//     // --- EXPERIENCE FILTER (Exact Match) ---
//     if (
//       filters.experience !== null &&
//       filters.experience !== undefined &&
//       filters.experience !== "Any" &&
//       filters.experience !== 30
//     ) {
//       const enteredExp = parseInt(filters.experience);
//       const jobExp = parseInt(job.experience?.number);

//       if (!isNaN(enteredExp) && !isNaN(jobExp)) {
//         if (jobExp !== enteredExp) return false;
//       }
//     }

//     // --- SKILLS FILTER (All must match with fuzzy logic) ---
//     if (filters.skills && filters.skills.length > 0) {
//       const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

//       const matches = filters.skills.every((skill) =>
//         jobSkills.some((js) => smartMatch(js, skill))
//       );

//       if (!matches) return false;
//     }

//     // --- CLOUDS FILTER (All must match with fuzzy logic) ---
//     if (filters.clouds && filters.clouds.length > 0) {
//       const jobClouds = (job.clouds || []).map((c) => c.toLowerCase());

//       const matches = filters.clouds.every((cloud) =>
//         // jobClouds.some((jc) => smartMatch(jc, cloud))
//       jobClouds.some((jc) => fuzzyMatch(jc, cloud))
//       );

//       if (!matches) return false;
//     }

//     // --- SALARY FILTER ---
//     if (filters.salary && filters.salary.length > 0) {
//       const jobSalaryNum = parseFloat(job.salary);
//       const jobSalaryInLakhs = jobSalaryNum / 100000;

//       const matches = filters.salary.some((range) => {
//         const clean = range.replace(" Lakhs", "").trim();

//         if (clean.includes("-")) {
//           const [minStr, maxStr] = clean.split("-");
//           const min = parseFloat(minStr);
//           const max = parseFloat(maxStr);
//           return jobSalaryInLakhs >= min && jobSalaryInLakhs <= max;
//         } else if (clean.includes("+")) {
//           const min = parseFloat(clean);
//           return jobSalaryInLakhs >= min;
//         } else {
//           const exact = parseFloat(clean);
//           return Math.abs(jobSalaryInLakhs - exact) < 0.1;
//         }
//       });

//       if (!matches) return false;
//     }

//     // --- LOCATION FILTER (Fuzzy Match) ---
//     if (filters.location && filters.location.length > 0) {
//       const jobLocation = job.location?.toLowerCase() || "";
//       const matches = filters.location.some((loc) =>
//         fuzzyMatch(jobLocation, loc)
//       );
//       if (!matches) return false;
//     }

//     // --- JOB TYPE FILTER (Case-insensitive partial match) ---
//     if (filters.jobType && filters.jobType.length > 0) {
//       const jobType = job.jobType?.toLowerCase() || "";
//       const matches = filters.jobType.some((type) =>
//         jobType.includes(type.toLowerCase())
//       );
//       if (!matches) return false;
//     }

//     // --- EMPLOYMENT TYPE FILTER (Case-insensitive partial match) ---
//     if (filters.employmentType && filters.employmentType.length > 0) {
//       const jobEmployment = job.employmentType?.toLowerCase() || "";
//       const matches = filters.employmentType.some((emp) =>
//         jobEmployment.includes(emp.toLowerCase())
//       );
//       if (!matches) return false;
//     }

//     // --- CANDIDATE TYPE FILTER ---
//     // Note: This field doesn't exist in your Job schema
//     // If you add it later, uncomment this block:
  
//     if (filters?.candidateType && filters?.candidateType?.length > 0) {
//       const jobCandidateType = job.candidateType?.toLowerCase() || "";
//       const matches = filters.candidateType.some((type) =>
//         jobCandidateType.includes(type.toLowerCase())
//       );
//       if (!matches) return false;
//     }
    

//     return true;
//   });
// };


const applyFilters = (jobs, filters) => {
  const scoredJobs = [];

  for (const job of jobs) {
    let score = 0;

    // ---------- EXPERIENCE ----------
    if (
      filters.experience !== null &&
      filters.experience !== undefined &&
      filters.experience !== "Any" &&
      filters.experience !== 30
    ) {
      const enteredExp = parseInt(filters.experience);
      const jobExp = parseInt(job.experience?.number);

      if (isNaN(enteredExp) || isNaN(jobExp) || jobExp !== enteredExp) {
        continue;
      }
      score += 1;
    }

    // ---------- SKILLS ----------
    if (filters.skills?.length) {
      const jobSkills = (job.skills || []).map(s => s.toLowerCase());

      let skillScore = 0;
      for (const fs of filters.skills) {
        const best = Math.max(
          ...jobSkills.map(js => smartMatchScore(js, fs))
        );
        if (best === 0) continue;
        skillScore += best;
      }

      if (skillScore === 0) continue;
      score += skillScore;
    }

    // ---------- CLOUDS ----------
    if (filters.clouds?.length) {
      const jobClouds = (job.clouds || []).map(c => c.toLowerCase());

      let cloudScore = 0;
      for (const fc of filters.clouds) {
        const best = Math.max(
          ...jobClouds.map(jc => fuzzyMatchScore(jc, fc))
        );
        if (best === 0) continue;
        cloudScore += best;
      }

      if (cloudScore === 0) continue;
      score += cloudScore;
    }

    // ---------- SALARY ----------
    if (filters.salary?.length) {
      const jobSalaryNum = parseFloat(job.salary);
      const jobSalaryInLakhs = jobSalaryNum / 100000;

      const matches = filters.salary.some((range) => {
        const clean = range.replace(" Lakhs", "").trim();

        if (clean.includes("-")) {
          const [min, max] = clean.split("-").map(Number);
          return jobSalaryInLakhs >= min && jobSalaryInLakhs <= max;
        }
        if (clean.includes("+")) {
          return jobSalaryInLakhs >= parseFloat(clean);
        }
        return Math.abs(jobSalaryInLakhs - parseFloat(clean)) < 0.1;
      });

      if (!matches) continue;
      score += 0.5;
    }

    // ---------- LOCATION ----------
    if (filters.location?.length) {
      const jobLocation = job.location || "";

      const best = Math.max(
        ...filters.location.map(loc => fuzzyMatchScore(jobLocation, loc))
      );

      if (best === 0) continue;
      score += best;
    }

    // ---------- JOB TYPE ----------
    if (filters.jobType?.length) {
      const jobType = job.jobType?.toLowerCase() || "";
      if (!filters.jobType.some(jt => jobType.includes(jt.toLowerCase())))
        continue;
      score += 0.5;
    }

    // ---------- EMPLOYMENT TYPE ----------
    if (filters.employmentType?.length) {
      const emp = job.employmentType?.toLowerCase() || "";
      if (!filters.employmentType.some(et => emp.includes(et.toLowerCase())))
        continue;
      score += 0.5;
    }

    // ---------- CANDIDATE TYPE (optional / future) ----------
    if (filters.candidateType?.length && job.candidateType) {
      const type = job.candidateType.toLowerCase();
      if (!filters.candidateType.some(ct => type.includes(ct.toLowerCase())))
        continue;
      score += 0.3;
    }

    scoredJobs.push({ ...job, _score: score });
  }

  // 🔥 MOST RELEVANT FIRST
  return scoredJobs.sort((a, b) => b._score - a._score);
};



// applyCandidateFilters.js

/**
 * Apply filters to candidates in-memory
 */
const applyCandidateFilters = (candidates, filters) => {
  const scored = [];

  for (const candidate of candidates) {
    let score = 0;

    // ---------------- EXPERIENCE ----------------
    if (
      filters.experience &&
      filters.experience !== "Any" &&
      filters.experience !== 30
    ) {
      const enteredExp = parseInt(filters.experience);
      const expFields = [
        candidate.totalExperience,
        candidate.relevantSalesforceExperience,
        candidate.experience,
      ].map((e) => parseInt(e));

      if (!expFields.some((e) => e === enteredExp)) continue;
      score += 1;
    }

    // ---------------- SKILLS ----------------
    if (filters.skills?.length) {
      const skills = candidate.skillsJson?.map(s => s.name) || [];

      let skillScore = 0;
      for (const fs of filters.skills) {
        const best = Math.max(
          ...skills.map(cs => smartMatchScore(cs, fs))
        );
        if (best === 0) return null;
        skillScore += best;
      }
      score += skillScore;
    }

    // ---------------- CLOUDS ----------------
    if (filters.clouds?.length) {
      const clouds = candidate.primaryClouds?.map(c => c.name) || [];

      let cloudScore = 0;
      for (const fc of filters.clouds) {
        const best = Math.max(
          ...clouds.map(cc => fuzzyMatchScore(cc, fc))
        );
        if (best === 0) return null;
        cloudScore += best;
      }
      score += cloudScore;
    }

    // ---------------- LOCATION ----------------
    if (filters.location?.length) {
      const locations = candidate.preferredLocation || [];

      const best = Math.max(
        ...filters.location.map(loc =>
          Math.max(...locations.map(cl => fuzzyMatchScore(cl, loc)))
        )
      );

      if (best === 0) continue;
      score += best;
    }

    // ---------------- JOB TYPE ----------------
    if (filters.jobType?.length) {
      const jobType = candidate.jobType?.toLowerCase() || "";
      if (!filters.jobType.some(jt => jobType.includes(jt.toLowerCase())))
        continue;
      score += 0.5;
    }

    // ---------------- EMPLOYMENT TYPE ----------------
    if (filters.employmentType?.length) {
      const emp = candidate.employmentType?.toLowerCase() || "";
      if (!filters.employmentType.some(et => emp.includes(et.toLowerCase())))
        continue;
      score += 0.5;
    }

    // ---------------- CANDIDATE TYPE ----------------
    if (filters.candidateType?.length) {
      const wantsVendor = filters.candidateType.includes("vendor");
      const wantsIndividual = filters.candidateType.includes("individual");

      if (wantsVendor && !candidate.vendorId) continue;
      if (wantsIndividual && (candidate.vendorId || !candidate.userId))
        continue;

      score += 0.5;
    }

    scored.push({ ...candidate, _score: score });
  }

  // 🔥 SORT BY RELEVANCE (HIGH → LOW)
  return scored.sort((a, b) => b._score - a._score);
};





export {applyFilters, applyCandidateFilters}