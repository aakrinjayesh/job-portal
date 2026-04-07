import React, { useEffect, useState, useRef } from "react";
import {
  Progress,
  message,
  Button,
  Table,
  Tag,
  Modal,
  Input,
  Select,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GetCandidateList, CVEligibility } from "../../api/api";
import { EyeOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import CandidateActivity from "../activity/CandidateActivity";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import FiltersPanel from "../../../candidate/components/Job/FilterPanel";
import CandidateDetails from "./CandidateDetails";

import {
  MarkCandidateReviewed,
  UpdateVendorCandidateStatus,
  MarkCandidateBookmark,
  SaveCandidate,
  UnsaveCandidate,
  GetUserLicenseTier,
} from "../../api/api";

const CandidateList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location?.state?.id;
  const jobRole = location?.state?.jobRole;
  const highlight = location.state.highlight;

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem("candidateListPage");
    return saved ? parseInt(saved) : 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    const saved = sessionStorage.getItem("candidateListPageSize");
    return saved ? parseInt(saved) : 10;
  });
  const pageSizeOptions = [10, 20, 50, 100];
  const [messageAPI, contextHolder] = message.useMessage();
  const [total, setTotal] = useState(0);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState(jobRole);
  const [progress, setProgress] = useState(0);
  const [generatingMap, setGeneratingMap] = useState({});

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [candidateType, setCandidateType] = useState("ALL");

  const [searchText, setSearchText] = useState("");
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityCandidate, setActivityCandidate] = useState(null);
  const [activityTab, setActivityTab] = useState("NOTE");

  // 🆕 SCREENING ANSWERS MODAL STATE
  const [answersModalOpen, setAnswersModalOpen] = useState(false);
  const [answersCandidate, setAnswersCandidate] = useState(null);
  const [actionPopoverId, setActionPopoverId] = useState(null);
  const [flagPopoverId, setFlagPopoverId] = useState(null);
  const [savedCandidateIds, setSavedCandidateIds] = useState(new Set());
  // const [isFilterOpen, setIsFilterOpen] = useState(false);
  // const [activeFilters, setActiveFilters] = useState({});
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [licenseTier, setLicenseTier] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(() => {
    const saved = sessionStorage.getItem("candidateFilterOpen");
    const hasActiveFilters = sessionStorage.getItem("candidateActiveFilters");

    // ✅ If filters are applied, always open the filter panel on refresh
    if (hasActiveFilters) {
      try {
        const parsed = JSON.parse(hasActiveFilters);
        const hasAnyFilter = Object.values(parsed).some((v) => {
          if (Array.isArray(v)) return v.length > 0;
          if (v === null || v === undefined || v === "") return false;
          return true;
        });
        if (hasAnyFilter) return true;
      } catch {
        // ignore parse error
      }
    }

    return saved === "true";
  });
  const [activeFilters, setActiveFilters] = useState(() => {
    const saved = sessionStorage.getItem("candidateActiveFilters");
    return saved ? JSON.parse(saved) : {};
  });
  const [showFilteredCount, setShowFilteredCount] = useState(false);
  const filterCountTimer = useRef(null);
  const isNavigatingToCandidate = useRef(false);
  const [screeningFilters, setScreeningFilters] = useState({});

  const handleScreeningFiltersChange = (filters) => {
    setScreeningFilters(filters);
    // ✅ Show count popup for screening filters too
    // setShowFilteredCount(true);
    // if (filterCountTimer.current) clearTimeout(filterCountTimer.current);
    // filterCountTimer.current = setTimeout(() => {
    //   setShowFilteredCount(false);
    // }, 2500);
  };

  const matchesScreeningFilters = (candidate) => {
    const answers = candidate.screeningAnswers || [];

    for (const [questionId, filterVal] of Object.entries(screeningFilters)) {
      if (!filterVal) continue;

      const answer = answers.find((a) => a.questionId === questionId);
      if (!answer) return false;

      const rawAnswer = String(answer.answer ?? "").trim();

      if (filterVal.type === "NUMBER") {
        const hasMin =
          filterVal.min !== null &&
          filterVal.min !== undefined &&
          String(filterVal.min) !== "";
        const hasMax =
          filterVal.max !== null &&
          filterVal.max !== undefined &&
          String(filterVal.max) !== "";
        if (!hasMin && !hasMax) continue;
        const num = parseFloat(rawAnswer);
        if (isNaN(num)) return false;
        if (hasMin && num < Number(filterVal.min)) return false;
        if (hasMax && num > Number(filterVal.max)) return false;
      }

      if (filterVal.type === "BOOLEAN") {
        if (filterVal.value === null || filterVal.value === undefined) continue;
        // network sends "true" or "false" as plain strings — direct compare
        if (rawAnswer.toLowerCase() !== filterVal.value.toLowerCase())
          return false;
      }

      // if (filterVal.type === "MULTIPLE_CHOICE" || filterVal.type === "MCQ") {
      if (
        filterVal.type === "MULTIPLE_CHOICE" ||
        filterVal.type === "MCQ" ||
        filterVal.type === "SELECT"
      ) {
        if (!Array.isArray(filterVal.values) || filterVal.values.length === 0)
          continue;
        if (!filterVal.values.includes(rawAnswer)) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        const res = await GetUserLicenseTier();
        setLicenseTier(res?.tier); // BASIC / PROFESSIONAL / ORGANISATION
      } catch (err) {
        console.log("License fetch failed");
      }
    };

    fetchLicense();
  }, []);

  // ✅ KEEP ONLY THIS ONE useEffect
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setProgress(10); // ✅ added

        const interval = setInterval(() => {
          // ✅ added
          setProgress((prev) => (prev >= 90 ? prev : prev + 10));
        }, 200);

        const payload = { jobId };
        const response = await GetCandidateList(payload);

        clearInterval(interval); // ✅ added
        setProgress(100); // ✅ added

        if (response?.data && response.data.length > 0) {
          const map = {};
          const savedIds = new Set();
          response.data.forEach((c) => {
            map[c.applicationId] = c.status || "Pending";
            if (c?.profile?.isSaved === true && c?.status === "BookMark") {
              savedIds.add(c.profile.id);
            }
          });
          setStatusMap(map);
          setSavedCandidateIds(savedIds);
          setCandidates(response.data);
          // setTotal(response.total || response.data.length);
        } else {
          setCandidates([]);
          messageAPI.warning("No candidates found for this job.");
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
        messageAPI.error("Failed to load candidates.");
      } finally {
        setTimeout(() => setLoading(false), 400); // ✅ changed
      }
    };

    if (jobId) fetchCandidates();
    // }, [jobId, page, pageSize]); // ✅ KEEP THIS
  }, [jobId]);

  useEffect(() => {
    return () => {
      if (!isNavigatingToCandidate.current) {
        // Tab switch → clear everything
        sessionStorage.removeItem("candidateActiveFilters");
        sessionStorage.removeItem("candidateFilterOpen");
        sessionStorage.removeItem("candidateListPage");
        sessionStorage.removeItem("candidateListPageSize");
      }
      // Reset flag
      isNavigatingToCandidate.current = false;
    };
  }, []);

  const filteredCandidates = candidates
    .filter((c) => {
      const vendorId = c?.profile?.vendorId;
      if (activeFilters?.candidateType?.length) {
        if (activeFilters.candidateType.includes("vendor") && vendorId != null)
          return true;
        if (
          activeFilters.candidateType.includes("individual") &&
          vendorId == null
        )
          return true;
        return false;
      }
      if (candidateType === "ALL") return true;
      if (candidateType === "NORMAL") return vendorId == null;
      if (candidateType === "VENDOR") return vendorId != null;
      return true;
    })
    // .filter((c) => {
    //   if (!activeFilters?.experience) return true;
    //   const exp = parseFloat(c?.profile?.totalExperience || 0);
    //   return exp >= activeFilters.experience;
    // })
    .filter((c) => {
      const exp = parseFloat(c?.profile?.totalExperience || 0);

      const hasRange =
        activeFilters?.expMin != null || activeFilters?.expMax != null;
      const hasSingle = !!activeFilters?.experience;

      // ✅ Range filter takes priority if either min or max is set
      if (hasRange) {
        const min = activeFilters.expMin ?? 0;
        const max = activeFilters.expMax ?? 99;
        return exp >= min && exp <= max;
      }

      // ✅ Fallback to single experience filter (slider/input)
      if (hasSingle) {
        const target = Number(activeFilters.experience);
        return Math.floor(exp) === Math.floor(target);
      }

      return true;
    })
    .filter((c) => {
      const hasRange =
        activeFilters?.fitScoreMin != null ||
        activeFilters?.fitScoreMax != null;

      if (hasRange) {
        const score = c?.matchScore;
        if (score == null) return false;
        const min =
          activeFilters.fitScoreMin != null
            ? Number(activeFilters.fitScoreMin)
            : 0;
        const max =
          activeFilters.fitScoreMax != null
            ? Number(activeFilters.fitScoreMax)
            : 100;
        return score >= min && score <= max;
      }

      if (activeFilters?.fitScore == null || activeFilters?.fitScore === "")
        return true;
      const score = c?.matchScore;
      if (score == null) return false;
      return score === Number(activeFilters.fitScore);
    })
    .filter((c) => {
      if (!activeFilters?.preferredLocation?.length) return true;
      const preferred = c?.profile?.preferredLocation || [];
      return activeFilters.preferredLocation.some((sel) =>
        preferred.some(
          (l) =>
            l.toLowerCase().includes(sel.toLowerCase()) ||
            sel.toLowerCase().includes(l.toLowerCase()),
        ),
      );
    })

    .filter((c) => {
      if (!activeFilters?.skills?.length) return true;
      const candidateSkills =
        c?.profile?.skillsJson?.map((s) => s.name.toLowerCase()) || [];
      return activeFilters.skills.every((s) => {
        // Strip count suffix like " (24)" from the selected value
        const cleanSkill = s.replace(/\s*\(\d+\)\s*$/, "").toLowerCase();
        return candidateSkills.some((cs) => cs.includes(cleanSkill));
      });
    })

    .filter((c) => {
      if (!activeFilters?.clouds?.length) return true;
      const candidateClouds = [
        ...(c?.profile?.primaryClouds?.map((cl) => cl.name.toLowerCase()) ||
          []),
        ...(c?.profile?.secondaryClouds?.map((cl) => cl.name.toLowerCase()) ||
          []),
      ];
      return activeFilters.clouds.every((cl) => {
        // Strip count suffix like " (8)" from the selected value
        const cleanCloud = cl.replace(/\s*\(\d+\)\s*$/, "").toLowerCase();
        return candidateClouds.some((cc) => cc.includes(cleanCloud));
      });
    })

    .filter((c) => {
      const hasRange =
        activeFilters?.expectedCTCMin != null ||
        activeFilters?.expectedCTCMax != null;

      if (hasRange) {
        const ctcRaw = parseFloat(
          String(c?.profile?.expectedCTC || "").replace(/[^0-9.]/g, ""),
        );
        if (isNaN(ctcRaw)) return false;
        const min = activeFilters.expectedCTCMin
          ? Number(activeFilters.expectedCTCMin)
          : 0;
        const max = activeFilters.expectedCTCMax
          ? Number(activeFilters.expectedCTCMax)
          : 9999;
        return ctcRaw >= min && ctcRaw <= max;
      }

      if (!activeFilters?.expectedCTC?.trim()) return true;
      const ctc = c?.profile?.expectedCTC || "";
      return ctc
        .toLowerCase()
        .includes(activeFilters.expectedCTC.toLowerCase().trim());
    })

    .filter((c) => {
      if (!activeFilters?.joiningPeriod?.length) return true;

      const jp = c?.profile?.joiningPeriod || "";

      return activeFilters.joiningPeriod.some((selected) =>
        jp.toLowerCase().includes(selected.toLowerCase()),
      );
    })
    .filter((c) => {
      const hasRange =
        activeFilters?.rateCardMin != null ||
        activeFilters?.rateCardMax != null;

      if (hasRange) {
        const rate = Number(
          String(c?.profile?.rateCardPerHour?.value || "").replace(/,/g, ""),
        );
        if (isNaN(rate)) return false;
        const min = activeFilters.rateCardMin
          ? Number(activeFilters.rateCardMin)
          : 0;
        const max = activeFilters.rateCardMax
          ? Number(activeFilters.rateCardMax)
          : 9999999;
        return rate >= min && rate <= max;
      }

      if (!activeFilters?.rateCard?.trim()) return true;
      const rate = String(c?.profile?.rateCardPerHour?.value || "").replace(
        /,/g,
        "",
      );
      return rate.includes(activeFilters.rateCard.trim());
    })
    .filter((c) => {
      if (!searchText.trim()) return true;

      const q = searchText.toLowerCase();
      const name = c?.name?.toLowerCase() || "";
      const title = c?.profile?.title?.toLowerCase() || "";
      const email = c?.email?.toLowerCase() || "";
      const phone = c?.profile?.phoneNumber?.toLowerCase() || "";
      const loc = c?.profile?.currentLocation?.toLowerCase() || "";
      const fitScore =
        c?.matchScore !== undefined && c?.matchScore !== null
          ? `${c.matchScore}%`
          : "";
      const keyMatchSkills =
        c?.aiAnalysis?.key_match_skills?.join(" ").toLowerCase() || "";
      const keyGapSkills =
        c?.aiAnalysis?.key_gap_skills?.join(" ").toLowerCase() || "";
      const keyMatchClouds =
        c?.aiAnalysis?.key_match_clouds?.join(" ").toLowerCase() || "";
      const keyGapClouds =
        c?.aiAnalysis?.key_gap_clouds?.join(" ").toLowerCase() || "";

      return (
        name.includes(q) ||
        title.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        loc.includes(q) ||
        fitScore.includes(q) ||
        keyMatchSkills.includes(q) ||
        keyGapSkills.includes(q) ||
        keyMatchClouds.includes(q) ||
        keyGapClouds.includes(q)
      );
    })
    .filter((c) => matchesScreeningFilters(c))
    .sort((a, b) => {
      // ✅ Search sort takes priority
      if (searchText.trim()) {
        const aName = a?.name?.toLowerCase() || "";
        const bName = b?.name?.toLowerCase() || "";
        const q = searchText.toLowerCase();
        const aMatch = aName.includes(q);
        const bMatch = bName.includes(q);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      }
      if (activeFilters?.fitScore != null && activeFilters?.fitScore !== "") {
        const scoreA = a?.matchScore ?? -1;
        const scoreB = b?.matchScore ?? -1;
        // return scoreA - scoreB;
        return scoreB - scoreA; // ✅ high to low
      }

      if (
        activeFilters?.fitScoreMin != null ||
        activeFilters?.fitScoreMax != null
      ) {
        const scoreA = a?.matchScore ?? -1;
        const scoreB = b?.matchScore ?? -1;
        // return scoreA - scoreB;
        return scoreB - scoreA; // ✅ high to low
      }
      if (activeFilters?.expMin != null || activeFilters?.expMax != null) {
        const aExp = parseFloat(a?.profile?.totalExperience || 0);
        const bExp = parseFloat(b?.profile?.totalExperience || 0);
        return aExp - bExp; // ✅ low to high within range
      }

      // ✅ Single experience sort — exact match first, then ascending
      if (
        activeFilters?.experience &&
        !activeFilters?.expMin &&
        !activeFilters?.expMax
      ) {
        const aExp = parseFloat(a?.profile?.totalExperience || 0);
        const bExp = parseFloat(b?.profile?.totalExperience || 0);
        return aExp - bExp; // ✅ 4.0, 4.1, 4.2...4.9 in order
      }

      return 0;
    });

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedCandidates(rows);
    },
  };

  useEffect(() => {
    const hasActiveFilter =
      Object.values(activeFilters).some((v) => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== null && v !== undefined && v !== "";
      }) ||
      Object.keys(screeningFilters).length > 0 ||
      searchText.trim() !== "";

    setShowFilteredCount(hasActiveFilter);
  }, [activeFilters, screeningFilters, searchText, filteredCandidates.length]);

  const chipStyle = {
    padding: "6px 8px",
    borderRadius: 4,
    fontSize: 12,
    lineHeight: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  };

  const DEFAULT_FLAG_COLOR = "#BFBFBF";

  const STATUS_FLAG_MAP = {
    Pending: { label: "Pending", color: "#bfbfbf" },
    Shortlisted: { label: "Shortlisted", color: "#52c41a" },
    Rejected: { label: "Rejected", color: "#f5222d" },
    // BookMark: { label: "BookMark", color: "#faad14" },
    BookMark: { label: "Save Candidate", color: "#faad14" },
  };

  const MANUAL_STATUS_OPTIONS = ["Shortlisted", "Rejected", "BookMark"];

  const PennantFlag = ({ color = DEFAULT_FLAG_COLOR }) => (
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: "7px solid transparent",
        borderBottom: "7px solid transparent",
        borderLeft: `14px solid ${color}`,
      }}
    />
  );

  const FlagDropdown = ({ record, closePopover }) => {
    const currentStatus = statusMap[record.applicationId] || "Pending";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MANUAL_STATUS_OPTIONS.map((status) => {
          const isActive = currentStatus === status;

          return (
            <div
              key={status}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 6,
                backgroundColor: isActive ? "#f5f5f5" : "transparent",
                fontWeight: isActive ? 600 : 400,
              }}
              onClick={async () => {
                let finalStatus = status;
                if (status === "Clear") {
                  finalStatus = "Pending";
                }

                try {
                  if (finalStatus === "BookMark") {
                    // ⭐ Check if candidate already saved
                    if (
                      // record?.profile?.isSaved ||
                      savedCandidateIds.has(record.profile.id)
                    ) {
                      // messageAPI.warning("Candidate already saved");

                      setStatusMap((prev) => ({
                        ...prev,
                        [record.applicationId]: "BookMark",
                      }));
                      closePopover();
                      return;
                    }

                    // ⭐ Save new candidate
                    await MarkCandidateBookmark({
                      jobApplicationId: record.applicationId,
                    });

                    await SaveCandidate({
                      candidateProfileId: record.profile.id,
                    });

                    // ⭐ Add to saved list locally
                    setSavedCandidateIds((prev) => {
                      const updated = new Set(prev);
                      updated.add(record.profile.id);
                      return updated;
                    });

                    setStatusMap((prev) => ({
                      ...prev,
                      [record.applicationId]: "BookMark",
                    }));
                    closePopover();
                    return;
                  } else {
                    await UpdateVendorCandidateStatus({
                      jobApplicationId: record.applicationId,
                      status: finalStatus,
                    });
                  }

                  setStatusMap((prev) => ({
                    ...prev,
                    [record.applicationId]: finalStatus,
                  }));
                  closePopover();
                } catch (err) {
                  closePopover();
                  // catch (err) {
                  //   messageAPI.error("Failed to update status");
                  // }
                  const apiMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update status";
                  console.log("API Error:", apiMessage);

                  if (apiMessage) {
                    messageAPI.warning(apiMessage);
                    // ⭐ update UI immediately
                    setStatusMap((prev) => ({
                      ...prev,
                      [record.applicationId]: "BookMark",
                    }));
                  }
                }
              }}
            >
              <PennantFlag color={STATUS_FLAG_MAP[status].color} />
              <span style={{ fontSize: 13 }}>
                {STATUS_FLAG_MAP[status].label}
              </span>
            </div>
          );
        })}
        <div
          onClick={async () => {
            const previousStatus = statusMap[record.applicationId] || "Pending";

            // ✅ Update UI instantly
            setStatusMap((prev) => ({
              ...prev,
              [record.applicationId]: "Pending",
            }));
            closePopover();

            try {
              await UpdateVendorCandidateStatus({
                jobApplicationId: record.applicationId,
                status: "Pending",
              });

              // ✅ If was BookMark — also remove from savedCandidates
              if (previousStatus === "BookMark") {
                try {
                  await UnsaveCandidate({
                    candidateProfileId: record.profile.id,
                  });
                  // ✅ Remove from local savedCandidateIds set
                  setSavedCandidateIds((prev) => {
                    const updated = new Set(prev);
                    updated.delete(record.profile.id);
                    return updated;
                  });
                } catch {
                  // unsave failed silently — not critical
                }
              }
            } catch {
              // ✅ Rollback on failure
              setStatusMap((prev) => ({
                ...prev,
                [record.applicationId]: previousStatus,
              }));
              messageAPI.error("Failed to clear status");
            }
          }}
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#1677ff",
            cursor: "pointer",
            textAlign: "right",
          }}
        >
          Clear
        </div>
      </div>
    );
  };

  const FLAG_FILTER_STATUSES = ["Shortlisted", "Rejected", "BookMark"];

  const generateFitScore = async (record) => {
    try {
      if (generatingMap[record.applicationId]) return;

      setGeneratingMap((prev) => ({ ...prev, [record.applicationId]: true }));

      messageAPI.loading({
        content: "Generating AI Fit Score...",
        key: `fitScore-${record.applicationId}`,
      });

      const payload = {
        jobApplicationId: record.applicationId,
        jobId: jobId,
        candidateProfileId: record.profile.id,
        force: false,
      };

      const response = await CVEligibility(payload);

      if (response?.status === "success") {
        messageAPI.success({
          content: response.message,
          key: `fitScore-${record.applicationId}`,
        });

        setCandidates((prev) =>
          prev.map((c) =>
            c.applicationId === record.applicationId
              ? {
                  ...c,
                  matchScore: response.data.fitPercentage,
                  aiAnalysis: response.data.analysis,
                }
              : c,
          ),
        );
      }
    } catch (error) {
      messageAPI.error({
        content: "Failed to generate Fit Score",
        key: `fitScore-${record.applicationId}`,
      });
    } finally {
      setGeneratingMap((prev) => ({ ...prev, [record.applicationId]: false }));
    }
  };

  const handleBulkFitScoreClick = async () => {
    if (licenseTier === "BASIC") {
      messageAPI.warning("Upgrade your plan to use Bulk Fit Score");
      return;
    }
    // 👉 STEP 1: SELECT MODE
    if (!isSelectionMode) {
      const noScoreCandidates = candidates.filter((c) => c.matchScore == null);
      const alreadyScored = candidates.filter((c) => c.matchScore != null);

      if (!noScoreCandidates.length) {
        messageAPI.warning("All candidates already have Fit Score.");
        return;
      }

      const keys = noScoreCandidates.map((c) => c.applicationId);

      setSelectedRowKeys(keys);
      setSelectedCandidates(noScoreCandidates);

      setIsSelectionMode(true); // ✅ switch mode

      messageAPI.success({
        content: `${noScoreCandidates.length} candidates selected. ${
          alreadyScored.length ? `${alreadyScored.length} skipped` : ""
        }`,
      });

      return;
    }

    // 👉 STEP 2: GENERATE MODE
    if (!selectedCandidates.length) {
      messageAPI.warning("No candidates selected.");
      return;
    }

    setBulkGenerating(true);

    let successCount = 0;

    for (const record of selectedCandidates) {
      try {
        const payload = {
          jobApplicationId: record.applicationId,
          jobId: jobId,
          candidateProfileId: record.profile.id,
          force: false,
        };

        const response = await CVEligibility(payload);

        if (response?.status === "success") {
          setCandidates((prev) =>
            prev.map((c) =>
              c.applicationId === record.applicationId
                ? {
                    ...c,
                    matchScore: response.data.fitPercentage,
                    aiAnalysis: response.data.analysis,
                  }
                : c,
            ),
          );
          successCount++;
        }
      } catch (err) {}
    }

    setBulkGenerating(false);
    setIsSelectionMode(false); // ✅ reset
    setSelectedRowKeys([]);
    setSelectedCandidates([]);

    messageAPI.success(`${successCount} fit scores generated`);
  };
  const formatName = (name = "") => {
    return name
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const totalCount = filteredCandidates.length;

  const renderSizeChanger = (current, onChange) => (
    <Select
      value={current}
      style={{ width: 120 }}
      onChange={(value) => onChange(Number(value))}
    >
      {[10, 20, 50, 100].map((size) => (
        <Select.Option
          key={size}
          value={size}
          disabled={size > totalCount} // 🔥 MAIN LOGIC
        >
          {size} / page
        </Select.Option>
      ))}
    </Select>
  );
  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
    <Select
      value={pageSize}
      style={{ width: 120 }}
      onChange={(value) => setPageSize(value)}
    >
      {[10, 20, 50, 100].map((size) => (
        <Select.Option
          key={size}
          value={size}
          disabled={size > filteredCandidates.length}
        >
          {size} / page
        </Select.Option>
      ))}
    </Select>
  </div>;

  // TABLE COLUMNS
  const columns = [
    {
      title: "Flags",
      key: "flags",
      width: 60,
      fixed: "left",
      align: "center",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8, minWidth: 160 }}>
          {FLAG_FILTER_STATUSES.map((status) => {
            const isActive = selectedKeys[0] === status;
            return (
              <div
                key={status}
                onClick={() => {
                  setSelectedKeys([status]);
                  confirm();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "6px 8px",
                  borderRadius: 6,
                  backgroundColor: isActive ? "#f5f5f5" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <PennantFlag color={STATUS_FLAG_MAP[status].color} />
                <span>{STATUS_FLAG_MAP[status].label}</span>
              </div>
            );
          })}
          <div
            onClick={() => {
              clearFilters();
              confirm();
            }}
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#1677ff",
              cursor: "pointer",
              textAlign: "right",
            }}
          >
            Clear
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        const currentStatus = statusMap[record.applicationId] || "Pending";
        return currentStatus === value;
      },
      render: (_, record) => {
        const currentStatus = statusMap[record.applicationId] || "Pending";
        const flagMeta = STATUS_FLAG_MAP[currentStatus];
        return (
          // <Popover
          //   trigger="click"
          //   placement="right"
          //   content={<FlagDropdown record={record} />}
          // >
          <Popover
            trigger="click"
            placement="right"
            open={flagPopoverId === record.applicationId}
            onOpenChange={(open) =>
              setFlagPopoverId(open ? record.applicationId : null)
            }
            content={
              <FlagDropdown
                record={record}
                closePopover={() => setFlagPopoverId(null)}
              />
            }
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: "pointer" }}
            >
              <PennantFlag color={flagMeta?.color || DEFAULT_FLAG_COLOR} />
            </div>
          </Popover>
        );
      },
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text, record) => (
        <Popover
          trigger="hover"
          placement="right"
          content={
            <div style={{ fontSize: 12, color: "#6B7280", maxWidth: 220 }}>
              <div
                style={{ fontWeight: 500, color: "#1A1A2E", marginBottom: 6 }}
              >
                More details inside
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span>
                  Experience:{" "}
                  {record?.profile?.totalExperience
                    ? `${record.profile.totalExperience} yrs`
                    : "N/A"}
                </span>

                {/* ✅ Only for Individual */}
                {record?.profile?.vendorId == null && (
                  <span>
                    Expected CTC: {record?.profile?.expectedCTC || "N/A"}
                  </span>
                )}

                <span>
                  Joining Period: {record?.profile?.joiningPeriod || "N/A"}
                </span>

                {/* ✅ Only for Vendor */}
                {record?.profile?.vendorId != null && (
                  <span>
                    Rate Card / Month:{" "}
                    {record?.profile?.rateCardPerHour?.value
                      ? `₹${record.profile.rateCardPerHour.value}`
                      : "N/A"}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              // setSelectedCandidateId(record.profile.id);
              // setSelectedCandidateId(record.id);
              setSelectedCandidateId(record.profile?.id);
              setSelectedCandidate({
                ...record,
                id: record.profile?.id,
                profile: record.profile || {},
              });
              setIsCandidateModalOpen(true);
            }}
            style={{ color: "#1677ff", cursor: "pointer", fontWeight: 500 }}
          >
            {formatName(text)}
          </span>
        </Popover>
      ),
    },

    {
      title: "Fit Score",
      dataIndex: "matchScore",
      key: "matchScore",
      // ✅ ADD THIS
      sorter: (a, b) => {
        const scoreA = a.matchScore ?? -1;
        const scoreB = b.matchScore ?? -1;
        return scoreA - scoreB;
      },
      sortDirections: ["descend", "ascend"], // High → Low first
      render: (score) => {
        if (score == null) return <Tag>N/A</Tag>;

        let bgColor = "#f5f5f5";
        let textColor = "#000";
        let borderColor = "#d9d9d9";

        if (score >= 80) {
          bgColor = "#f6ffed";
          textColor = "#389e0d";
          borderColor = "#b7eb8f";
        } else if (score >= 60) {
          bgColor = "#e6f4ff";
          textColor = "#0958d9";
          borderColor = "#91caff";
        } else if (score >= 40) {
          bgColor = "#fff7e6";
          textColor = "#d46b08";
          borderColor = "#ffd591";
        } else {
          bgColor = "#fff1f0";
          textColor = "#cf1322";
          borderColor = "#ffa39e";
        }

        return (
          <span
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "13px",
              backgroundColor: bgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              display: "inline-block",
              minWidth: 60,
              textAlign: "center",
            }}
          >
            {score}%
          </span>
        );
      },
    },
    {
      title: "Title",
      dataIndex: ["profile", "title"],
      key: "title",
      render: (text) => text || "N/A",
    },

    {
      title: "Matched Skills",
      width: 200,
      key: "keyMatchSkills",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_match_skills || [];
        if (!list.length) return <Tag style={chipStyle}>No Matched Skills</Tag>;

        const visibleSkills = list.slice(0, 2);
        const remainingCount = list.length - 2;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visibleSkills.map((skill) => (
              <Tag key={skill} color="green" style={chipStyle}>
                {skill}
              </Tag>
            ))}
            {remainingCount > 0 && (
              <span
                style={{
                  // color: "#1677ff",
                  // cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                  color: "inherit",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                +{remainingCount} more
              </span>
            )}
          </div>
        );
      },
    },

    {
      title: "Missing Skills",
      key: "keyGapSkills",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_gap_skills || [];
        if (!list.length) return <Tag style={chipStyle}>No Missing Skills</Tag>;

        const visibleSkills = list.slice(0, 2);
        const remainingCount = list.length - 2;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visibleSkills.map((skill) => (
              <Tag key={skill} color="red" style={chipStyle}>
                {skill}
              </Tag>
            ))}
            {remainingCount > 0 && (
              <span
                style={{
                  // color: "#1677ff",
                  // cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                  color: "inherit",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                +more
              </span>
            )}
          </div>
        );
      },
    },

    {
      title: "Matched Clouds",
      key: "keyMatchClouds",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_match_clouds || [];
        if (!list.length) return <Tag style={chipStyle}>No Matched Clouds</Tag>;

        const visibleClouds = list.slice(0, 2);
        const remainingCount = list.length - 2;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visibleClouds.map((cloud) => (
              <Tag key={cloud} color="blue" style={chipStyle}>
                {cloud}
              </Tag>
            ))}
            {remainingCount > 0 && (
              <span
                style={{
                  // color: "#1677ff",
                  // cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                  color: "inherit",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                +{remainingCount} more
              </span>
            )}
          </div>
        );
      },
    },

    {
      title: "Missing Clouds",
      key: "keyGapClouds",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_gap_clouds || [];
        if (!list.length) return <Tag style={chipStyle}>No Missing SKills</Tag>;

        const visibleClouds = list.slice(0, 2);
        const remainingCount = list.length - 2;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visibleClouds.map((cloud) => (
              <Tag key={cloud} color="orange" style={chipStyle}>
                {cloud}
              </Tag>
            ))}
            {remainingCount > 0 && (
              <span
                style={{
                  // color: "#1677ff",
                  // cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                  color: "inherit",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                +{remainingCount} more
              </span>
            )}
          </div>
        );
      },
    },

    {
      title: "Applied On",
      dataIndex: "appliedAt",
      key: "appliedAt",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },

    {
      title: "Preferred Location",
      dataIndex: ["profile", "preferredLocation"],
      key: "preferredLocation",
      render: (locations) =>
        Array.isArray(locations) && locations.length > 0
          ? locations.join(", ")
          : "N/A",
    },

    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const openActivityOnly = async (type) => {
          setActionPopoverId(null);
          setActivityCandidate(record);
          setActivityTab(type);
          setActivityModalOpen(true);
        };

        // 🆕 OPEN SCREENING ANSWERS MODAL
        const openAnswers = () => {
          setActionPopoverId(null);
          setAnswersCandidate(record);
          setAnswersModalOpen(true);
        };

        return (
          <Popover
            trigger="click"
            placement="left"
            open={actionPopoverId === record.applicationId}
            onOpenChange={(open) =>
              setActionPopoverId(open ? record.applicationId : null)
            }
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* 👤 View Candidate Details */}
                <div
                  style={{
                    cursor: "pointer",
                    padding: "6px 10px",
                    fontWeight: 500,
                  }}
                  onClick={async () => {
                    setActionPopoverId(null);
                    try {
                      await MarkCandidateReviewed({
                        jobApplicationId: record.applicationId,
                      });
                    } catch {}
                    setCandidates((prev) =>
                      prev.map((c) =>
                        c.applicationId === record.applicationId
                          ? { ...c, status: "Reviewed" }
                          : c,
                      ),
                    );
                    sessionStorage.setItem("candidateListPage", page);
                    sessionStorage.setItem("candidateListPageSize", pageSize);
                    sessionStorage.setItem(
                      "candidateFilterOpen",
                      String(isFilterOpen),
                    );
                    isNavigatingToCandidate.current = true;
                    navigate(`/company/candidate/${record.profile.id}`, {
                      state: {
                        candidate: { ...record, status: "Reviewed" },
                        jobId,
                        highlight: highlight || "findbench",
                        matchScore: record?.matchScore ?? null,
                      },
                    });
                  }}
                >
                  👤 View Candidate Details
                </div>
                {/* Generate Fit Score */}
                <div
                  style={{
                    cursor: generatingMap[record.applicationId]
                      ? "not-allowed"
                      : "pointer",
                    padding: "6px 10px",
                    opacity: generatingMap[record.applicationId] ? 0.6 : 1,
                    fontWeight: 500,
                  }}
                  onClick={() =>
                    !generatingMap[record.applicationId] &&
                    generateFitScore(record)
                  }
                >
                  {generatingMap[record.applicationId]
                    ? "⏳ Generating..."
                    : "🤖 Generate Fit Score"}
                </div>

                <div
                  style={{ cursor: "pointer", padding: "6px 10px" }}
                  onClick={() => openActivityOnly("NOTE")}
                >
                  📝 Notes
                </div>

                <div
                  style={{ cursor: "pointer", padding: "6px 10px" }}
                  onClick={() => openActivityOnly("TODO")}
                >
                  ✅ Todo
                </div>

                {/* 🆕 SCREENING ANSWERS — only show if answers exist */}
                {record?.screeningAnswers?.length > 0 && (
                  <div
                    style={{ cursor: "pointer", padding: "6px 10px" }}
                    // onClick={openAnswers}
                    onClick={(e) => {
                      e.stopPropagation(); // prevents popover from closing
                      openAnswers();
                    }}
                  >
                    📋 Screening Answers
                  </div>
                )}
              </div>
            }
          >
            <EyeOutlined
              style={{ fontSize: 18, cursor: "pointer" }}
              onClick={(e) => e.stopPropagation()}
            />
          </Popover>
        );
      },
    },
  ];
  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
    <Select
      value={pageSize}
      style={{ width: 120 }}
      onChange={(value) => {
        setPageSize(value);
        sessionStorage.setItem("candidateListPageSize", value);
      }}
    >
      {[10, 20, 50, 100].map((size) => (
        <Select.Option
          key={size}
          value={size}
          disabled={size > filteredCandidates.length}
        >
          {size} / page
        </Select.Option>
      ))}
    </Select>
  </div>;

  return (
    // <div style={{ padding: 0 }}>
    <div
      style={{
        padding: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {contextHolder}

      <div
        style={{
          width: "100%",
          padding: 8,
          background: "#FFFFFF",
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 12,
        }}
      >
        {/* LEFT — TOGGLES */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            // onClick={() => setIsFilterOpen((prev) => !prev)}
            onClick={() => {
              setIsFilterOpen((prev) => {
                const next = !prev;
                // sessionStorage.setItem("candidateFilterOpen", next);
                sessionStorage.setItem("candidateFilterOpen", String(next)); // ✅
                return next;
              });
            }}
            style={{
              height: 32,
              width: 32,
              borderRadius: 6,
              cursor: "pointer",
              outline: isFilterOpen ? "1px solid #3F41D1" : "1px solid #A3A3A3",
              background: isFilterOpen ? "#EBEBFA" : "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isFilterOpen ? (
              <MenuFoldOutlined style={{ fontSize: 15, color: "#3F41D1" }} />
            ) : (
              <MenuUnfoldOutlined style={{ fontSize: 15, color: "#666666" }} />
            )}
          </div>
          {["ALL", "NORMAL", "VENDOR"].map((type) => {
            // const labels = {

            //   ALL: `All (${candidates.length})`,

            //   NORMAL: `Individual Candidates (${
            //     candidateType === "NORMAL"
            //       ? filteredCandidates.length // already filtered to NORMAL
            //       : filteredCandidates.filter(
            //           (c) => c?.profile?.vendorId == null,
            //         ).length
            //   })`,
            //   VENDOR: `Vendor Candidates (${
            //     candidateType === "VENDOR"
            //       ? filteredCandidates.length // already filtered to VENDOR
            //       : filteredCandidates.filter(
            //           (c) => c?.profile?.vendorId != null,
            //         ).length
            //   })`,
            // };
            const labels = {
              ALL: `All (${candidates.length})`,
              NORMAL: `Individual Candidates (${
                candidates.filter((c) => c?.profile?.vendorId == null).length
              })`,
              VENDOR: `Vendor Candidates (${
                candidates.filter((c) => c?.profile?.vendorId != null).length
              })`,
            };
            return (
              <div
                key={type}
                onClick={() => setCandidateType(type)}
                style={{
                  height: 32,
                  borderRadius: 6,
                  outline:
                    candidateType === type
                      ? "1px solid #3F41D1"
                      : "1px solid #A3A3A3",
                  background: candidateType === type ? "#EBEBFA" : "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ padding: "4px 12px" }}>
                  <span
                    style={{
                      color: candidateType === type ? "#3F41D1" : "#666666",
                      fontSize: 13,
                      fontWeight: candidateType === type ? 500 : 400,
                    }}
                  >
                    {labels[type]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {showFilteredCount && (
            <div
              style={{
                background: "#1677FF",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: 20,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {filteredCandidates.length} found
            </div>
          )}
        </div>

        {/* RIGHT — SEARCH + CREATE GROUP */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Input
            placeholder="Search by name or title"
            allowClear
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              const filteredValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
              setSearchText(filteredValue);
            }}
            style={{ width: 200, height: 36, borderRadius: 20, fontSize: 13 }}
          />

          <div
            onClick={() => {
              if (licenseTier === "BASIC") {
                messageAPI.warning(
                  "🚫 This feature is available only in paid plans",
                );
                return;
              }

              if (!bulkGenerating) {
                handleBulkFitScoreClick();
              }
            }}
            style={{
              height: 36,
              borderRadius: 20,
              padding: "6px 18px",
              background:
                licenseTier === "BASIC" || bulkGenerating
                  ? "#EBEBEB"
                  : "#722ED1",
              display: "flex",
              alignItems: "center",
              cursor:
                licenseTier === "BASIC" || bulkGenerating
                  ? "not-allowed"
                  : "pointer",
              gap: 6,
            }}
          >
            <span
              style={{
                color: bulkGenerating ? "#A3A3A3" : "#FFFFFF",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {licenseTier === "BASIC"
                ? "🔒 Upgrade Plan"
                : bulkGenerating
                  ? "⏳ Generating..."
                  : isSelectionMode
                    ? "⚡ Generate Fit Score"
                    : "🤖 Bulk Fit Score"}
            </span>
          </div>

          <div
            onClick={() =>
              selectedCandidates.length === 0 ? null : setIsGroupModalOpen(true)
            }
            style={{
              height: 36,
              borderRadius: 20,
              padding: "6px 18px",
              background:
                selectedCandidates.length === 0 ? "#EBEBEB" : "#1677FF",
              display: "flex",
              alignItems: "center",
              cursor:
                selectedCandidates.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <span
              style={{
                color: selectedCandidates.length === 0 ? "#A3A3A3" : "#FFFFFF",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              + Create Group Chat
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            height: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <Progress
            type="circle"
            percent={progress}
            width={120}
            strokeColor={{ "0%": "#1677FF", "100%": "#52c41a" }}
            showInfo={false}
          />
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            Loading Candidates...
          </div>
        </div>
      ) : (
        <>
          {/* <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}> */}
          <div
            style={{
              display: "flex",
              gap: 0,
              alignItems: "flex-start",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {isFilterOpen && (
              <div
                style={{
                  height: "calc(100vh - 120px)",
                  // height: "calc(100vh - 280px)",
                  overflowY: "auto",
                  flexShrink: 0,
                }}
              >
                <FiltersPanel
                  // onFiltersChange={(filters) => setActiveFilters(filters)}
                  onFiltersChange={(filters) => {
                    setActiveFilters(filters);
                    sessionStorage.setItem(
                      "candidateActiveFilters",
                      JSON.stringify(filters),
                    );
                  }}
                  showCandidateType={false}
                  isFilterOpen={isFilterOpen}
                  // handleClearFilters={() => setActiveFilters({})}
                  handleClearFilters={() => {
                    setActiveFilters({});
                    sessionStorage.removeItem("candidateActiveFilters");
                  }}
                  toggleFilter={() => setIsFilterOpen(false)}
                  // savedFilters={{}}
                  savedFilters={activeFilters}
                  skipFirstEmit={true}
                  hideJobTypeFilters={true}
                  hideLocation={true}
                  // showCurrentLocation={true}
                  showPreferredLocation={true}
                  preferredLocationOptions={(() => {
                    const allLocs = candidates.flatMap(
                      (c) => c?.profile?.preferredLocation || [],
                    );
                    const countMap = allLocs.reduce((acc, loc) => {
                      acc[loc] = (acc[loc] || 0) + 1;
                      return acc;
                    }, {});
                    return Object.entries(countMap).map(([loc, count]) => ({
                      label: `${loc} (${count})`,
                      value: loc,
                      count,
                    }));
                  })()}
                  skillOptions={(() => {
                    const allSkills = candidates.flatMap(
                      (c) => c?.profile?.skillsJson?.map((s) => s.name) || [],
                    );
                    const countMap = allSkills.reduce((acc, skill) => {
                      acc[skill] = (acc[skill] || 0) + 1;
                      return acc;
                    }, {});
                    return Object.entries(countMap).map(([skill, count]) => ({
                      label: `${skill} (${count})`,
                      value: skill,
                      count,
                    }));
                  })()}
                  cloudOptions={(() => {
                    const allClouds = candidates.flatMap((c) => [
                      ...(c?.profile?.primaryClouds?.map((cl) => cl.name) ||
                        []),
                      ...(c?.profile?.secondaryClouds?.map((cl) => cl.name) ||
                        []),
                    ]);
                    const countMap = allClouds.reduce((acc, cloud) => {
                      acc[cloud] = (acc[cloud] || 0) + 1;
                      return acc;
                    }, {});
                    return Object.entries(countMap).map(([cloud, count]) => ({
                      label: `${cloud} (${count})`,
                      value: cloud,
                      count,
                    }));
                  })()}
                  // showExpectedCTC={true}
                  showExpectedCTC={candidateType !== "VENDOR"}
                  showJoiningPeriod={true}
                  showFitScore={true}
                  // showRateCard={true}
                  showRateCard={candidateType !== "NORMAL"}
                  useFilterSectionForSkillsAndClouds={true}
                  screeningQuestions={(() => {
                    const map = {};
                    candidates.forEach((c) => {
                      (c.screeningAnswers || []).forEach((a) => {
                        if (!map[a.questionId]) {
                          map[a.questionId] = {
                            questionId: a.questionId,
                            question: a.question,
                            type: a.type,
                            options: [],
                            allAnswers: [],
                          };
                        }
                        // collect unique answers for ALL filterable types as options
                        if (
                          a.answer &&
                          !map[a.questionId].allAnswers.includes(a.answer)
                        ) {
                          map[a.questionId].allAnswers.push(a.answer);
                        }
                        // ✅ collect options for SELECT, MULTIPLE_CHOICE, MCQ
                        if (
                          (a.type === "MULTIPLE_CHOICE" ||
                            a.type === "MCQ" ||
                            a.type === "SELECT") &&
                          a.answer &&
                          !map[a.questionId].options.includes(a.answer)
                        ) {
                          map[a.questionId].options.push(a.answer);
                        }
                      });
                    });
                    return Object.values(map).filter((q) =>
                      [
                        "NUMBER",
                        "BOOLEAN",
                        "MULTIPLE_CHOICE",
                        "MCQ",
                        "SELECT",
                        "YES_NO",
                      ].includes(q.type),
                    );
                  })()}
                  screeningFilters={screeningFilters}
                  onScreeningFiltersChange={handleScreeningFiltersChange}
                />
              </div>
            )}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredCandidates}
                rowKey={(record) => record.applicationId}
                bordered
                // scroll={{ x: "max-content" }}
                scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
                // pagination={{
                //   current: page,
                //   pageSize,

                //   total,
                //   showSizeChanger: true,

                //   onChange: (p, ps) => {
                //     setPage(p);
                //     setPageSize(ps);
                //     sessionStorage.setItem("candidateListPage", p);
                //     sessionStorage.setItem("candidateListPageSize", ps);
                //   },
                // }}
                pagination={{
                  current: page,
                  pageSize,
                  total: filteredCandidates.length,

                  showSizeChanger: false,

                  // ❌ remove default options
                  pageSizeOptions: [],

                  onChange: (p, ps) => {
                    setPage(p);
                    setPageSize(ps);
                    sessionStorage.setItem("candidateListPage", p);
                    sessionStorage.setItem("candidateListPageSize", ps);
                  },

                  // 🔥 THIS IS THE FIX
                  showSizeChanger: true,
                  sizeChangerRender: renderSizeChanger, // ✅ ADD THIS
                }}
              />
            </div>
          </div>
          {/* GROUP CHAT MODAL (unchanged) */}
          <Modal
            title="Create Group Chat"
            open={isGroupModalOpen}
            onCancel={() => {
              setIsGroupModalOpen(false);
              setGroupName("");
            }}
            okText="Create"
            onOk={() => {
              if (!groupName.trim()) {
                message.warning("Please enter a group name");
                return;
              }
              const chatUserIds = selectedCandidates
                .map((c) => c?.profile?.chatuserid)
                .filter(Boolean);

              if (!chatUserIds.length) {
                message.warning("No valid chat users selected");
                return;
              }

              navigate("/company/chat", {
                state: {
                  groupUserIds: [...new Set(chatUserIds)],
                  groupName: groupName.trim(),
                },
              });

              setIsGroupModalOpen(false);
              setGroupName("");
            }}
          >
            <Input
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={50}
            />
          </Modal>
          {/* ACTIVITY MODAL (unchanged) */}
          <Modal
            open={activityModalOpen}
            footer={null}
            width={420}
            destroyOnClose
            closable
            maskClosable={false}
            styles={{
              content: {
                paddingRight: 50, // 🔥 THIS moves space from scrollbar
              },
            }}
            onCancel={() => setActivityModalOpen(false)}
          >
            {activityCandidate && (
              <CandidateActivity
                candidateId={activityCandidate.profile.id}
                jobId={jobId}
                defaultTab={activityTab}
              />
            )}
          </Modal>
          {/* 🆕 SCREENING ANSWERS MODAL */}
          <Modal
            open={answersModalOpen}
            title={
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  📋 Screening Answers
                </div>
                {answersCandidate?.name && (
                  <div
                    style={{ fontSize: 13, color: "#6B7280", fontWeight: 400 }}
                  >
                    {answersCandidate.name}
                  </div>
                )}
              </div>
            }
            footer={null}
            width={480}
            destroyOnClose
            onCancel={() => {
              setAnswersModalOpen(false);
              setAnswersCandidate(null);
            }}
          >
            {answersCandidate?.screeningAnswers?.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                {answersCandidate.screeningAnswers.map((a, i) => (
                  <div
                    key={a.questionId}
                    style={{
                      background: "#FAFAFA",
                      border: "1px solid #EDEDED",
                      borderRadius: 10,
                      padding: "14px 18px",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        marginBottom: 6,
                      }}
                    >
                      Q{i + 1}. {a.question}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1A1A2E",
                      }}
                    >
                      {a.answer || "—"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "20px 0",
                  textAlign: "center",
                  color: "#9CA3AF",
                }}
              >
                No screening answers for this application.
              </div>
            )}
          </Modal>

          <Modal
            open={isCandidateModalOpen}
            onCancel={() => setIsCandidateModalOpen(false)}
            footer={null}
            width="80vw"
            maskClosable={false}
            style={{ top: 20 }}
            closeIcon={
              <span
                style={{
                  fontSize: 18,
                  color: "#555",
                  cursor: "pointer",
                }}
              >
                ✕
              </span>
            }
            styles={{
              content: {
                paddingRight: 50,
                maxHeight: "calc(100vh - 40px)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              },
              header: {
                flexShrink: 0,
              },
              body: {
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: 0,
              },
            }}
            destroyOnClose
          >
            {selectedCandidate && (
              <CandidateDetails
                idFromModal={selectedCandidateId}
                candidateFromList={selectedCandidate}
                jobIdFromList={jobId}
                isModal={true}
                matchScore={selectedCandidate?.matchScore}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default CandidateList;
