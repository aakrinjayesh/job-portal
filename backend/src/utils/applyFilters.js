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

const normalizeFilters = (filters) => {
  const makeArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

  return {
    ...filters,
    skills: makeArray(filters.skills),
    clouds: makeArray(filters.clouds),
    salary: makeArray(filters.salary),
    location: makeArray(filters.location),
    jobType: makeArray(filters.jobType),
    employmentType: makeArray(filters.employmentType),
    candidateType: makeArray(filters.candidateType),
  };
};

const normalizeCity = (city) => city?.toLowerCase().replace(/\s+/g, "").trim();

const cityAliases = {
  bangalore: "bengaluru",
  bengaluru: "bengaluru",
  bombay: "mumbai",
  delhi: "newdelhi",
};

// ---------------- MAIN FILTER FUNCTION ----------------
const applyFilters = (jobs, filters) => {
  filters = normalizeFilters(filters); // 🔥 IMPORTANT FIX

  const scoredJobs = [];

  for (const job of jobs) {
    let score = 0;

    // ---------- EXPERIENCE ----------
    // if (filters.experience !== null && filters.experience !== undefined) {
    //   let enteredExp = null;

    //   if (typeof filters.experience === "object") {
    //     enteredExp = parseInt(filters.experience.number);
    //   } else {
    //     enteredExp = parseInt(filters.experience);
    //   }

    //   const jobExp = parseInt(job.experience?.number);

    //   if (isNaN(enteredExp) || isNaN(jobExp) || jobExp !== enteredExp) {
    //     continue;
    //   }

    //   score += 1;
    // }
    // ---------- EXPERIENCE ----------
    const hasExpRange = filters.expMin != null || filters.expMax != null;

    if (hasExpRange) {
      const jobExp = parseFloat(job.experience?.number ?? 0);
      const min = Number(filters.expMin ?? 0);
      const max = Number(filters.expMax ?? 99);
      if (isNaN(jobExp) || jobExp < min || jobExp > max) continue;
      score += 1;
    } else if (
      filters.experience !== null &&
      filters.experience !== undefined
    ) {
      let enteredExp = null;
      if (typeof filters.experience === "object") {
        enteredExp = parseInt(filters.experience.number);
      } else {
        enteredExp = parseInt(filters.experience);
      }
      const jobExp = parseInt(job.experience?.number);
      if (isNaN(enteredExp) || isNaN(jobExp) || jobExp !== enteredExp) continue;
      score += 1;
    }

    // ---------- SKILLS ----------
    if (filters.skills?.length) {
      const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

      let skillScore = 0;

      for (const fs of filters.skills) {
        const best = Math.max(
          ...jobSkills.map((js) => smartMatchScore(js, fs)),
        );
        if (best === 0) continue;
        skillScore += best;
      }

      if (skillScore === 0) continue;
      score += skillScore;
    }

    // ---------- CLOUDS ----------
    // if (filters.clouds?.length) {
    //   const jobClouds = (job.clouds || []).map(c => c.toLowerCase());

    //   let cloudScore = 0;

    //   for (const fc of filters.clouds) {
    //     const best = Math.max(
    //       ...jobClouds.map(jc => fuzzyMatchScore(jc, fc))
    //     );

    //     if (best === 0) continue;
    //     cloudScore += best;
    //   }

    //   if (cloudScore === 0) continue;
    //   score += cloudScore;
    // }
    // ---------- CLOUDS ----------
    if (filters.clouds?.length) {
      const jobClouds = (job.clouds || []).map((c) => c.toLowerCase().trim());

      let allMatched = true;

      for (const fc of filters.clouds) {
        const fcNorm = fc.toLowerCase().trim();

        const matched = jobClouds.some((jc) => {
          if (jc === fcNorm) return true; // exact match
          if (jc.includes(fcNorm) || fcNorm.includes(jc)) return true; // one contains other
          return false;
        });

        if (!matched) {
          allMatched = false;
          break;
        }
      }

      if (!allMatched) continue;
      score += 1;
    }

    // ---------- SALARY (FIXED) ----------
    if (filters.salary?.length) {
      const jobSalaryNum = parseFloat(job.salary);
      const jobSalaryInLakhs = jobSalaryNum / 100000;

      const matches = filters.salary.some((range) => {
        const clean = String(range).replace(" Lakhs", "").trim();

        // Range "5-10"
        if (clean.includes("-")) {
          const [min, max] = clean.split("-").map(Number);
          return jobSalaryInLakhs >= min && jobSalaryInLakhs <= max;
        }

        // "10+"
        if (clean.includes("+")) {
          return jobSalaryInLakhs >= parseFloat(clean);
        }

        // Exact
        return Math.abs(jobSalaryInLakhs - parseFloat(clean)) < 0.1;
      });

      if (!matches) continue;
      score += 0.5;
    }

    // ---------- LOCATION ----------
    if (filters.location?.length) {
      const jobLocation = job.location || "";

      const best = Math.max(
        ...filters.location.map((loc) => fuzzyMatchScore(jobLocation, loc)),
      );

      if (best === 0) continue;
      score += best;
    }

    // ---------- JOB TYPE ----------
    if (filters.jobType?.length) {
      const jobType = job.jobType?.toLowerCase() || "";

      if (!filters.jobType.some((jt) => jobType.includes(jt.toLowerCase())))
        continue;

      score += 0.5;
    }

    // ---------- EMPLOYMENT TYPE ----------
    if (filters.employmentType?.length) {
      const emp = job.employmentType?.toLowerCase() || "";

      if (!filters.employmentType.some((et) => emp.includes(et.toLowerCase())))
        continue;

      score += 0.5;
    }

    // ---------- CANDIDATE TYPE ----------
    if (filters.candidateType?.length && job.candidateType) {
      const type = job.candidateType.toLowerCase();

      if (!filters.candidateType.some((ct) => type.includes(ct.toLowerCase())))
        continue;

      score += 0.3;
    }

    scoredJobs.push({ ...job, _score: score });
  }

  // Return sorted ranking
  return scoredJobs.sort((a, b) => b._score - a._score);
};

/**
 * Apply filters to candidates in-memory
 */

const applyCandidateFilters = (candidates, filters) => {
  const scored = [];

  for (const candidate of candidates) {
    let score = 0;

    // ---------------- EXPERIENCE ----------------
    // if (
    //   filters.experience &&
    //   filters.experience !== "Any" &&
    //   filters.experience !== 30
    // ) {
    //   const enteredExp = parseFloat(filters.experience);
    //   const totalExp = parseFloat(candidate.totalExperience);

    //   // ✅ Exact year match — only 2.0 to 2.9 passes when user enters 2
    //   if (isNaN(totalExp) || Math.floor(totalExp) !== Math.floor(enteredExp))
    //     continue;

    //   score += 1;
    // }
    // ---------------- EXPERIENCE ----------------
    // ---------------- EXPERIENCE ----------------
    const hasExpRange = filters.expMin != null || filters.expMax != null;

    if (hasExpRange) {
      const totalExp = parseFloat(candidate.totalExperience);
      const min = filters.expMin != null ? Number(filters.expMin) : 0;
      const max = filters.expMax != null ? Number(filters.expMax) : 99;
      if (isNaN(totalExp) || totalExp < min || totalExp > max) continue;
      score += 1;
    } else if (
      filters.experience &&
      filters.experience !== "Any" &&
      filters.experience !== 30
    ) {
      const enteredExp = parseFloat(filters.experience);
      const totalExp = parseFloat(candidate.totalExperience);
      if (isNaN(totalExp) || Math.floor(totalExp) !== Math.floor(enteredExp))
        continue;
      score += 1;
    }

    // ---------------- SKILLS ----------------
    if (filters.skills?.length) {
      const skills = candidate.skillsJson?.map((s) => s.name) || [];
      let skillScore = 0;

      for (const fs of filters.skills) {
        const best = skills.length
          ? Math.max(...skills.map((cs) => smartMatchScore(cs, fs)), 0)
          : 0;

        if (best === 0) {
          skillScore = -1;
          break;
        }
        skillScore += best;
      }

      if (skillScore < 0) continue;
      score += skillScore;
    }

    // ---------------- CLOUDS ----------------
    if (filters.clouds?.length) {
      const clouds = [
        ...(candidate.primaryClouds?.map((c) => c.name) || []),
        ...(candidate.secondaryClouds?.map((c) => c.name) || []),
      ];
      let cloudScore = 0;

      for (const fc of filters.clouds) {
        const best = clouds.length
          ? Math.max(...clouds.map((cc) => fuzzyMatchScore(cc, fc)), 0)
          : 0;

        if (best === 0) {
          cloudScore = -1;
          break;
        }
        cloudScore += best;
      }

      if (cloudScore < 0) continue;
      score += cloudScore;
    }

    // ---------------- LOCATION ----------------
    if (filters.location?.length) {
      const locations = candidate.preferredLocation || [];

      const best = Math.max(
        ...filters.location.map((loc) =>
          locations.length
            ? Math.max(...locations.map((cl) => fuzzyMatchScore(cl, loc)))
            : 0,
        ),
        0,
      );

      if (best === 0) continue;
      score += best;
    }

    // ---------------- JOB TYPE ----------------
    if (filters.jobType?.length) {
      const jobType = candidate.jobType?.toLowerCase() || "";
      if (!filters.jobType.some((jt) => jobType.includes(jt.toLowerCase())))
        continue;
      score += 0.5;
    }

    // ---------------- EMPLOYMENT TYPE ----------------
    if (filters.employmentType?.length) {
      const emp = candidate.employmentType?.toLowerCase() || "";
      if (!filters.employmentType.some((et) => emp.includes(et.toLowerCase())))
        continue;
      score += 0.5;
    }

    // ---------------- CANDIDATE TYPE ----------------
    if (filters.candidateType?.length) {
      const wantsVendor = filters.candidateType.includes("vendor");
      const wantsIndividual = filters.candidateType.includes("individual");
      if (wantsVendor && !candidate.vendorId) continue;
      if (wantsIndividual && candidate.vendorId) continue;
      score += 0.5;
    }

    scored.push({ ...candidate, _score: score });
  }

  if (filters.expMin != null || filters.expMax != null) {
    return scored.sort(
      (a, b) =>
        parseFloat(a.totalExperience || 0) - parseFloat(b.totalExperience || 0),
    );
  }

  // 🔥 SORT BY RELEVANCE
  return scored.sort((a, b) => b._score - a._score);
};

export { applyFilters, applyCandidateFilters };
