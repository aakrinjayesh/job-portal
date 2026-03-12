import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Tooltip,
  Divider,
  Cascader,
  message,
  Checkbox,
  Button,
  Modal,
  Select,
  Dropdown,
} from "antd";
import {
  StarFilled,
  StarOutlined,
  BookFilled,
  BookOutlined,
  EnvironmentOutlined,
  // LeftOutlined,
  DownOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  // RightOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { LuBookmark } from "react-icons/lu";
import { LuBookmarkCheck } from "react-icons/lu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate, useLocation } from "react-router-dom";
import { SaveJob, UnSaveJob, CVEligibility } from "../../api/api";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

// ✅ MOVED OUTSIDE COMPONENT — defined as module-level functions so they
//    are never redefined on each render and are always in scope everywhere.

const getMinSalary = (salary) => {
  if (!salary && salary !== 0) return 0;
  const str = String(salary).trim();
  const match = str.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
};

const formatSalary = (salary) => {
  if (!salary && salary !== 0) return "Not Disclosed";

  const str = String(salary).trim();

  // Already formatted — e.g. "5.0 - 8.0 LPA"
  if (/lpa/i.test(str)) return str;

  // Range — "500000-800000" or "500000 - 800000" (hyphen or en-dash)
  const rangeMatch = str.match(/^(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)$/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1].replace(/,/g, ""));
    const max = Number(rangeMatch[2].replace(/,/g, ""));
    if (!isNaN(min) && !isNaN(max) && max > 0) {
      return `${(min / 100000).toFixed(1)} - ${(max / 100000).toFixed(1)} LPA`;
    }
  }

  // Single numeric value — "800000"
  const single = Number(str.replace(/,/g, ""));
  if (!isNaN(single) && single > 0) {
    return `${(single / 100000).toFixed(1)} LPA`;
  }

  return "Not Disclosed";
};

// ✅ detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

const JobList = ({
  jobs,
  lastJobRef,
  type,
  jobids,
  portal,
  onUnsave,
  isFilterOpen,
  toggleFilter,
  hideSortAndFilter,
  isMobile: isMobileProp, // ✅ accept from parent
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasAppliedInitialSort = useRef(false);
  // ✅ use prop if passed, otherwise detect locally (fallback)
  const isMobileLocal = useIsMobile();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileLocal;
  const [sortedJobs, setSortedJobs] = useState(jobs);
  const [savedJobIds, setSavedJobIds] = useState(jobids || []);

  const [messageApi, contextHolder] = message.useMessage();
  const [loadingEligibility, setLoadingEligibility] = useState({});
  const [eligibilityByJob, setEligibilityByJob] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  // const [sortOrder, setSortOrder] = useState("dsc");
  // const [sortOrder, setSortOrder] = useState(() => {
  //   return sessionStorage.getItem("findJobSortOrder") || "dsc";
  // });
  const [sortOrder, setSortOrder] = useState(() => {
    const isReturning = sessionStorage.getItem("isReturning");
    if (isReturning) {
      return sessionStorage.getItem("findJobSortOrder_returning") || "dsc";
    }
    return "dsc"; // ✅ fresh visit = always Posted Time
  });
  // ADD this after the existing useEffect for savedJobIds
  useEffect(() => {
    sessionStorage.removeItem("isReturning"); // ✅ clear after reading
  }, []);

  useEffect(() => {
    setSavedJobIds(jobids || []);
  }, [jobids]);
  // Add this useEffect in JobList.jsx
  useEffect(() => {
    return () => {
      // ✅ clear sort when leaving the page
      if (!sessionStorage.getItem("isReturning")) {
        sessionStorage.removeItem("findJobSortOrder_returning");
      }
    };
  }, []);

  useEffect(() => {
    if (!jobs || jobs.length === 0) return;

    let filteredJobs = jobs;

    if (portal === "candidate") {
      filteredJobs = jobs.filter(
        (job) => job.status?.toLowerCase() !== "closed",
      );
    }

    handleSort(sortOrder, filteredJobs);
  }, [jobs, portal]);

  const handleSaveToggle = async (jobId) => {
    const getUser = localStorage.getItem("token");

    if (!getUser) {
      setShowLoginModal(true); // 🚀 open modal
      return;
    }

    const jobIndex = sortedJobs.findIndex((job) => job.id === jobId);
    if (jobIndex === -1) return;

    const originalJobs = [...sortedJobs];
    const originalSavedIds = [...savedJobIds];

    const newJobs = [...sortedJobs];
    const willBeSaved = !newJobs[jobIndex].isSaved;
    newJobs[jobIndex].isSaved = willBeSaved;
    setSortedJobs(newJobs);

    // Update savedJobIds optimistically
    if (willBeSaved) {
      setSavedJobIds((prev) => [...prev, jobId]);
    } else {
      setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
    }

    try {
      if (willBeSaved) {
        const resp = await SaveJob({ jobId });
        if (resp?.status !== "success") throw new Error();
        messageApi.success("Job saved successfully!");
      } else {
        const resp = await UnSaveJob({ jobId });
        if (resp?.status !== "success") throw new Error();
        // messageApi.success("Job removed!");
        messageApi.open({
          content: (
            <span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#ff4d4f",
                  color: "#fff",
                  fontSize: 10,
                  marginRight: 8,
                }}
              >
                ✕
              </span>
              Job removed!
            </span>
          ),
          duration: 3,
        });
        if (type === "save" && onUnsave) {
          onUnsave(jobId);
        }
      }
    } catch (err) {
      console.error(err);
      setSortedJobs(originalJobs);
      setSavedJobIds(originalSavedIds);
      messageApi.error("Something went wrong!");
    }
  };

  const handleSort = (key, jobsToSort = null) => {
    setSortOrder(key);
    // sessionStorage.setItem("findJobSortOrder", key); // ✅ persist it
    sessionStorage.setItem("findJobSortOrder_returning", key); // ✅ save selected sort
    sessionStorage.setItem("isReturning", "true");
    let sorted = [...(jobsToSort || jobs)];
    switch (key) {
      case "posted_desc":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "posted_asc":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "experience_desc":
        sorted.sort(
          (a, b) => (b.experience?.number || 0) - (a.experience?.number || 0),
        );
        break;
      case "experience_asc":
        sorted.sort(
          (a, b) => (a.experience?.number || 0) - (b.experience?.number || 0),
        );
        break;
      case "salary_desc":
        sorted.sort((a, b) => getMinSalary(b.salary) - getMinSalary(a.salary));
        break;
      case "salary_asc":
        sorted.sort((a, b) => getMinSalary(a.salary) - getMinSalary(b.salary));
        break;
      default:
        break;
    }
    setSortedJobs(sorted);
  };

  const sortMenu = {
    items: [
      {
        key: "dsc",
        label: "Posted Time",
      },
      // {
      //   key: "asc",
      //   label: "Posted Time(Oldest)",
      // },
      {
        key: "experience_desc",
        label: "Experience (High to Low)",
      },
      {
        key: "experience_asc",
        label: "Experience (Low to High)",
      },
      {
        key: "salary_desc",
        label: "Budget (High to Low)",
      },
      {
        key: "salary_asc",
        label: "Budget (Low to High)",
      },
    ],
    onClick: ({ key }) => handleSort(key),
  };

  const handleCardClick = (job) => {
    sessionStorage.setItem("lastClickedJobId", job.id);
    sessionStorage.setItem("isReturning", "true");
    sessionStorage.setItem("findJobSortOrder_returning", sortOrder);
    if (portal === "company") {
      navigate(`/company/job/${job.id}`, {
        state: {
          source: "findjob",
          type,
          portal,
          highlight: "findjob",
          savedSortOrder: sortOrder,
          fromPath: location.pathname,
        },
      });
    } else {
      navigate(`/candidate/job/${job.id}`, {
        state: {
          job,
          jobids,
          type,
          portal,
          highlight: "findjob",
          savedSortOrder: sortOrder,
          fromPath: location.pathname,
        },
      });
    }
  };

  const handleCheckEligibility = async (id) => {
    const getUser = localStorage.getItem("token");

    if (!getUser) {
      setShowLoginModal(true); // 🚀 open modal
      return;
    }
    try {
      const payload = {
        jobId: id,
      };
      setLoadingEligibility((prev) => ({ ...prev, [id]: true }));
      const resp = await CVEligibility(payload);
      if (resp?.status === "success") {
        setEligibilityByJob((prev) => ({
          ...prev,
          [id]: resp?.data,
        }));
      } else {
        messageApi.error("Could not analyze eligibility");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEligibility((prev) => ({ ...prev, [id]: false }));
    }
  };

  const TagsWithMore = ({ items = [], tagStyle, max = 3 }) => {
    const visible = items.slice(0, max);
    const remaining = items.length - max;

    return (
      <>
        {visible.map((item, index) => (
          <Tooltip title={item} key={index}>
            <Tag
              style={{
                ...tagStyle,
                borderRadius: 100,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "inline-block",
                maxWidth: 200,
              }}
            >
              {item}
            </Tag>
          </Tooltip>
        ))}

        {remaining > 0 && (
          <Tag
            style={{
              borderRadius: 100,
              background: "#F5F5F5",
              border: "1px dashed #999",
            }}
          >
            +{remaining} more
          </Tag>
        )}
      </>
    );
  };

  const CompactAnalytics = ({ data }) => {
    const a = data?.analysis;

    return (
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 135,
          width: 130,
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
          padding: 8,
          borderRadius: 8,
          fontSize: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Text strong style={{ fontSize: 14, display: "block" }}>
          {data?.fitPercentage}% Match
        </Text>

        <div style={{ marginTop: 6 }}>
          <Text type="secondary">Gap Skills:</Text> {a?.key_gap_skills?.length}
        </div>

        <div>
          <Text type="secondary">Gap Clouds:</Text> {a?.key_gap_clouds?.length}
        </div>

        <div>
          <Text type="secondary">Experience:</Text> {a?.total_experience_years}{" "}
          yr
        </div>

        <div>
          <Text type="secondary">Deal Breakers:</Text>{" "}
          {a?.scoring_breakdown?.deal_breakers_missed}
        </div>
      </div>
    );
  };

  return (
    <Row gutter={[16, 16]}>
      {contextHolder}

      <Modal
        open={showLoginModal}
        title="Login Required"
        onCancel={() => setShowLoginModal(false)}
        okText="Go to Login"
        onOk={() => navigate("/login")}
      >
        <p>Please login to use this button.</p>
      </Modal>

      {!hideSortAndFilter && (
        <Col xs={24}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Tooltip title={isFilterOpen ? "Hide Filters" : "Show Filters"}>
              <Button
                type="text"
                onClick={toggleFilter}
                style={{ fontSize: 20 }}
                icon={
                  isFilterOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />
                }
              />
            </Tooltip>

            <Dropdown menu={sortMenu} trigger={["click"]}>
              <span
                style={{ cursor: "pointer", fontSize: 14, color: "#6B7280" }}
              >
                Sort by{" "}
                <span style={{ color: "#1677FF", fontWeight: 500 }}>
                  {sortMenu.items.find((item) => item.key === sortOrder)
                    ?.label || "Posted Time"}
                </span>{" "}
                <DownOutlined />
              </span>
            </Dropdown>
          </div>
        </Col>
      )}

      {sortedJobs?.map((job, index) => {
        const isLastJob = index === sortedJobs.length - 1;

        return (
          <Col xs={24} key={job.id} ref={isLastJob ? lastJobRef : null}>
            <Card
              hoverable
              onClick={() => handleCardClick(job)}
              style={{
                borderRadius: 12,
                background: "#fff",
                border: "1px solid #EEEEEE",
                minHeight: isMobile ? "auto" : 260,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 0,
                position: "relative",
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                  flexWrap: "nowrap", // ✅ never wrap — prevents save icon falling to next row
                }}
              >
                {/* Logo */}
                <div style={{ flexShrink: 0 }}>
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt="logo"
                      style={{
                        width: isMobile ? 40 : 56,
                        height: isMobile ? 40 : 56,
                        borderRadius: 8,
                        border: "1px solid #F5F5F5",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: isMobile ? 40 : 56,
                        height: isMobile ? 40 : 56,
                        borderRadius: isMobile ? 8 : 12,
                        background: "linear-gradient(135deg, #1677FF, #69B1FF)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? 16 : 22,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {(job.companyName || job.role || job.title || "")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Job info — grows to fill available space */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title + Closed tag */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: isMobile ? 13 : 16,
                        fontWeight: 600,
                        color: "#212121",
                        lineHeight: "20px",
                        flex: 1,
                        minWidth: 0,
                        // ✅ always 2-line clamp — works on both mobile and desktop for long titles
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 2 : 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {job.role || job.title}
                    </div>

                    {job.status === "Closed" && (
                      <Tag color="red" style={{ flexShrink: 0, marginTop: 1 }}>
                        Closed
                      </Tag>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: isMobile ? 12 : 14,
                      color: "#666",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {job.companyName}
                  </div>

                  <div style={{ fontSize: 12, color: "#A3A3A3" }}>
                    {type === "save" && job.savedAt ? (
                      <>Saved {dayjs(job.savedAt).fromNow()}</>
                    ) : (
                      <>
                        Posted{" "}
                        {job?.updatedAt
                          ? dayjs(job.updatedAt).fromNow()
                          : "Recently"}
                      </>
                    )}
                  </div>
                </div>

                {/* ✅ Save icon — always top-right, never wraps down */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveToggle(job.id);
                  }}
                  style={{ cursor: "pointer", flexShrink: 0, paddingTop: 2 }}
                >
                  <Tooltip title={!job?.isSaved ? "Save Job" : "Unsave Job"}>
                    {job?.isSaved ? (
                      <LuBookmarkCheck size={22} color="#1677ff" />
                    ) : (
                      <LuBookmark size={22} color="#9CA3AF" />
                    )}
                  </Tooltip>
                </div>
              </div>

              {/* META */}
              <div
                style={{
                  display: "flex",
                  gap: isMobile ? 6 : 10,
                  flexWrap: "wrap",
                  color: "#666",
                  fontSize: isMobile ? 12 : 13,
                  marginTop: 10,
                  // ✅ removed maxHeight + overflow:hidden — was clipping items on mobile
                }}
              >
                <span>
                  <EnvironmentOutlined /> {job.location}
                </span>
                <Divider type="vertical" style={{ margin: "0 2px" }} />
                <span>₹ {formatSalary(job.salary)}</span>
                <Divider type="vertical" style={{ margin: "0 2px" }} />
                <span>
                  <ClockCircleOutlined /> {job.employmentType}
                </span>
                <Divider type="vertical" style={{ margin: "0 2px" }} />
                <span>
                  <UserOutlined />{" "}
                  {job.experience?.min && job.experience?.max
                    ? `${job.experience.min}-${job.experience.max} ${job.experience.type}`
                    : `${job.experience?.number ?? ""} ${job.experience?.type ?? ""}`}
                </span>
                {job.experienceLevel && (
                  <>
                    <Divider type="vertical" style={{ margin: "0 2px" }} />
                    <span>
                      <LineChartOutlined /> {job.experienceLevel}
                    </span>
                  </>
                )}
              </div>

              {/* SKILLS + CLOUDS — hidden on mobile, shown on desktop */}
              {!isMobile && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 12,
                    flexGrow: 1,
                    overflow: "hidden",
                  }}
                >
                  {job.clouds?.length > 0 && (
                    <div
                      // onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1,
                        padding: 12,
                        border: "1px solid #EEEEEE",
                        borderRadius: 8,
                        minWidth: 220,
                        height: 120, // ✅ fixed height
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        // gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        Related Clouds
                      </div>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        <TagsWithMore
                          items={job.clouds}
                          tagStyle={{
                            background: "#E7F0FE",
                            border: "1px solid #1677FF",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {job.skills?.length > 0 && (
                    <div
                      // onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1,
                        padding: 12,
                        border: "1px solid #EEEEEE",
                        borderRadius: 8,
                        minWidth: 220,
                        height: 120,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        Related Skills
                      </div>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        <TagsWithMore
                          items={job.skills}
                          tagStyle={{
                            background: "#FBEBFF",
                            border: "1px solid #800080",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default JobList;
