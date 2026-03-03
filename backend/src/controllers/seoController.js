import prisma from "../config/prisma.js";

function mapEmploymentType(type) {
  const map = {
    FullTime: "FULL_TIME",
    PartTime: "PART_TIME",
    Contract: "CONTRACTOR",
    Internship: "INTERN",
    Freelancer: "OTHER",
  };
  return map[type] || "OTHER";
}

const getJobSEOMeta = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        role: true,
        description: true,
        location: true,
        salary: true,
        employmentType: true,
        experienceLevel: true,
        skills: true,
        companyName: true,
        // companyLogo: true,
        status: true,
        isDeleted: true,
        createdAt: true,
        applicationDeadline: true,
      },
    });

    if (!job || job.isDeleted) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    // Build clean SEO title
    // e.g. "Salesforce Apex Developer Job in Bangalore (Senior) | ForceHead"
    const locationPart = job.location ? ` in ${job.location}` : " in India";
    const levelPart = job.experienceLevel ? ` (${job.experienceLevel})` : "";
    const title = `${job.role}${locationPart}${levelPart} | ForceHead`;

    // Build meta description — truncate to ~155 chars
    const rawDescription = job.description?.replace(/\n/g, " ").trim() || "";
    const description =
      rawDescription.length > 155
        ? rawDescription.slice(0, 152) + "..."
        : rawDescription;

    const canonicalUrl = `${process.env.FRONTEND_URL}/job/${job.id}`;

    // Google Jobs structured data (JobPosting schema)
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.role,
      description: job.description,
      datePosted: job.createdAt,
      validThrough: job.applicationDeadline || undefined,
      employmentType: mapEmploymentType(job.employmentType),
      hiringOrganization: {
        "@type": "Organization",
        name: job.companyName || "Company on ForceHead",
        logo:
          job.companyLogo || `${process.env.FRONTEND_URL}/forceheadlogo.svg`,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location || "India",
          addressCountry: "IN",
        },
      },
      baseSalary: job.salary
        ? {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: {
              "@type": "QuantitativeValue",
              value: job.salary,
              unitText: "YEAR",
            },
          }
        : undefined,
    };

    // Remove undefined keys from structuredData
    const cleanStructuredData = JSON.parse(JSON.stringify(structuredData));

    return res.status(200).json({
      status: "success",
      seo: {
        title,
        description,
        canonicalUrl,
        ogImage:
          job.companyLogo || `${process.env.FRONTEND_URL}/forceheadlogo.svg`,
        structuredData: cleanStructuredData,
      },
    });
  } catch (error) {
    console.error("getJobSEOMeta Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const sitemap = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL;

    // ✅ Fetch only public jobs
    const jobs = await prisma.job.findMany({
      where: {
        isDeleted: false,
        status: "Open", // adjust based on your schema
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Static pages
    const staticUrls = `
      <url>
        <loc>${baseUrl}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>

      <url>
        <loc>${baseUrl}/terms-and-conditions</loc>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
      </url>

      <url>
        <loc>${baseUrl}/contact</loc>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
      </url>
    `;

    // Dynamic job URLs
    const jobUrls = jobs
      .map((job) => {
        return `
          <url>
            <loc>${baseUrl}/job/${job.id}</loc>
            <lastmod>${job.updatedAt.toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
          </url>
        `;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticUrls}
        ${jobUrls}
      </urlset>
    `;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
};

export { getJobSEOMeta, sitemap };
