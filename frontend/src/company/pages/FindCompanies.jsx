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
        <div style={styles.spinner} />
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
          Loading companies...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <p style={styles.pageSub}>
          Browse verified cloud partners and service providers
        </p>
      </div>

      {/* Search */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInputNew}
            type="text"
            placeholder="Search companies, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Empty */}
      {!filtered.length && (
        <div style={styles.empty}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
          <p style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
            No companies found
          </p>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            Try adjusting your search or filter
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
      {/* Top: Avatar + Name + Badges (top-right) */}
      <div style={styles.cardTop}>
        <div style={styles.avatar}>
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            initials
          )}
        </div>

        {/* Name + Location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.cardName}>{company.name}</div>
          {company.headquarters && (
            <div style={styles.cardLocation}>
              <span style={styles.locDot} />
              {company.headquarters}
            </div>
          )}
        </div>

        {/* ✅ Partner Tier + Type badges — top-right corner */}
        {/* <div style={styles.topBadges}>
          
          <div style={{ ...styles.topBadge, ...styles.topBadgeTier }}>
            {tierLogo && (
              <img src={tierLogo} alt={tierKey} style={styles.topBadgeImg} />
            )}
            <div style={styles.topBadgeInner}>
              <span style={{ ...styles.topBadgeLabel, color: "#534AB7" }}>
                Tier
              </span>
              <span style={{ ...styles.topBadgeValue, color: "#3C3489" }}>
                {company.partnerTier || "—"}
              </span>
            </div>
          </div>

         
          <div style={{ ...styles.topBadge, ...styles.topBadgeType }}>
            {typeLogo && (
              <img src={typeLogo} alt={typeKey} style={styles.topBadgeImg} />
            )}
            <div style={styles.topBadgeInner}>
              <span style={{ ...styles.topBadgeLabel, color: "#3B6D11" }}>
                Type
              </span>
              <span style={{ ...styles.topBadgeValue, color: "#27500A" }}>
                {formatPartnerType(company.partnerType)}
              </span>
            </div>
          </div>
        </div> */}
        {/* ✅ Partner Tier + Type badges — top-right corner */}
        <div style={styles.topBadges}>
          <div style={{ ...styles.topBadge, ...styles.topBadgeTier }}>
            {tierLogo && (
              <img src={tierLogo} alt={tierKey} style={styles.topBadgeImg} />
            )}
          </div>
          <div style={{ ...styles.topBadge, ...styles.topBadgeType }}>
            {typeLogo && (
              <img src={typeLogo} alt={typeKey} style={styles.topBadgeImg} />
            )}
          </div>
        </div>
      </div>

      {/* Tagline */}
      {company.tagline && <p style={styles.tagline}>{company.tagline}</p>}

      {/* Cloud Expertise */}
      <div style={styles.sectionLabel}>Cloud expertise</div>
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

      {/* Certifications */}
      <div style={styles.sectionLabel}>Certifications</div>
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

      {/* Footer: arrow only */}
      <div style={styles.cardFooter}>
        <div
          style={{
            ...styles.arrowBtn,
            ...(hovered ? styles.arrowBtnHovered : {}),
          }}
        >
          →
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "1.5rem 0 2rem",
    fontFamily: "var(--font-sans)",
  },
  pageHeader: {
    marginBottom: "1.25rem",
  },
  pageSub: {
    fontSize: 14,
    color: "var(--color-text-secondary)",
    marginTop: 4,
  },
  searchRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: "1.5rem",
    alignItems: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  card: {
    background: "#f8f9fc",
    border: "1px solid #e2e8f0",
    borderLeft: "3px solid #378ADD",
    borderRadius: 16,
    // borderRadius: "var(--border-radius-lg)",
    padding: "1.2rem",
    cursor: "pointer",
    transition: "border-color 0.18s, background 0.18s",
  },
  cardHovered: {
    background: "#ffffff",
    borderColor: "#85B7EB",
    borderLeftColor: "#185FA5",
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  // avatar: {
  //   width: 58,
  //   height: 58,
  //   // borderRadius: "var(--border-radius-md)",
  //   borderRadius: "50%",
  //   background: "#E6F1FB",
  //   border: "0.5px solid #B5D4F4",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   fontSize: 15,
  //   fontWeight: 500,
  //   color: "#185FA5",
  //   flexShrink: 0,s
  //   overflow: "hidden",
  // },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 12, // ✅ rounded square (same feel as badges)
    background: "#F1F5F9", // light neutral bg (better than blue)
    border: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    padding: 8, // ✅ IMPORTANT (gives badge look)
  },
  cardName: {
    fontSize: 17,
    fontWeight: 500,
    color: "var(--color-text-primary)",
    lineHeight: 1.3,
  },
  cardLocation: {
    fontSize: 14,
    color: "var(--color-text-secondary)",
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  locDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#5DCAA5",
    display: "inline-block",
    flexShrink: 0,
  },
  tagline: {
    fontSize: 13,
    color: "var(--color-text-secondary)",
    lineHeight: 1.5,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #e2e8f0",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    textTransform: "none",
    letterSpacing: "0.06em",
    marginBottom: 6,
    marginTop: 10,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
  },
  tag: {
    fontSize: 11,
    padding: "3px 9px",
    borderRadius: 999,
    border: "0.5px solid",
    fontWeight: 400,
  },
  tagBlue: {
    background: "#E6F1FB",
    color: "#185FA5",
    borderColor: "#B5D4F4",
  },
  tagGreen: {
    background: "#EAF3DE",
    color: "#3B6D11",
    borderColor: "#C0DD97",
  },
  tagMuted: {
    background: "var(--color-background-secondary)",
    color: "var(--color-text-tertiary)",
    borderColor: "var(--color-border-tertiary)",
    fontStyle: "italic",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 4,
    // borderTop: "0.5px solid #e2e8f0",
  },

  // ✅ New top-right badge styles
  // topBadges: {
  //   display: "flex",
  //   // flexDirection: "column",
  //   flexDirection: "row",
  //   gap: 5,
  //   flexShrink: 0,
  //   alignItems: "flex-end",
  // },
  // topBadge: {
  //   display: "flex",
  //   alignItems: "center",
  //   gap: 6,
  //   borderRadius: 8,
  //   padding: "5px 8px",
  //   border: "0.5px solid",
  // },
  topBadges: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    flexShrink: 0,
    alignItems: "flex-start",
  },
  topBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: "8px",
    border: "0.5px solid",
  },

  topBadgeTier: {
    background: "#EEEDFE",
    borderColor: "#AFA9EC",
  },
  topBadgeType: {
    background: "#EAF3DE",
    borderColor: "#C0DD97",
  },
  // topBadgeImg: {
  //   width: 18,
  //   height: 18,
  //   objectFit: "contain",
  //   flexShrink: 0,
  // },
  topBadgeImg: {
    width: 56,
    height: 56,
    objectFit: "contain",
    flexShrink: 0,
  },
  topBadgeInner: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  topBadgeLabel: {
    fontSize: 9,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  topBadgeValue: {
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  // kept from original
  partnerBadges: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    flex: 1,
  },
  partnerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    borderRadius: 10,
    padding: "7px 11px",
    border: "0.5px solid",
  },
  partnerBadgeTier: {
    background: "#EEEDFE",
    borderColor: "#AFA9EC",
  },
  partnerBadgeType: {
    background: "#EAF3DE",
    borderColor: "#C0DD97",
  },
  partnerLogoWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    boxShadow: "0 0 0 0.5px rgba(0,0,0,0.08)",
  },
  partnerLogoImg: {
    width: 22,
    height: 22,
    objectFit: "contain",
  },
  partnerBadgeInner: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  partnerBadgeLabel: {
    fontSize: 10,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  partnerBadgeValue: {
    fontSize: 12,
    fontWeight: 500,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "0.5px solid var(--color-border-secondary)",
    background: "var(--color-background-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--color-text-secondary)",
    fontSize: 14,
    flexShrink: 0,
  },
  arrowBtnHovered: {
    background: "#E6F1FB",
    borderColor: "#85B7EB",
    color: "#185FA5",
  },
  empty: {
    textAlign: "center",
    padding: "3rem 1rem",
    color: "var(--color-text-secondary)",
    fontSize: 14,
  },
  spinWrap: {
    textAlign: "center",
    padding: "3rem",
    color: "var(--color-text-secondary)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#fff",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  searchIcon: {
    fontSize: 15,
    color: "#6b7280",
  },
  searchInputNew: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 14,
    background: "transparent",
    color: "#111827",
  },
};
