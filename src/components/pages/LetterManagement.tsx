import React, { useEffect, useState, useRef } from "react";
import {
  Eye,
  Check,
  Send,
  Download,
  FileCheck,
  Upload,
  Search,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import TemplateMemoLetter from "./TemplateMemoLetter";
import DepartmentSelector from "./DepartmentSelector";

const getLetterSentDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

type Letter = {
  _id: string;
  subject: string;
  fromName?: string;
  fromEmail?: string;
  to?: string;
  toEmail?: string;
  department?: string;
  priority?: string;
  status?: string;
  fileUrl?: string;
  attachmentUrl?: string;
  attachments?: { filename: string }[];
  createdAt: string;
  content?: string;
  rejectionReason?: string;
};

const LetterManagement: React.FC<{
  setSuccessMsg: (msg: string) => void;
  isAdmin?: boolean;
}> = ({ setSuccessMsg, isAdmin }) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [pendingLetters, setPendingLetters] = useState<Letter[]>([]);
  const [rejectedLetters, setRejectedLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedLetters, setAcceptedLetters] = useState<string[]>([]);
  const [letterSearch, setLetterSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [openLetter, setOpenLetter] = useState<Letter | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showAdminApprovalDialog, setShowAdminApprovalDialog] = useState<
    string | null
  >(null);
  const [showRejectModal, setShowRejectModal] = useState<Letter | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all"); // "all", "pending", "rejected"
  const [rejectNotification, setRejectNotification] = useState<{
    show: boolean;
    message: string;
    letterSubject: string;
  }>({ show: false, message: "", letterSubject: "" });
  const [loadingLetters, setLoadingLetters] = useState(true);
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: string | null;
  }>({}); // { [letterId]: 'approve'|'reject'|'delete'|null }

  useEffect(() => {
    setLoadingLetters(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = user.email;
    const adminAll = isAdmin ? "&all=true" : "";
    axios
      .get(
        `http://localhost:5000/api/letters?userEmail=${encodeURIComponent(
          userEmail
        )}${adminAll}`
      )
      .then((res: { data: Letter[] }) => {
        setLetters(res.data);
        setLoadingLetters(false);
      })
      .catch((error: Error) => {
        setLetters([]);
        setLoadingLetters(false);
      });
    // Fetch pending letters for admin approval
    axios
      .get(
        `http://localhost:5000/api/letters/pending?userEmail=${encodeURIComponent(
          userEmail
        )}${adminAll}`
      )
      .then((res: { data: Letter[] }) => {
        setPendingLetters(res.data);
      })
      .catch(() => setPendingLetters([]));
    // Fetch rejected letters for admin review
    axios
      .get(
        `http://localhost:5000/api/letters?userEmail=${encodeURIComponent(
          userEmail
        )}${adminAll}`
      )
      .then((res: { data: Letter[] }) => {
        const rejected = res.data.filter(
          (letter: Letter) => letter.status === "rejected"
        );
        setRejectedLetters(rejected);
      })
      .catch(() => setRejectedLetters([]));
  }, [isAdmin]);

  const handleApproveLetter = (id: string) => {
    setLetters((prev) =>
      prev.map((l) => (l._id === id ? { ...l, status: "approved" } : l))
    );
    setSuccessMsg(`Letter ${id} approved!`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleSendLetter = (id: string) => {
    setLetters((prev) =>
      prev.map((l) => (l._id === id ? { ...l, status: "sent" } : l))
    );
    setSuccessMsg(`Letter ${id} sent!`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleDetailLetter = (letter: Letter) => {
    setOpenLetter(letter);
    setViewMode(false);
  };

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  const handleAcceptFile = (id: string) => {
    setAcceptedLetters((prev) => [...prev, id]);
    setSuccessMsg(`Letter ${id} accepted by user!`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleSubmitFileClick = (letterId: string) => {
    if (fileInputRefs.current[letterId]) {
      fileInputRefs.current[letterId]!.value = "";
      fileInputRefs.current[letterId]!.click();
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    letterId: string
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLetters((prevLetters) =>
        prevLetters.map((l) =>
          l._id === letterId
            ? { ...l, attachmentUrl: URL.createObjectURL(file) }
            : l
        )
      );
      setSuccessMsg(
        `File "${file.name}" submitted to letter ${letterId}! (demo)`
      );
      setTimeout(() => setSuccessMsg(""), 2000);
    }
  };

  const handleDeleteLetter = (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: "delete" }));
    setShowAdminApprovalDialog(id);
  };

  const handleAdminApproval = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: "delete" }));
    try {
      await axios.delete(`http://localhost:5000/api/letters/${id}`);
      setLetters((prev) => prev.filter((letter) => letter._id !== id));
      setSuccessMsg(`Letter ${id} deleted successfully!`);
      setTimeout(() => setSuccessMsg(""), 2000);
      setShowAdminApprovalDialog(null);
    } catch (error) {
      setSuccessMsg(`Failed to delete letter ${id}. Please try again.`);
      setTimeout(() => setSuccessMsg(""), 2000);
      setShowAdminApprovalDialog(null);
    }
    setActionLoading((prev) => ({ ...prev, [id]: null }));
  };

  // Approve a pending letter (admin)
  const handleApprovePendingLetter = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: "approve" }));
    try {
      await axios.post("http://localhost:5000/api/letters/approve", {
        letterId: id,
      });
      setPendingLetters((prev) => prev.filter((l) => l._id !== id));
      setSuccessMsg(`Letter ${id} approved and sent!`);
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (error) {
      setSuccessMsg(`Failed to approve letter ${id}. Please try again.`);
      setTimeout(() => setSuccessMsg(""), 2000);
    }
    setActionLoading((prev) => ({ ...prev, [id]: null }));
  };

  // Reject a pending letter (admin)
  const handleRejectPendingLetter = async (id: string, reason: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: "reject" }));
    try {
      await axios.post("http://localhost:5000/api/letters/reject", {
        letterId: id,
        rejectionReason: reason,
      });
      setPendingLetters((prev) => prev.filter((l) => l._id !== id));
      setSuccessMsg(`Letter ${id} rejected and notification sent to sender!`);
      setTimeout(() => setSuccessMsg(""), 2000);
      setShowRejectModal(null);
      setRejectComment("");
    } catch (error) {
      setSuccessMsg(`Failed to reject letter ${id}. Please try again.`);
      setTimeout(() => setSuccessMsg(""), 2000);
      setShowRejectModal(null);
    }
    setActionLoading((prev) => ({ ...prev, [id]: null }));
  };

  // Chronological sort (newest first)
  const sortedLetters = [...letters].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredLetters = sortedLetters.filter((letter) => {
    const matchesSearch = (letter.subject || "")
      .toLowerCase()
      .includes(letterSearch.toLowerCase());
    const matchesDepartment =
      !selectedDepartment || letter.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  if (loadingLetters)
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        <span className="ml-2 text-blue-500 font-semibold">
          Loading letters...
        </span>
      </div>
    );

  return (
    <div className="w-full flex flex-col h-full bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Letter Management
        </h2>
        <p className="text-gray-600">
          Manage and approve pending letters, review rejected letters, and
          oversee all correspondence
        </p>
      </div>

      {/* Enhanced Notification Bar for Reject & Forward */}
      {rejectNotification.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-auto">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <div className="font-semibold">{rejectNotification.message}</div>
              <div className="text-sm opacity-80">
                Subject:{" "}
                <span className="font-medium">
                  {rejectNotification.letterSubject}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeFilter === "pending"
                ? "bg-yellow-100 border-yellow-400 shadow-lg"
                : "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
            }`}
            onClick={() => setActiveFilter("pending")}
          >
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-full p-2 mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {pendingLetters.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeFilter === "rejected"
                ? "bg-red-100 border-red-400 shadow-lg"
                : "bg-red-50 border-red-200 hover:bg-red-100"
            }`}
            onClick={() => setActiveFilter("rejected")}
          >
            <div className="flex items-center">
              <div className="bg-red-500 rounded-full p-2 mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Rejected Letters
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {
                    letters.filter((letter) => letter.status === "rejected")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeFilter === "all"
                ? "bg-blue-100 border-blue-400 shadow-lg"
                : "bg-blue-50 border-blue-200 hover:bg-blue-100"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-full p-2 mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Total Letters
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {letters.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Indicator */}
      {activeFilter !== "all" && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Showing:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  activeFilter === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {activeFilter === "pending"
                  ? "Pending Letters"
                  : "Rejected Letters"}
              </span>
            </div>
            <button
              onClick={() => setActiveFilter("all")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Show All Letters
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Pending Letters Section */}
        {pendingLetters.length > 0 &&
          (activeFilter === "all" || activeFilter === "pending") && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-yellow-500 rounded-full p-2 mr-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-800">
                      Pending High/Urgent Letters
                    </h3>
                    <p className="text-yellow-600 text-sm">
                      Require admin approval before sending
                    </p>
                  </div>
                </div>
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {pendingLetters.length} pending
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingLetters.map((letter) => (
                  <div
                    key={letter._id}
                    className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 text-lg leading-tight">
                        {letter.subject}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          letter.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {letter.priority}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>
                          <strong>From:</strong>{" "}
                          {letter.fromName || letter.fromEmail}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          <strong>To:</strong> {letter.to || letter.toEmail}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          <strong>Date:</strong>{" "}
                          {getLetterSentDate(letter.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          onClick={() => handleDetailLetter(letter)}
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        <button
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                          onClick={() => handleApprovePendingLetter(letter._id)}
                          disabled={actionLoading[letter._id] === "approve"}
                        >
                          {actionLoading[letter._id] === "approve" ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}{" "}
                          Approve
                        </button>
                      </div>
                      <button
                        className="w-full bg-red-600 text-white px-3 py-2 rounded-lg shadow hover:bg-red-700 transition-colors flex items-center justify-center gap-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                        onClick={() => {
                          setShowRejectModal(letter);
                          setRejectComment("");
                        }}
                        disabled={actionLoading[letter._id] === "reject"}
                      >
                        {actionLoading[letter._id] === "reject" ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}{" "}
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Rejected Letters Section */}
        {letters.filter((letter) => letter.status === "rejected").length > 0 &&
          (activeFilter === "all" || activeFilter === "rejected") && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-red-500 rounded-full p-2 mr-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800">
                      Rejected Letters
                    </h3>
                    <p className="text-red-600 text-sm">
                      Letters that were rejected and sent back to sender
                    </p>
                  </div>
                </div>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {
                    letters.filter((letter) => letter.status === "rejected")
                      .length
                  }{" "}
                  rejected
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {letters
                  .filter((letter) => letter.status === "rejected")
                  .map((letter) => (
                    <div
                      key={letter._id}
                      className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-red-500 hover:shadow-xl transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 text-lg leading-tight">
                          {letter.subject}
                        </h4>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                          rejected
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>
                            <strong>From:</strong>{" "}
                            {letter.fromName || letter.fromEmail}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            <strong>To:</strong> {letter.to || letter.toEmail}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            <strong>Date:</strong>{" "}
                            {getLetterSentDate(letter.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          onClick={() => handleDetailLetter(letter)}
                        >
                          <Eye className="w-4 h-4" /> View Content
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* All Letters Section */}
        {activeFilter === "all" && (
          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full p-2 mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    All Letters
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Complete overview of all correspondence
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="w-full lg:w-64">
                  <DepartmentSelector onChange={setSelectedDepartment} />
                </div>
                <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm flex-1">
                  <Search className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={letterSearch}
                    onChange={(e) => setLetterSearch(e.target.value)}
                    placeholder="Search by subject..."
                    className="ml-3 bg-transparent border-none outline-none w-full text-base"
                  />
                </div>
                <span className="text-gray-600 text-base font-medium whitespace-nowrap bg-white px-4 py-3 rounded-lg border border-gray-300">
                  {filteredLetters.length} letter
                  {filteredLetters.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Letters Grid */}
            {filteredLetters.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg">No letters found.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLetters.map((letter) => (
                  <div
                    key={letter._id}
                    className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-800 text-lg leading-tight flex-1 pr-2">
                        {letter.subject}
                      </h4>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${
                          letter.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : letter.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : letter.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {letter.status
                          ? letter.status.charAt(0).toUpperCase() +
                            letter.status.slice(1)
                          : "Pending"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>
                          <strong>Sender:</strong>{" "}
                          {letter.fromName || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          <strong>Receiver:</strong> {letter.to || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          <strong>Priority:</strong> {letter.priority}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        className="text-blue-700 underline text-sm flex items-center gap-1 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={() => handleDetailLetter(letter)}
                      >
                        <Eye className="w-4 h-4" /> Details
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded-lg shadow flex items-center gap-1 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                        onClick={() => handleDeleteLetter(letter._id)}
                        disabled={actionLoading[letter._id] === "delete"}
                      >
                        {actionLoading[letter._id] === "delete" ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}{" "}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Letter Details Modal (like Inbox) */}
      {openLetter && (
        <Modal
          open={!!openLetter}
          onClose={() => {
            setOpenLetter(null);
            setViewMode(false);
          }}
          center
          classNames={{
            modal: "max-w-4xl w-full mx-4",
            overlay: "bg-black bg-opacity-50",
          }}
        >
          {!viewMode ? (
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Letter Details
              </h3>
              <div className="space-y-3 text-gray-700">
                <div>
                  <strong>Subject:</strong> {openLetter.subject}
                </div>
                <div>
                  <strong>To:</strong> {openLetter.to || openLetter.toEmail}
                </div>
                <div>
                  <strong>From:</strong>{" "}
                  {openLetter.fromName || openLetter.fromEmail}
                </div>
                <div>
                  <strong>Department:</strong> {openLetter.department}
                </div>
                <div>
                  <strong>Priority:</strong>{" "}
                  <span
                    className={`font-bold ${
                      openLetter.priority === "urgent"
                        ? "text-red-600"
                        : openLetter.priority === "high"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    {openLetter.priority}
                  </span>
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {getLetterSentDate(openLetter.createdAt)}
                </div>
                {openLetter.attachments &&
                  openLetter.attachments.length > 0 && (
                    <div>
                      <strong>Attachments:</strong>
                      <ul className="mt-2 space-y-1">
                        {openLetter.attachments.map((file, idx) => (
                          <li
                            key={idx}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <a
                              href={`http://localhost:5000/api/letters/download/${
                                openLetter._id
                              }/${encodeURIComponent(file.filename)}`}
                              className="text-blue-600 hover:text-blue-800 underline"
                              download={file.filename}
                            >
                              Download
                            </a>
                            <a
                              href={`http://localhost:5000/api/letters/view/${
                                openLetter._id
                              }/${encodeURIComponent(file.filename)}`}
                              className="text-green-600 hover:text-green-800 underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                            <span className="text-gray-700">
                              {file.filename}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setViewMode(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Eye className="w-4 h-4" /> View Full Content
                </button>
                <button
                  onClick={() => {
                    setOpenLetter(null);
                    setViewMode(false);
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Letter Content
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setViewMode(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Back to Details
                  </button>
                  <button
                    onClick={() => {
                      setOpenLetter(null);
                      setViewMode(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <TemplateMemoLetter
                  subject={openLetter.subject}
                  date={getLetterSentDate(openLetter.createdAt)}
                  recipient={openLetter.to || openLetter.toEmail}
                  reference={""}
                  body={openLetter.content}
                  signature={openLetter.fromName}
                />
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Modal
          open={!!showDeleteDialog}
          onClose={() => setShowDeleteDialog(null)}
          center
        >
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this letter?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setShowDeleteDialog(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => handleDeleteLetter(showDeleteDialog)}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Approval Dialog */}
      {showAdminApprovalDialog && (
        <Modal
          open={!!showAdminApprovalDialog}
          onClose={() => setShowAdminApprovalDialog(null)}
          center
        >
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              Admin approval required to delete this letter. Are you sure?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setShowAdminApprovalDialog(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                onClick={() => handleAdminApproval(showAdminApprovalDialog)}
                disabled={actionLoading[showAdminApprovalDialog] === "delete"}
              >
                {actionLoading[showAdminApprovalDialog] === "delete" ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : null}{" "}
                Approve
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Letter Modal */}
      {showRejectModal && (
        <Modal
          open={!!showRejectModal}
          onClose={() => {
            setShowRejectModal(null);
            setRejectComment("");
          }}
          center
          classNames={{ modal: "max-w-lg w-full mx-4" }}
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Reject & Forward to Sender
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To (Sender)
              </label>
              <input
                type="text"
                value={
                  showRejectModal.fromName || showRejectModal.fromEmail || ""
                }
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={`Rejected letter: ${showRejectModal.subject}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (Reason for Rejection)
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!rejectComment.trim()}
                onClick={async () => {
                  if (!showRejectModal) return;

                  try {
                    const user = JSON.parse(
                      localStorage.getItem("user") || "{}"
                    );
                    const userEmail = user.email;
                    const adminAll = isAdmin ? "&all=true" : "";
                    const formData = new FormData();
                    formData.append(
                      "subject",
                      `Rejected letter: ${showRejectModal.subject}`
                    );
                    formData.append("from", "admin@system.local"); // Admin email
                    formData.append(
                      "to",
                      showRejectModal.fromName ||
                        showRejectModal.fromEmail ||
                        ""
                    );
                    formData.append(
                      "department",
                      showRejectModal.department || ""
                    );
                    formData.append(
                      "priority",
                      showRejectModal.priority || "normal"
                    );
                    formData.append(
                      "content",
                      rejectComment
                        ? `${rejectComment}\n\n--- Rejected Letter ---\n\n${
                            showRejectModal.content || ""
                          }`
                        : `--- Rejected Letter ---\n\n${
                            showRejectModal.content || ""
                          }`
                    );
                    formData.append("ccEmployees", JSON.stringify({}));
                    formData.append("cc", JSON.stringify([]));

                    await axios.post(
                      "http://localhost:5000/api/letters",
                      formData,
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    // Update the original letter status to rejected
                    await axios.post(
                      "http://localhost:5000/api/letters/status",
                      {
                        letterId: showRejectModal._id,
                        status: "rejected",
                      }
                    );

                    setShowRejectModal(null);
                    setRejectComment("");
                    setSuccessMsg("Rejected and forwarded back successfully!");
                    setTimeout(() => setSuccessMsg(""), 3000);

                    // Show enhanced notification
                    setRejectNotification({
                      show: true,
                      message:
                        "Letter has been successfully rejected and forwarded back to the sender with your comments.",
                      letterSubject: showRejectModal.subject,
                    });
                    setTimeout(
                      () =>
                        setRejectNotification({
                          show: false,
                          message: "",
                          letterSubject: "",
                        }),
                      5000
                    );

                    // Move letter from pending to rejected category instead of removing
                    setPendingLetters((prev) =>
                      prev.filter((l) => l._id !== showRejectModal._id)
                    );
                    setLetters((prev) =>
                      prev.map((l) =>
                        l._id === showRejectModal._id
                          ? { ...l, status: "rejected" }
                          : l
                      )
                    );

                    // Refetch letters to ensure UI is updated
                    try {
                      const response = await axios.get(
                        `http://localhost:5000/api/letters?userEmail=${encodeURIComponent(
                          userEmail
                        )}${adminAll}`
                      );
                      setLetters(response.data);
                    } catch (error) {
                      console.error("Error refetching letters:", error);
                    }
                  } catch (error) {
                    console.error("Error rejecting letter:", error);
                    setSuccessMsg("Failed to reject letter. Please try again.");
                    setTimeout(() => setSuccessMsg(""), 2000);
                  }
                }}
              >
                Reject & Forward
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LetterManagement;
