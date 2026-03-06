import { useState } from "react";
import { message } from "antd";
import { GetJobQuestions } from "../company/api/api"; // adjust path as needed

/**
 * Shared hook for screening-question flow.
 *
 * Usage:
 *   const screening = useScreeningQuestions(jobId);
 *
 *   // When the user clicks "Apply":
 *   await screening.initiateApply(hasQuestions, onDirectApply);
 *
 *   // Wire up the modal:
 *   <ScreeningQuestionsModal {...screening} onSubmit={handleSubmit} applyLoading={...} />
 */
const useScreeningQuestions = (jobId) => {
  const [screeningQuestions, setScreeningQuestions] = useState([]);
  const [screeningAnswers, setScreeningAnswers] = useState({});
  const [screeningModalOpen, setScreeningModalOpen] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  /**
   * Kicks off the apply flow:
   *  - If the job has no questions → calls onDirectApply([]) immediately.
   *  - Otherwise fetches questions; if none come back → onDirectApply([]).
   *  - Otherwise opens the screening modal.
   *
   * @param {boolean} hasQuestions  - job.hasQuestions flag from the job object
   * @param {Function} onDirectApply - async fn(answers[]) to call when no modal is needed
   */
  const initiateApply = async (hasQuestions, onDirectApply) => {
    if (!hasQuestions) {
      await onDirectApply([]);
      return;
    }

    setQuestionsLoading(true);
    try {
      const resp = await GetJobQuestions(jobId);
      if (resp?.data && resp.data.length > 0) {
        setScreeningQuestions(resp.data);
        setScreeningAnswers({});
        setScreeningModalOpen(true);
      } else {
        await onDirectApply([]);
      }
    } catch {
      messageApi.error("Failed to load application questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  /** Build the answers array and validate required fields before submission. */
  const buildAnswers = () => {
    for (const q of screeningQuestions) {
      if (q.required) {
        const val = screeningAnswers[q.id];
        if (val === undefined || val === null || String(val).trim() === "") {
          messageApi.error(`Please answer: "${q.question}"`);
          return null; // signals validation failure
        }
      }
    }
    return screeningQuestions.map((q) => ({
      questionId: q.id,
      answerText: String(screeningAnswers[q.id] ?? ""),
    }));
  };

  const closeModal = (applyLoading) => {
    if (applyLoading) return;
    setScreeningModalOpen(false);
    setScreeningAnswers({});
  };

  const updateAnswer = (id, value) =>
    setScreeningAnswers((prev) => ({ ...prev, [id]: value }));

  return {
    // state
    screeningQuestions,
    screeningAnswers,
    screeningModalOpen,
    questionsLoading,
    // actions
    initiateApply,
    buildAnswers,
    closeModal,
    updateAnswer,
    // antd message context (spread into your component root)
    messageApi,
    contextHolder,
  };
};

export default useScreeningQuestions;
