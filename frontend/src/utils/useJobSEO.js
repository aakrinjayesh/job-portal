import { useState, useEffect } from "react";

export const useJobSEO = (jobId) => {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seo/job/${jobId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setSeo(data.seo);
      })
      .catch(() => {
        // Fail silently — default meta tags from index.html apply
      });
  }, [jobId]);

  return seo;
};
