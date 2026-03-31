export const mergeResumeChunks = (chunks) => {
  const merged = {
    name: "",
    email: "",
    skills: [],
    experience: [],
    education: [],
  };

  for (const chunk of chunks) {
    if (!chunk || typeof chunk !== "object") continue;

    if (!merged.name && chunk.name) merged.name = chunk.name;
    if (!merged.email && chunk.email) merged.email = chunk.email;

    if (Array.isArray(chunk.skills)) {
      merged.skills = [...new Set([...merged.skills, ...chunk.skills])];
    }

    if (Array.isArray(chunk.experience)) {
      merged.experience = [...merged.experience, ...chunk.experience];
    }

    if (Array.isArray(chunk.education)) {
      merged.education = [...merged.education, ...chunk.education];
    }

    // Carry over any other top-level fields not explicitly handled
    for (const key of Object.keys(chunk)) {
      if (!(key in merged)) {
        merged[key] = chunk[key];
      }
    }
  }

  return merged;
};
