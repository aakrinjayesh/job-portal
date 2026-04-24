// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { GetCompaniesList } from "../../company/api/api";
// import summitLogo from "../../assets/newsummitpartner.png";
// import crestLogo from "../../assets/newsalesforcecrestpartner.png";
// import ridgeLogo from "../../assets/newsalesforceridgepartner.png";
// import baseLogo from "../../assets/base.png";

// import consultingLogo from "../../assets/salesforceconsultingpartner.png";
// import implementationLogo from "../../assets/implementation.png";
// import systemLogo from "../../assets/system.png";
// import managedLogo from "../../assets/newsalesforcemanagedproviderservicepartner.png";
// import isvLogo from "../../assets/newisvpartner.png";
// import resellerLogo from "../../assets/reseller.png";

// const partnerTierLogos = {
//   Summit: summitLogo,
//   Crest: crestLogo,
//   Ridge: ridgeLogo,
//   Base: baseLogo,
// };

// const partnerTypeLogos = {
//   Consulting: consultingLogo,
//   "Consulting Partner": consultingLogo,

//   Implementation: implementationLogo,
//   "Implementation Partner": implementationLogo,

//   "System Integrator": systemLogo,

//   "Managed Services Provider": managedLogo,

//   ISV: isvLogo,
//   "ISV (Product Partner)": isvLogo,

//   Reseller: resellerLogo,
//   "Reseller Partner": resellerLogo,
// };

// export default function FindCompanies() {
//   const [companies, setCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [activeFilter, setActiveFilter] = useState("All");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const controller = new AbortController();

//     const fetchCompanies = async () => {
//       try {
//         const res = await GetCompaniesList(controller.signal);
//         console.log("Companies 👉", res);
//         setCompanies(res.data || []);
//       } catch (error) {
//         console.error("Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCompanies();
//     return () => controller.abort();
//   }, []);

//   const filtered = companies.filter((c) => {
//     const matchSearch =
//       c.name?.toLowerCase().includes(search.toLowerCase()) ||
//       c.headquarters?.toLowerCase().includes(search.toLowerCase()) ||
//       c.clouds?.some((cloud) =>
//         cloud.toLowerCase().includes(search.toLowerCase()),
//       );
//     const matchFilter = true;
//     return matchSearch && matchFilter;
//   });

//   const getInitials = (name = "") =>
//     name
//       .split(" ")
//       .slice(0, 2)
//       .map((w) => w[0])
//       .join("")
//       .toUpperCase();

//   if (loading) {
//     return (
//       <div style={styles.spinWrap}>
//         <div style={styles.spinner} />
//         <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
//           Loading companies...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.page}>
//       {/* Header */}
//       <div style={styles.pageHeader}>
//         <p style={styles.pageSub}>
//           Browse verified cloud partners and service providers
//         </p>
//       </div>

//       {/* Search */}
//       <div style={styles.searchRow}>
//         <div style={styles.searchBox}>
//           <span style={styles.searchIcon}>🔍</span>
//           <input
//             style={styles.searchInputNew}
//             type="text"
//             placeholder="Search companies, location..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Empty */}
//       {!filtered.length && (
//         <div style={styles.empty}>
//           <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
//           <p style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
//             No companies found
//           </p>
//           <p style={{ fontSize: 13, marginTop: 4 }}>
//             Try adjusting your search or filter
//           </p>
//         </div>
//       )}

//       {/* Grid */}
//       <div style={styles.grid}>
//         {filtered.map((company) => (
//           <CompanyCard
//             key={company.id}
//             company={company}
//             initials={getInitials(company.name)}
//             onClick={() => navigate(`/company/public/${company.slug}`)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// function CompanyCard({ company, initials, onClick }) {
//   const tierKey = company.partnerTier?.replace(" Partner", "");
//   const typeKey = company.partnerType;
//   const [hovered, setHovered] = useState(false);

//   const tierLogo = partnerTierLogos[tierKey];
//   const typeLogo = partnerTypeLogos[typeKey];

//   const formatPartnerType = (type) => {
//     if (!type) return "—";
//     if (type === "System Integrator") return "System Integration Partner";
//     if (type === "ISV") return "ISV (Product Partner)";
//     if (type === "Managed Services Provider")
//       return "Managed Services Provider Partner";
//     return type;
//   };

//   return (
//     <div
//       onClick={onClick}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         ...styles.card,
//         ...(hovered ? styles.cardHovered : {}),
//       }}
//     >
//       {/* Top: Avatar + Name + Badges (top-right) */}
//       <div style={styles.cardTop}>
//         <div style={styles.avatar}>
//           {company.logoUrl ? (
//             <img
//               src={company.logoUrl}
//               alt={company.name}
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "contain",
//               }}
//             />
//           ) : (
//             initials
//           )}
//         </div>

//         {/* Name + Location */}
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={styles.cardName}>{company.name}</div>
//           {company.headquarters && (
//             <div style={styles.cardLocation}>
//               <span style={styles.locDot} />
//               {company.headquarters}
//             </div>
//           )}
//         </div>

//         {/* ✅ Partner Tier + Type badges — top-right corner */}
//         {/* <div style={styles.topBadges}>

//           <div style={{ ...styles.topBadge, ...styles.topBadgeTier }}>
//             {tierLogo && (
//               <img src={tierLogo} alt={tierKey} style={styles.topBadgeImg} />
//             )}
//             <div style={styles.topBadgeInner}>
//               <span style={{ ...styles.topBadgeLabel, color: "#534AB7" }}>
//                 Tier
//               </span>
//               <span style={{ ...styles.topBadgeValue, color: "#3C3489" }}>
//                 {company.partnerTier || "—"}
//               </span>
//             </div>
//           </div>

//           <div style={{ ...styles.topBadge, ...styles.topBadgeType }}>
//             {typeLogo && (
//               <img src={typeLogo} alt={typeKey} style={styles.topBadgeImg} />
//             )}
//             <div style={styles.topBadgeInner}>
//               <span style={{ ...styles.topBadgeLabel, color: "#3B6D11" }}>
//                 Type
//               </span>
//               <span style={{ ...styles.topBadgeValue, color: "#27500A" }}>
//                 {formatPartnerType(company.partnerType)}
//               </span>
//             </div>
//           </div>
//         </div> */}
//         {/* ✅ Partner Tier + Type badges — top-right corner */}
//         <div style={styles.topBadges}>
//           <div style={{ ...styles.topBadge, ...styles.topBadgeTier }}>
//             {tierLogo && (
//               <img src={tierLogo} alt={tierKey} style={styles.topBadgeImg} />
//             )}
//           </div>
//           <div style={{ ...styles.topBadge, ...styles.topBadgeType }}>
//             {typeLogo && (
//               <img src={typeLogo} alt={typeKey} style={styles.topBadgeImg} />
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Tagline */}
//       {company.tagline && <p style={styles.tagline}>{company.tagline}</p>}

//       {/* Cloud Expertise */}
//       <div style={styles.sectionLabel}>Cloud expertise</div>
//       <div style={styles.tags}>
//         {company.clouds?.length ? (
//           company.clouds.map((cloud, i) => (
//             <span key={i} style={{ ...styles.tag, ...styles.tagBlue }}>
//               {cloud}
//             </span>
//           ))
//         ) : (
//           <span style={{ ...styles.tag, ...styles.tagMuted }}>No data</span>
//         )}
//       </div>

//       {/* Certifications */}
//       <div style={styles.sectionLabel}>Certifications</div>
//       <div style={styles.tags}>
//         {company.certifications?.length ? (
//           company.certifications.map((c, i) => (
//             <span key={i} style={{ ...styles.tag, ...styles.tagGreen }}>
//               {c}
//             </span>
//           ))
//         ) : (
//           <span style={{ ...styles.tag, ...styles.tagMuted }}>No data</span>
//         )}
//       </div>

//       {/* Footer: arrow only */}
//       <div style={styles.cardFooter}>
//         <div
//           style={{
//             ...styles.arrowBtn,
//             ...(hovered ? styles.arrowBtnHovered : {}),
//           }}
//         >
//           →
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   page: {
//     padding: "1.5rem 0 2rem",
//     fontFamily: "var(--font-sans)",
//   },
//   pageHeader: {
//     marginBottom: "1.25rem",
//   },
//   pageSub: {
//     fontSize: 14,
//     color: "var(--color-text-secondary)",
//     marginTop: 4,
//   },
//   searchRow: {
//     display: "flex",
//     flexWrap: "wrap",
//     gap: 10,
//     marginBottom: "1.5rem",
//     alignItems: "center",
//   },
//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, 1fr)",
//     gap: 16,
//   },
//   card: {
//     background: "#f8f9fc",
//     border: "1px solid #e2e8f0",
//     borderLeft: "3px solid #378ADD",
//     borderRadius: 16,
//     // borderRadius: "var(--border-radius-lg)",
//     padding: "1.2rem",
//     cursor: "pointer",
//     transition: "border-color 0.18s, background 0.18s",
//   },
//   cardHovered: {
//     background: "#ffffff",
//     borderColor: "#85B7EB",
//     borderLeftColor: "#185FA5",
//   },
//   cardTop: {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: 12,
//     marginBottom: 12,
//   },
//   // avatar: {
//   //   width: 58,
//   //   height: 58,
//   //   // borderRadius: "var(--border-radius-md)",
//   //   borderRadius: "50%",
//   //   background: "#E6F1FB",
//   //   border: "0.5px solid #B5D4F4",
//   //   display: "flex",
//   //   alignItems: "center",
//   //   justifyContent: "center",
//   //   fontSize: 15,
//   //   fontWeight: 500,
//   //   color: "#185FA5",
//   //   flexShrink: 0,s
//   //   overflow: "hidden",
//   // },
//   avatar: {
//     width: 70,
//     height: 70,
//     borderRadius: 12, // ✅ rounded square (same feel as badges)
//     background: "#F1F5F9", // light neutral bg (better than blue)
//     border: "1px solid #E2E8F0",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//     overflow: "hidden",
//     padding: 8, // ✅ IMPORTANT (gives badge look)
//   },
//   cardName: {
//     fontSize: 17,
//     fontWeight: 500,
//     color: "var(--color-text-primary)",
//     lineHeight: 1.3,
//   },
//   cardLocation: {
//     fontSize: 14,
//     color: "var(--color-text-secondary)",
//     marginTop: 2,
//     display: "flex",
//     alignItems: "center",
//     gap: 4,
//   },
//   locDot: {
//     width: 6,
//     height: 6,
//     borderRadius: "50%",
//     background: "#5DCAA5",
//     display: "inline-block",
//     flexShrink: 0,
//   },
//   tagline: {
//     fontSize: 13,
//     color: "var(--color-text-secondary)",
//     lineHeight: 1.5,
//     marginBottom: 12,
//     paddingBottom: 12,
//     borderBottom: "1px solid #e2e8f0",
//   },
//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: 500,
//     color: "var(--color-text-tertiary)",
//     textTransform: "none",
//     letterSpacing: "0.06em",
//     marginBottom: 6,
//     marginTop: 10,
//   },
//   tags: {
//     display: "flex",
//     flexWrap: "wrap",
//     gap: 5,
//   },
//   tag: {
//     fontSize: 11,
//     padding: "3px 9px",
//     borderRadius: 999,
//     border: "0.5px solid",
//     fontWeight: 400,
//   },
//   tagBlue: {
//     background: "#E6F1FB",
//     color: "#185FA5",
//     borderColor: "#B5D4F4",
//   },
//   tagGreen: {
//     background: "#EAF3DE",
//     color: "#3B6D11",
//     borderColor: "#C0DD97",
//   },
//   tagMuted: {
//     background: "var(--color-background-secondary)",
//     color: "var(--color-text-tertiary)",
//     borderColor: "var(--color-border-tertiary)",
//     fontStyle: "italic",
//   },
//   cardFooter: {
//     display: "flex",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     marginTop: 6,
//     paddingTop: 4,
//     // borderTop: "0.5px solid #e2e8f0",
//   },

//   // ✅ New top-right badge styles
//   // topBadges: {
//   //   display: "flex",
//   //   // flexDirection: "column",
//   //   flexDirection: "row",
//   //   gap: 5,
//   //   flexShrink: 0,
//   //   alignItems: "flex-end",
//   // },
//   // topBadge: {
//   //   display: "flex",
//   //   alignItems: "center",
//   //   gap: 6,
//   //   borderRadius: 8,
//   //   padding: "5px 8px",
//   //   border: "0.5px solid",
//   // },
//   topBadges: {
//     display: "flex",
//     flexDirection: "row",
//     gap: 5,
//     flexShrink: 0,
//     alignItems: "flex-start",
//   },
//   topBadge: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 8,
//     padding: "8px",
//     border: "0.5px solid",
//   },

//   topBadgeTier: {
//     background: "#EEEDFE",
//     borderColor: "#AFA9EC",
//   },
//   topBadgeType: {
//     background: "#EAF3DE",
//     borderColor: "#C0DD97",
//   },
//   // topBadgeImg: {
//   //   width: 18,
//   //   height: 18,
//   //   objectFit: "contain",
//   //   flexShrink: 0,
//   // },
//   topBadgeImg: {
//     width: 56,
//     height: 56,
//     objectFit: "contain",
//     flexShrink: 0,
//   },
//   topBadgeInner: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 1,
//   },
//   topBadgeLabel: {
//     fontSize: 9,
//     fontWeight: 600,
//     textTransform: "uppercase",
//     letterSpacing: "0.05em",
//   },
//   topBadgeValue: {
//     fontSize: 11,
//     fontWeight: 500,
//     whiteSpace: "nowrap",
//   },

//   // kept from original
//   partnerBadges: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 7,
//     flex: 1,
//   },
//   partnerBadge: {
//     display: "flex",
//     alignItems: "center",
//     gap: 9,
//     borderRadius: 10,
//     padding: "7px 11px",
//     border: "0.5px solid",
//   },
//   partnerBadgeTier: {
//     background: "#EEEDFE",
//     borderColor: "#AFA9EC",
//   },
//   partnerBadgeType: {
//     background: "#EAF3DE",
//     borderColor: "#C0DD97",
//   },
//   partnerLogoWrap: {
//     width: 28,
//     height: 28,
//     borderRadius: 6,
//     background: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//     overflow: "hidden",
//     boxShadow: "0 0 0 0.5px rgba(0,0,0,0.08)",
//   },
//   partnerLogoImg: {
//     width: 22,
//     height: 22,
//     objectFit: "contain",
//   },
//   partnerBadgeInner: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 1,
//   },
//   partnerBadgeLabel: {
//     fontSize: 10,
//     fontWeight: 500,
//     textTransform: "uppercase",
//     letterSpacing: "0.05em",
//   },
//   partnerBadgeValue: {
//     fontSize: 12,
//     fontWeight: 500,
//   },
//   arrowBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: "50%",
//     border: "0.5px solid var(--color-border-secondary)",
//     background: "var(--color-background-primary)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     cursor: "pointer",
//     color: "var(--color-text-secondary)",
//     fontSize: 14,
//     flexShrink: 0,
//   },
//   arrowBtnHovered: {
//     background: "#E6F1FB",
//     borderColor: "#85B7EB",
//     color: "#185FA5",
//   },
//   empty: {
//     textAlign: "center",
//     padding: "3rem 1rem",
//     color: "var(--color-text-secondary)",
//     fontSize: 14,
//   },
//   spinWrap: {
//     textAlign: "center",
//     padding: "3rem",
//     color: "var(--color-text-secondary)",
//   },
//   searchBox: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     padding: "10px 14px",
//     borderRadius: 999,
//     border: "1px solid #d1d5db",
//     background: "#fff",
//     width: "100%",
//     maxWidth: 480,
//     boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
//   },
//   searchIcon: {
//     fontSize: 15,
//     color: "#6b7280",
//   },
//   searchInputNew: {
//     border: "none",
//     outline: "none",
//     width: "100%",
//     fontSize: 14,
//     background: "transparent",
//     color: "#111827",
//   },
// };

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetCompaniesList } from "../../company/api/api";
import summitLogo from "../../assets/newsummitpartner.png";
import crestLogo from "../../assets/newsalesforcecrestpartner.png";
import ridgeLogo from "../../assets/newsalesforceridgepartner.png";
import baseLogo from "../../assets/base.png";
import consultingLogo from "../../assets/salesforceconsultingpartner.png";
import implementationLogo from "../../assets/implementation.png";
import systemLogo from "../../assets/system.png";
import managedLogo from "../../assets/newsalesforcemanagedproviderservicepartner.png";
import isvLogo from "../../assets/newisvpartner.png";
import resellerLogo from "../../assets/reseller.png";

const partnerTierLogos = {
  Summit: summitLogo,
  Crest: crestLogo,
  Ridge: ridgeLogo,
  Base: baseLogo,
};

const partnerTypeLogos = {
  Consulting: consultingLogo,
  "Consulting Partner": consultingLogo,
  Implementation: implementationLogo,
  "Implementation Partner": implementationLogo,
  "System Integrator": systemLogo,
  "Managed Services Provider": managedLogo,
  ISV: isvLogo,
  "ISV (Product Partner)": isvLogo,
  Reseller: resellerLogo,
  "Reseller Partner": resellerLogo,
};

export default function FindCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchCompanies = async () => {
      try {
        const res = await GetCompaniesList(controller.signal);
        console.log("Companies 👉", res);
        setCompanies(res.data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
    return () => controller.abort();
  }, []);

  const filtered = companies.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.headquarters?.toLowerCase().includes(search.toLowerCase()) ||
      c.clouds?.some((cloud) =>
        cloud.toLowerCase().includes(search.toLowerCase()),
      );
    const matchFilter = true;
    return matchSearch && matchFilter;
  });

  const getInitials = (name = "") =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  if (loading) {
    return (
      <div style={styles.spinWrap}>
        <div style={styles.spinRing} />
        <p style={styles.spinText}>Loading companies…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Sub-header */}
      <p style={styles.pageSub}>
        Browse verified cloud partners and service providers
      </p>

      {/* Search bar */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2" />
            <path
              d="M16.5 16.5 21 21"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by name, location, or cloud…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={styles.clearBtn}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {filtered.length > 0 && (
          <span style={styles.resultCount}>
            {filtered.length} {filtered.length === 1 ? "company" : "companies"}
          </span>
        )}
      </div>

      {/* Empty state */}
      {!filtered.length && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="#D1D5DB"
                strokeWidth="1.5"
              />
              <path
                d="M16.5 16.5 21 21"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M8 11h6M11 8v6"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p style={styles.emptyTitle}>No companies found</p>
          <p style={styles.emptySub}>
            Try a different search term or clear your query
          </p>
        </div>
      )}

      {/* Grid */}
      <div style={styles.grid}>
        {filtered.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            initials={getInitials(company.name)}
            onClick={() => navigate(`/company/public/${company.slug}`)}
          />
        ))}
      </div>
    </div>
  );
}

function CompanyCard({ company, initials, onClick }) {
  const tierKey = company.partnerTier?.replace(" Partner", "");
  const typeKey = company.partnerType;
  const [hovered, setHovered] = useState(false);

  const tierLogo = partnerTierLogos[tierKey];
  const typeLogo = partnerTypeLogos[typeKey];

  const formatPartnerType = (type) => {
    if (!type) return "—";
    if (type === "System Integrator") return "System Integration Partner";
    if (type === "ISV") return "ISV (Product Partner)";
    if (type === "Managed Services Provider")
      return "Managed Services Provider Partner";
    return type;
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHovered : {}),
      }}
    >
      {/* Card top bar accent */}
      <div style={styles.cardAccent} />

      {/* Header row */}
      <div style={styles.cardHeader}>
        {/* Avatar */}
        <div style={styles.avatar}>
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={styles.avatarText}>{initials}</span>
          )}
        </div>

        {/* Name + location */}
        <div style={styles.headerMeta}>
          <div style={styles.cardName}>{company.name}</div>
          {company.headquarters && (
            <div style={styles.cardLocation}>
              <svg
                width="11"
                height="13"
                fill="none"
                viewBox="0 0 12 14"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"
                  fill="#5DCAA5"
                />
                <circle cx="6" cy="5" r="2" fill="#fff" />
              </svg>
              {company.headquarters}
            </div>
          )}
        </div>

        {/* Partner badge logos */}
        <div style={styles.badgeGroup}>
          {tierLogo && (
            <div style={{ ...styles.badgeWrap, ...styles.badgeTier }}>
              <img src={tierLogo} alt={tierKey} style={styles.badgeImg} />
            </div>
          )}
          {typeLogo && (
            <div style={{ ...styles.badgeWrap, ...styles.badgeType }}>
              <img src={typeLogo} alt={typeKey} style={styles.badgeImg} />
            </div>
          )}
        </div>
      </div>

      {/* Tagline */}
      {company.tagline && <p style={styles.tagline}>{company.tagline}</p>}

      {/* Divider */}
      <div style={styles.divider} />

      {/* Cloud expertise */}
      <div style={styles.section}>
        <span style={styles.sectionLabel}>Cloud expertise</span>
        <div style={styles.tags}>
          {company.clouds?.length ? (
            company.clouds.map((cloud, i) => (
              <span key={i} style={{ ...styles.tag, ...styles.tagBlue }}>
                {cloud}
              </span>
            ))
          ) : (
            <span style={{ ...styles.tag, ...styles.tagMuted }}>No data</span>
          )}
        </div>
      </div>

      {/* Certifications */}
      <div style={styles.section}>
        <span style={styles.sectionLabel}>Certifications</span>
        <div style={styles.tags}>
          {company.certifications?.length ? (
            company.certifications.map((c, i) => (
              <span key={i} style={{ ...styles.tag, ...styles.tagGreen }}>
                {c}
              </span>
            ))
          ) : (
            <span style={{ ...styles.tag, ...styles.tagMuted }}>No data</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.cardFooter}>
        <div
          style={{
            ...styles.viewBtn,
            ...(hovered ? styles.viewBtnHovered : {}),
          }}
        >
          View profile
          <svg
            width="13"
            height="13"
            fill="none"
            viewBox="0 0 16 16"
            style={{
              transition: "transform 0.18s",
              transform: hovered ? "translateX(3px)" : "translateX(0)",
            }}
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

const styles = {
  /* ─── Page ─────────────────────────────────────── */
  page: {
    padding: "0.25rem 0 2.5rem",
    fontFamily: "var(--font-sans)",
  },
  pageSub: {
    fontSize: 14,
    color: "var(--color-text-secondary)",
    marginBottom: "1.25rem",
    marginTop: 0,
  },

  /* ─── Search ────────────────────────────────────── */
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: "1.75rem",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #E5E7EB",
    background: "var(--color-background-primary)",
    flex: 1,
    maxWidth: 520,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 14,
    background: "transparent",
    color: "var(--color-text-primary)",
  },
  clearBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#9CA3AF",
    fontSize: 13,
    padding: "0 2px",
    lineHeight: 1,
  },
  resultCount: {
    fontSize: 13,
    color: "var(--color-text-secondary)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  /* ─── Grid ──────────────────────────────────────── */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 18,
  },

  /* ─── Card ──────────────────────────────────────── */
  card: {
    background: "var(--color-background-primary)",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  // cardHovered: {
  //   borderColor: "#85B7EB",
  //   // boxShadow: "0 6px 24px rgba(55,138,221,0.10)",
  //   transform: "translateY(-2px)",
  // },
  cardHovered: {
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  },
  cardAccent: {
    height: 3,
    background: "linear-gradient(90deg, #378ADD 0%, #5DCAA5 100%)",
    flexShrink: 0,
  },

  /* ─── Card header ───────────────────────────────── */
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "16px 16px 0",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    padding: 6,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: 600,
    color: "#378ADD",
    letterSpacing: 0.5,
  },
  headerMeta: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-primary)",
    lineHeight: 1.3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardLocation: {
    fontSize: 12,
    color: "var(--color-text-secondary)",
    marginTop: 3,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  /* ─── Badge logos ───────────────────────────────── */
  badgeGroup: {
    display: "flex",
    gap: 6,
    flexShrink: 0,
  },
  badgeWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "0.5px solid",
    padding: 6,
  },
  badgeTier: {
    background: "#EEEDFE",
    borderColor: "#AFA9EC",
  },
  badgeType: {
    background: "#EAF3DE",
    borderColor: "#C0DD97",
  },
  badgeImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  /* ─── Tagline ───────────────────────────────────── */
  tagline: {
    fontSize: 12.5,
    color: "var(--color-text-secondary)",
    lineHeight: 1.55,
    margin: "10px 16px 0",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  /* ─── Divider ───────────────────────────────────── */
  divider: {
    height: "0.5px",
    background: "#F3F4F6",
    margin: "12px 16px",
  },

  /* ─── Sections ──────────────────────────────────── */
  section: {
    padding: "0 16px 10px",
  },
  sectionLabel: {
    display: "block",
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
    marginBottom: 6,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  tag: {
    fontSize: 11,
    padding: "3px 9px",
    borderRadius: 999,
    border: "0.5px solid",
    fontWeight: 500,
    lineHeight: 1.6,
  },
  tagBlue: {
    background: "#E6F1FB",
    color: "#0C447C",
    borderColor: "#B5D4F4",
  },
  tagGreen: {
    background: "#EAF3DE",
    color: "#27500A",
    borderColor: "#C0DD97",
  },
  tagMuted: {
    background: "var(--color-background-secondary)",
    color: "var(--color-text-tertiary)",
    borderColor: "var(--color-border-tertiary)",
    fontStyle: "italic",
  },

  /* ─── Card footer ───────────────────────────────── */
  cardFooter: {
    marginTop: "auto",
    padding: "4px 16px 14px",
    display: "flex",
    justifyContent: "flex-end",
  },
  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 500,
    color: "#378ADD",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "color 0.15s",
  },
  viewBtnHovered: {
    color: "#185FA5",
  },

  /* ─── Empty state ───────────────────────────────── */
  empty: {
    textAlign: "center",
    padding: "4rem 1rem",
    color: "var(--color-text-secondary)",
  },
  emptyIcon: {
    margin: "0 auto 12px",
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-primary)",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: "var(--color-text-secondary)",
  },

  /* ─── Loader ────────────────────────────────────── */
  spinWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
    gap: 14,
  },
  spinRing: {
    width: 32,
    height: 32,
    border: "2.5px solid #E5E7EB",
    borderTop: "2.5px solid #378ADD",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  spinText: {
    fontSize: 13,
    color: "var(--color-text-secondary)",
    margin: 0,
  },
};

/* Inject keyframe for spinner */
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleEl);
}
