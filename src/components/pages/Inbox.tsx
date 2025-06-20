import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SearchIcon,
  FilterIcon,
  FileTextIcon,
  StarIcon,
  Download,
  Eye,
} from "lucide-react";
import axios from "axios";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { useNotifications } from "../../context/NotificationContext";
import TemplateMemoLetter from "./TemplateMemoLetter";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DepartmentSelector from "./DepartmentSelector";
import { useInbox } from "../../context/InboxContext";
import { useLanguage } from "./LanguageContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { FaPaperclip } from "react-icons/fa";
import logo from "../../img icon/logo.png";

interface Letter {
  _id: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  toEmail: string;
  toName?: string;
  department: string;
  priority: string;
  content: string;
  createdAt: string;
  unread: boolean;
  starred: boolean;
  attachments?: Array<{ filename: string }>;
  // CC fields
  isCC?: boolean;
  originalLetter?: string;
}

// Format date function (for modal and lists) - Moved here to be accessible
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const getLetterSentDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

// Fetch departments from your actual API
const fetchDepartments = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/departments");
    return res.data;
  } catch (err) {
    return [];
  }
};

// Fetch users by department from your actual API
const fetchUsersByDepartment = async (departmentName: string) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/users?department=${encodeURIComponent(
        departmentName
      )}`
    );
    return res.data;
  } catch (err) {
    return [];
  }
};

const Inbox = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openLetter, setOpenLetter] = useState<Letter | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [departmentUsers, setDepartmentUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [forwardStatus, setForwardStatus] = useState<string | null>(null);
  const [toEmployee, setToEmployee] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [forwardComment, setForwardComment] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewType, setPreviewType] = useState<string>("");
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isForwardLoading, setIsForwardLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [isViewFileLoading, setIsViewFileLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>(
    new Date().toISOString()
  );
  const [hasNewLetters, setHasNewLetters] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user.email || "";
  const { updateUnreadLetters } = useNotifications();
  const {
    letters,
    loadingLetters,
    isRefreshing,
    totalLetters,
    hasInitialLoad,
    fetchLetters,
    updateLetterStatus,
  } = useInbox();
  const { t } = useLanguage();

  // Calculate total pages
  const totalPages = Math.ceil(totalLetters / itemsPerPage);

  // Initial fetch only once when component mounts
  useEffect(() => {
    if (!hasInitialLoad) {
      fetchLetters();
    }
  }, [hasInitialLoad, fetchLetters]);

  // Add polling effect for new letters
  useEffect(() => {
    const checkForNewLetters = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/letters/check-new`,
          {
            params: {
              lastChecked: lastCheckedTimestamp,
              userEmail: userEmail,
            },
          }
        );

        if (response.data.hasNewLetters) {
          setHasNewLetters(true);
          // Update the last checked timestamp
          setLastCheckedTimestamp(new Date().toISOString());
          // Fetch new letters
          fetchLetters();
        }
      } catch (error) {
        console.error("Error checking for new letters:", error);
      }
    };

    // Check for new letters every 30 seconds
    const intervalId = setInterval(checkForNewLetters, 30000);

    return () => clearInterval(intervalId);
  }, [lastCheckedTimestamp, userEmail, fetchLetters]);

  // Reset new letters indicator when user clicks refresh
  const handleRefresh = useCallback(() => {
    setHasNewLetters(false);
    fetchLetters(true);
  }, [fetchLetters]);

  // Filter letters based on selected filter and search
  const filteredLetters = useMemo(() => {
    return letters.filter((letter) => {
      // Check if the letter is meant for the current user (direct recipient or CC)
      const isRecipient = letter.toEmail === userEmail;
      const isCCRecipient = letter.isCC && letter.toEmail === userEmail;

      // If not the recipient or CC recipient, don't show the letter
      if (!isRecipient && !isCCRecipient) return false;

      const matchesSearch = search
        ? letter.subject.toLowerCase().includes(search.toLowerCase()) ||
          letter.fromName.toLowerCase().includes(search.toLowerCase()) ||
          letter.content.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesFilter = (() => {
        switch (selectedFilter) {
          case "unread":
            return letter.unread;
          case "starred":
            return letter.starred;
          case "urgent":
            return letter.priority === "urgent";
          case "seen":
            return !letter.unread;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    });
  }, [letters, search, selectedFilter, userEmail]);

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLetters = filteredLetters.slice(startIndex, endIndex);

  // Debounced search handler
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (searchTerm: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearch(searchTerm);
        setCurrentPage(1);
      }, 300);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      const timeoutId = (debouncedSearch as any).timeoutId;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [debouncedSearch]);

  const handleLetterOpen = useCallback(
    async (letter: Letter) => {
      try {
        setIsViewLoading(true);
        await axios.post(`http://localhost:5000/api/letters/status`, {
          letterId: letter._id,
          unread: false,
        });

        updateLetterStatus(letter._id, { unread: false });
        setOpenLetter({ ...letter, unread: false });
        setViewMode(false);

        const unreadCount = letters.filter(
          (l) => l.unread && l._id !== letter._id
        ).length;
        updateUnreadLetters(unreadCount);
      } catch (error) {
        console.error("Error updating letter status:", error);
        toast.error(t.inbox.errorUpdatingStatus);
      } finally {
        setIsViewLoading(false);
      }
    },
    [
      letters,
      updateUnreadLetters,
      updateLetterStatus,
      t.inbox.errorUpdatingStatus,
    ]
  );

  const handleStarToggle = useCallback(
    async (letter: Letter, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const newStarredState = !letter.starred;

        await axios.post(`http://localhost:5000/api/letters/status`, {
          letterId: letter._id,
          starred: newStarredState,
        });

        updateLetterStatus(letter._id, { starred: newStarredState });

        if (openLetter && openLetter._id === letter._id) {
          setOpenLetter((prev) =>
            prev ? { ...prev, starred: newStarredState } : null
          );
        }

        if (newStarredState) {
          toast.success(t.inbox.letterStarred(letter.subject));
        } else {
          toast.info(t.inbox.letterUnstarred(letter.subject));
        }
      } catch (error) {
        console.error("Error toggling star:", error);
        toast.error(t.inbox.errorTogglingStar);
      }
    },
    [
      openLetter,
      updateLetterStatus,
      t.inbox.letterStarred,
      t.inbox.letterUnstarred,
      t.inbox.errorTogglingStar,
    ]
  );

  // Memoize the letter list item component
  const LetterListItem = useMemo(() => {
    return React.memo(
      ({
        letter,
        onOpen,
        onStarToggle,
      }: {
        letter: Letter;
        onOpen: (letter: Letter) => void;
        onStarToggle: (letter: Letter, e: React.MouseEvent) => void;
      }) => (
        <div
          key={letter._id}
          className={`p-4 cursor-pointer hover:bg-gray-50 ${
            letter.unread ? "bg-blue-50/30" : ""
          } transition-transform duration-200 hover:shadow-lg hover:scale-[1.02]`}
          onClick={() => onOpen(letter)}
        >
          {letter.unread && (
            <span className="absolute top-4 right-4 bg-[#D62E2E] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              New
            </span>
          )}
          {letter.isCC && (
            <span className="absolute top-4 right-16 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              CC
            </span>
          )}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold text-[#C88B3D] truncate max-w-xs">
              {letter.subject}
              {letter.isCC && (
                <span className="ml-2 text-sm text-blue-600 font-normal">
                  (Copy)
                </span>
              )}
            </h4>
            <button
              onClick={(e) => onStarToggle(letter, e)}
              className={`ml-2 text-xl ${
                letter.starred ? "text-[#C88B3D]" : "text-[#BFBFBF]"
              } hover:text-[#C88B3D] transition-colors`}
              title={letter.starred ? "Unstar" : "Star"}
            >
              <StarIcon
                className="w-5 h-5"
                fill={letter.starred ? "#C88B3D" : "none"}
              />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <span className="text-sm text-[#C88B3D] font-semibold">
              {t.inbox.from}:{" "}
              <span className="text-[#003F5D]">{letter.fromName}</span>
            </span>
            <span className="text-sm text-[#BFBFBF]">
              {formatDate(letter.createdAt)}
            </span>
            {letter.priority === "urgent" && (
              <span className="px-2 py-1 text-xs font-bold bg-[#D62E2E] text-white rounded-full">
                {t.inbox.filterOptions.urgent}
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-2 truncate max-w-2xl">
            {letter.content.length > 120
              ? letter.content.substring(0, 120) + "..."
              : letter.content}
          </p>
          {letter.attachments && letter.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {letter.attachments.map((attachment) => (
                <span
                  key={attachment.filename}
                  className="flex items-center gap-1 bg-[#BFBFBF] text-white px-2 py-1 rounded-full text-xs"
                >
                  <FaPaperclip className="text-[#C88B3D]" />
                  {attachment.filename}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    );
  }, [t.inbox.from, t.inbox.filterOptions.urgent]);

  // Memoize pagination handlers
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, search]);

  // Helper: receiver full name, fallback to username part of email if name not present
  const getRecipientDisplayName = (letter: Letter) =>
    letter.toName || (letter.toEmail ? letter.toEmail.split("@")[0] : "");

  // Helper: Extract only the user name before @ in email, fallback to full name if no email
  const getSenderDisplayName = (letter: Letter) => {
    if (letter.fromName) return letter.fromName;
    if (letter.fromEmail) return letter.fromEmail.split("@")[0];
    return "";
  };

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments().then((data) => setDepartments(data));
  }, []);

  // Fetch users when department changes
  useEffect(() => {
    if (selectedDepartment) {
      setLoadingUsers(true);
      fetchUsersByDepartment(selectedDepartment)
        .then((users) => setDepartmentUsers(users))
        .catch((error) => {
          console.error("Error fetching users:", error);
          toast.error(t.inbox.errorFetchingUsers);
          setDepartmentUsers([]);
        })
        .finally(() => {
          setLoadingUsers(false);
          setSelectedUsers([]);
          setToEmployee("");
        });
    } else {
      setDepartmentUsers([]);
      setSelectedUsers([]);
      setToEmployee("");
    }
  }, [selectedDepartment, t.inbox.errorFetchingUsers]);

  // Forward letter logic (send to actual users)
  const handleForwardLetter = async () => {
    if (!openLetter || (!toEmployee && selectedUsers.length === 0)) return;

    try {
      setIsForwardLoading(true);
      // Find the selected user from the toEmployee field
      const toUser = departmentUsers.find((u) => u.name === toEmployee);
      const recipients = toUser ? [toUser, ...selectedUsers] : selectedUsers;

      // Create a new letter for each recipient
      const forwardPromises = recipients.map(async (recipient) => {
        const forwardData = {
          subject: `Fwd: ${openLetter.subject}`,
          from: user.email, // The server will look up the user by email
          to: recipient.name, // The server expects the recipient's name
          department: recipient.department || selectedDepartment,
          priority: openLetter.priority,
          content: forwardComment
            ? `${forwardComment}\n\n--- ${t.inbox.forwardedMessage} ---\n\n${openLetter.content}`
            : `--- ${t.inbox.forwardedMessage} ---\n\n${openLetter.content}`,
          ccEmployees: {}, // Empty object for CC
          cc: [], // Empty array for CC
          status: "sent",
        };

        return axios.post("http://localhost:5000/api/letters", forwardData);
      });

      await Promise.all(forwardPromises);

      const recipientNames = recipients.map((u) => u.name).join(", ");
      setForwardStatus(`${t.inbox.messageForwarded} ${recipientNames}`);
      setTimeout(() => setForwardStatus(null), 3000);
      setShowForwardModal(false);
      setSelectedDepartment("");
      setSelectedUsers([]);
      setToEmployee("");
      setForwardComment("");
      toast.success(`${t.inbox.messageForwarded} ${recipientNames}`);

      // Refresh the letters list
      const res = await axios.get("http://localhost:5000/api/letters");
      const formattedLetters = res.data
        .filter((letter: Letter) => letter.toEmail === userEmail)
        .map((letter: Letter) => ({
          ...letter,
          unread: letter.unread ?? true,
          starred: letter.starred ?? false,
          priority: letter.priority ?? "normal",
          createdAt: letter.createdAt || new Date().toISOString(),
        }))
        .sort(
          (a: Letter, b: Letter) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      updateLetterStatus(openLetter._id, { unread: false, starred: false });
      fetchLetters();

      // Update unread count
      const unreadCount = formattedLetters.filter(
        (l: Letter) => l.unread
      ).length;
      updateUnreadLetters(unreadCount);
    } catch (error) {
      console.error("Error forwarding letter:", error);
      setForwardStatus(t.inbox.failedToForward);
      toast.error(t.inbox.failedToForward);
    } finally {
      setIsForwardLoading(false);
    }
  };

  const handleDownload = async (letterId: string, filename: string) => {
    try {
      setIsDownloadLoading((prev) => ({ ...prev, [filename]: true }));
      const response = await axios.get(
        `http://localhost:5000/api/letters/download/${letterId}/${filename}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t.inbox.downloadSuccess);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(t.inbox.errorDownloadingFile);
    } finally {
      setIsDownloadLoading((prev) => ({ ...prev, [filename]: false }));
    }
  };

  const handleView = async (
    letterId: string,
    filename: string,
    contentType: string
  ) => {
    try {
      setIsViewFileLoading((prev) => ({ ...prev, [filename]: true }));
      const response = await axios.get(
        `http://localhost:5000/api/letters/view/${letterId}/${filename}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );
      setPreviewUrl(url);
      setPreviewType(contentType);
      setPreviewVisible(true);
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error(t.inbox.errorViewingFile);
    } finally {
      setIsViewFileLoading((prev) => ({ ...prev, [filename]: false }));
    }
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  // Effect: If previewVisible and unsupported type, stop loading
  useEffect(() => {
    if (
      previewVisible &&
      previewType &&
      !previewType.startsWith("image/") &&
      previewType !== "application/pdf"
    ) {
      setIsPreviewLoading(false);
    }
  }, [previewVisible, previewType]);

  const handlePrint = () => {
    if (!openLetter) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const printContent = `
        <html>
          <head>
            <title>Memo - ${openLetter.subject}</title>
            <style>
              @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;700&display=swap");
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
              
              body {
                font-family: 'Roboto', 'Noto Sans Ethiopic', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .memo-container {
                display: flex;
                flex-direction: column;
                width: 210mm;
                height: 297mm;
                margin: 20px auto;
                background: white;
                padding: 20mm;
                box-sizing: border-box;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                flex-shrink: 0;
              }
              .logo {
                height: 60px;
                margin-bottom: 10px;
              }
              .institute-name .amharic {
                font-family: 'Noto Sans Ethiopic', sans-serif;
                font-weight: 700;
                font-size: 18px;
                color: #003F5D;
                margin: 0;
              }
              .institute-name .english {
                font-family: 'Roboto', sans-serif;
                font-weight: 700;
                font-size: 16px;
                color: #000;
                margin-top: 5px;
                margin-bottom: 0;
              }
              .color-bars {
                display: flex;
                width: 100%;
                height: 4px;
                margin-top: 15px;
              }
              .color-bars .bar { flex: 1; }
              .color-bars .blue { background-color: #005f9e; }
              .color-bars .brown { background-color: #c88b3d; margin: 0 5px; }
              .color-bars .red { background-color: #d62e2e; }
              
              .memo-title-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-top: 2px solid #c88b3d;
                padding-top: 15px;
                margin-top: 20px;
                flex-shrink: 0;
              }
              .memo-title .amharic {
                font-family: 'Noto Sans Ethiopic', sans-serif;
                font-size: 16px;
                font-weight: 700;
                margin: 0;
              }
              .memo-title .english {
                font-size: 14px;
                font-weight: 700;
                margin-top: 5px;
              }
              .memo-date {
                text-align: right;
                font-size: 14px;
              }
              .memo-date p { margin: 0; }
              .memo-date .date-label {
                font-size: 12px;
                color: #555;
              }
              
              .memo-body {
                margin-top: 20px;
                flex-grow: 1; /* Allows this to take up space */
                overflow-y: auto; /* In case content is too long, for viewing */
              }
              
              .signature-section {
                margin-top: 20px;
              }
              .signature-section p {
                margin: 0;
              }

              .footer {
                text-align: center;
                flex-shrink: 0;
                margin-top: 20px;
              }
              .footer-line {
                border-top: 2px solid #003F5D;
              }
              .footer-content {
                display: flex;
                justify-content: space-around;
                align-items: center;
                padding: 10px 0;
                font-size: 11px;
              }
              .footer-item {
                display: flex;
                align-items: center;
                gap: 5px;
              }
              .footer-item svg {
                width: 16px;
                height: 16px;
              }
              .footer-quote {
                margin-top: 10px;
                font-family: 'Noto Sans Ethiopic', sans-serif;
                font-style: italic;
                font-size: 12px;
              }

              @media print {
                body { margin: 0; background-color: white; }
                .memo-container {
                  margin: 0;
                  box-shadow: none;
                  width: 100%;
                  height: 100vh; /* Use viewport height for printing */
                  padding: 15mm;
                }
              }
            </style>
          </head>
          <body>
            <div class="memo-container">
                <div class="header">
                    <img src="${logo}" alt="SSGI Logo" class="logo">
                    <div class="institute-name">
                        <p class="amharic">የኅዋ ሳይንስና ጂኦስፓሻል ኢንስቲትዩት</p>
                        <p class="english">SPACE SCIENCE AND GEOSPATIAL INSTITUTE</p>
                    </div>
                    <div class="color-bars">
                        <div class="bar blue"></div>
                        <div class="bar brown"></div>
                        <div class="bar red"></div>
                    </div>
                </div>

                <div class="memo-title-section">
                    <div class="memo-title">
                        <p class="amharic">የውስጥ ማስታወሻ</p>
                        <p class="english">OFFICE MEMO</p>
                    </div>
                    <div class="memo-date">
                        <p><strong>${new Date(
                          openLetter.createdAt
                        ).toLocaleDateString("en-GB")}</strong></p>
                        <p class="date-label">Date</p>
                    </div>
                </div>

                <div class="memo-body">
                    <p><strong>Subject:</strong> ${openLetter.subject}</p>
                    <p><strong>To:</strong> ${getRecipientDisplayName(
                      openLetter
                    )}</p>
                    <br>
                    <div class="content-body">${openLetter.content.replace(
                      /\n/g,
                      "<br>"
                    )}</div>
                    <div class="signature-section">
                        <p>Signature:</p>
                        <br><br>
                        <p>${openLetter.fromName}</p>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-line"></div>
                    <div class="footer-content">
                        <div class="footer-item">
                          <svg fill="#c88b3d" viewBox="0 0 24 24"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"></path></svg>
                          <span>+251 118 96 10 50 / 51</span>
                        </div>
                        <div class="footer-item">
                           <svg fill="#c88b3d" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A1,1 0 0,0 10,17H14A1,1 0 0,0 15,16V15L19.79,10.21C19.92,10.78 20,11.38 20,12C20,16.08 16.95,19.44 13,19.93V18H11V19.93M17.89,8.11L13,13H11L6.11,8.11C6.5,7.22 7.22,6.5 8.11,6.11L12,10L15.89,6.11C16.78,6.5 17.5,7.22 17.89,8.11Z"></path></svg>
                          <span>www.ssgi.gov.et</span>
                        </div>
                        <div class="footer-item">
                           <svg fill="#c88b3d" viewBox="0 0 24 24"><path d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,11L20,6H4L12,11M20,18V8L12,13L4,8V18H20Z"></path></svg>
                           <span>33679 / 597</span>
                        </div>
                         <div class="footer-item">
                           <svg fill="#c88b3d" viewBox="0 0 24 24"><path d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,11L20,6H4L12,11M20,18V8L12,13L4,8V18H20Z"></path></svg>
                           <span>info@ssgi.gov.et</span>
                        </div>
                    </div>
                    <div class="footer-quote">
                        <p>"ከምድር እስከ ህዋ..."</p>
                    </div>
                </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-[#b97b2a] via-[#cfae7b] to-[#cfc7b7] text-transparent bg-clip-text drop-shadow-md">
            {t.inbox.title}
          </h2>
          <p className="text-lg text-[#BFBFBF] font-medium">
            {t.inbox.manageLetters}
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 justify-between">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              t.inbox.filterOptions.all,
              t.inbox.filterOptions.unread,
              t.inbox.filterOptions.starred,
              t.inbox.filterOptions.urgent,
              t.inbox.filterOptions.seen,
            ].map((filterKey) => {
              const filterValue = Object.keys(t.inbox.filterOptions).find(
                (key) =>
                  t.inbox.filterOptions[
                    key as keyof typeof t.inbox.filterOptions
                  ] === filterKey
              );
              return (
                <button
                  key={filterValue}
                  onClick={() => setSelectedFilter(filterValue || "all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm border border-blue-100 bg-white hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-400 ${
                    selectedFilter === filterValue
                      ? "bg-blue-100 text-blue-700 shadow-md border-blue-300"
                      : "text-gray-600"
                  }`}
                >
                  {filterKey}
                </button>
              );
            })}
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.inbox.searchPlaceholder}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm bg-white"
              />
            </div>
            <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-105">
              <FilterIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                hasNewLetters ? "animate-pulse" : ""
              }`}
            >
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
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
              )}
              {isRefreshing ? t.inbox.refreshing : t.inbox.refresh}
              {hasNewLetters && !isRefreshing && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  New
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#BFBFBF] overflow-hidden">
          {loadingLetters ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Loading your inbox..." />
            </div>
          ) : currentLetters.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 text-gray-300">
                <FileTextIcon className="w-full h-full" />
              </div>
              <p className="mt-4 text-xl text-gray-500">
                {t.inbox.noLettersFound}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {currentLetters.map((letter) => (
                <LetterListItem
                  key={letter._id}
                  letter={letter}
                  onOpen={handleLetterOpen}
                  onStarToggle={handleStarToggle}
                />
              ))}
            </div>
          )}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {t.inbox.showing}{" "}
              <span className="font-semibold text-gray-900">
                {startIndex + 1}
              </span>{" "}
              {t.inbox.to}{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(endIndex, filteredLetters.length)}
              </span>{" "}
              {t.inbox.of}{" "}
              <span className="font-semibold text-gray-900">
                {filteredLetters.length}
              </span>{" "}
              {t.inbox.letters}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border border-blue-100 bg-white hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-400 ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700"
                }`}
              >
                {t.inbox.previous}
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border border-blue-100 bg-white hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-400 ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700"
                }`}
              >
                {t.inbox.next}
              </button>
            </div>
          </div>
        </div>
      </div>
      {openLetter && (
        <Modal
          open={!!openLetter}
          onClose={() => {
            setOpenLetter(null);
            setViewMode(false);
          }}
          center
          classNames={{
            modal: "rounded-2xl shadow-2xl max-w-4xl w-full",
            overlay: "bg-black/50 backdrop-blur-sm",
          }}
        >
          <div className="p-6">
            {!viewMode ? (
              <div className="bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#BFBFBF] p-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-extrabold text-[#C88B3D] flex-1 truncate">
                    {openLetter.subject}
                  </h3>
                  {openLetter.priority === "urgent" && (
                    <span className="ml-4 px-4 py-1 rounded-full bg-[#D62E2E] text-white font-bold text-sm shadow">
                      {t.inbox.filterOptions.urgent}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[180px] bg-[#BFBFBF] bg-opacity-20 rounded-lg p-4">
                    <div className="text-xs text-[#BFBFBF] font-semibold mb-1">
                      {t.inbox.from}
                    </div>
                    <div className="text-[#003F5D] font-bold">
                      {getSenderDisplayName(openLetter)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] bg-[#BFBFBF] bg-opacity-20 rounded-lg p-4">
                    <div className="text-xs text-[#BFBFBF] font-semibold mb-1">
                      {t.inbox.recipient}
                    </div>
                    <div className="text-[#003F5D] font-bold">
                      {getRecipientDisplayName(openLetter)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] bg-[#BFBFBF] bg-opacity-20 rounded-lg p-4">
                    <div className="text-xs text-[#BFBFBF] font-semibold mb-1">
                      {t.inbox.department}
                    </div>
                    <div className="text-[#003F5D] font-bold">
                      {openLetter.department}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px] bg-[#BFBFBF] bg-opacity-20 rounded-lg p-4">
                    <div className="text-xs text-[#BFBFBF] font-semibold mb-1">
                      {t.inbox.date}
                    </div>
                    <div className="text-[#C88B3D] font-bold">
                      {formatDate(openLetter.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs text-[#BFBFBF] font-semibold mb-2">
                    Content
                  </div>
                  <div className="bg-[#FFF7E6] border-l-4 border-[#C88B3D] rounded-lg p-6 text-gray-800 whitespace-pre-line text-lg shadow-inner">
                    {openLetter.content}
                  </div>
                </div>
                {openLetter.attachments &&
                  openLetter.attachments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-[#C88B3D] mb-4 flex items-center gap-2">
                        <FaPaperclip className="text-[#C88B3D]" />{" "}
                        {t.inbox.attachments}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {openLetter.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-[#BFBFBF] bg-opacity-20 p-4 rounded-lg border border-[#BFBFBF] hover:border-[#C88B3D] transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <FileTextIcon className="h-8 w-8 text-[#C88B3D]" />
                              <span className="text-sm text-[#003F5D] font-medium">
                                {file.filename}
                              </span>
                            </div>
                            <div className="flex space-x-2 items-center">
                              <button
                                className="text-green-600 hover:text-green-800 underline"
                                onClick={() => {
                                  // Guess file type from extension
                                  const ext = file.filename
                                    .split(".")
                                    .pop()
                                    ?.toLowerCase();
                                  let type = "";
                                  if (
                                    [
                                      "jpg",
                                      "jpeg",
                                      "png",
                                      "gif",
                                      "bmp",
                                      "webp",
                                    ].includes(ext || "")
                                  ) {
                                    type = `image/${
                                      ext === "jpg" ? "jpeg" : ext
                                    }`;
                                  } else if (ext === "pdf") {
                                    type = "application/pdf";
                                  } else {
                                    type = "";
                                  }
                                  setIsPreviewLoading(true);
                                  setPreviewUrl(
                                    `http://localhost:5000/api/letters/view/${
                                      openLetter._id
                                    }/${encodeURIComponent(file.filename)}`
                                  );
                                  setPreviewType(type);
                                  setPreviewVisible(true);
                                }}
                              >
                                preview
                              </button>
                              <button
                                onClick={() =>
                                  handleDownload(openLetter._id, file.filename)
                                }
                                disabled={isDownloadLoading[file.filename]}
                                className={`p-2 text-[#C88B3D] hover:text-[#D62E2E] hover:bg-[#FFF7E6] rounded-lg transition-colors duration-200 ${
                                  isDownloadLoading[file.filename]
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                title={t.inbox.download}
                              >
                                {isDownloadLoading[file.filename] ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#C88B3D] border-t-transparent"></div>
                                ) : (
                                  <Download className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                <div className="mt-8 flex space-x-3 justify-end">
                  <button
                    onClick={() => setViewMode(true)}
                    disabled={isViewLoading}
                    className={`px-6 py-3 bg-[#C88B3D] text-white rounded-lg shadow-md hover:bg-[#D62E2E] transition-all duration-200 font-bold text-lg ${
                      isViewLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isViewLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        {t.inbox.loading}
                      </div>
                    ) : (
                      t.inbox.viewButton
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <TemplateMemoLetter
                  subject={openLetter.subject}
                  date={getLetterSentDate(openLetter.createdAt)}
                  recipient={getRecipientDisplayName(openLetter)}
                  reference={""}
                  body={openLetter.content}
                  signature={openLetter.fromName}
                />
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => setViewMode(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700"
                  >
                    {t.inbox.backButton}
                  </button>
                  <button
                    onClick={() => handlePrint()}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
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
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    {t.inbox.printButton}
                  </button>
                  {/* Only show forward button for non-CC letters */}
                  {!openLetter.isCC && (
                    <button
                      onClick={() => setShowForwardModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
                    >
                      {t.inbox.forwardButton}
                    </button>
                  )}
                </div>
                {/* Only show forward modal for non-CC letters */}
                {showForwardModal && !openLetter.isCC && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                      <h3 className="text-lg font-semibold mb-4">
                        {t.inbox.forwardLetter}
                      </h3>
                      <div className="mb-4">
                        <DepartmentSelector
                          onChange={(value) => {
                            setSelectedDepartment(value);
                            setSelectedUsers([]);
                            setToEmployee("");
                          }}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.inbox.recipient}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder={
                              loadingUsers
                                ? t.inbox.loadingUsers
                                : t.inbox.selectEmployee
                            }
                            value={toEmployee}
                            onChange={(e) => setToEmployee(e.target.value)}
                            list="user-list"
                            autoComplete="off"
                            disabled={!selectedDepartment || loadingUsers}
                          />
                          {loadingUsers && (
                            <div className="absolute right-3 top-2.5">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                            </div>
                          )}
                          <datalist id="user-list">
                            {departmentUsers.map((user) => (
                              <option key={user.email} value={user.name}>
                                {user.name}
                              </option>
                            ))}
                          </datalist>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.inbox.addComment}
                        </label>
                        <textarea
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder={t.inbox.addCommentPlaceholder}
                          value={forwardComment}
                          onChange={(e) => setForwardComment(e.target.value)}
                          rows={3}
                        />
                      </div>
                      {loadingUsers ? (
                        <div className="mb-4 p-4 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                          <p className="mt-2 text-gray-600">
                            {t.inbox.loadingUsers}
                          </p>
                        </div>
                      ) : departmentUsers.length > 0 ? (
                        <div className="mb-4">
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            {t.inbox.additionalRecipients}
                          </label>
                          <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                            {departmentUsers.map((user) => (
                              <div
                                key={user.email}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  id={user.email}
                                  checked={selectedUsers.some(
                                    (u) => u.email === user.email
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUsers([
                                        ...selectedUsers,
                                        user,
                                      ]);
                                    } else {
                                      setSelectedUsers(
                                        selectedUsers.filter(
                                          (u) => u.email !== user.email
                                        )
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={user.email}
                                  className="text-sm text-gray-700"
                                >
                                  {user.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setShowForwardModal(false);
                            setSelectedDepartment("");
                            setSelectedUsers([]);
                            setToEmployee("");
                            setForwardComment("");
                          }}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          {t.inbox.cancel}
                        </button>
                        <button
                          onClick={handleForwardLetter}
                          disabled={
                            isForwardLoading ||
                            (!toEmployee && selectedUsers.length === 0)
                          }
                          className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isForwardLoading
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {isForwardLoading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                              {t.inbox.forwarding}
                            </div>
                          ) : (
                            t.inbox.forwardButton
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
      <Modal
        open={previewVisible}
        onClose={handlePreviewClose}
        center
        classNames={{
          modal: "rounded-2xl shadow-2xl w-4/5 h-4/5",
          overlay: "bg-black/50 backdrop-blur-sm",
        }}
      >
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
            {isPreviewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
                <LoadingSpinner message="Loading preview..." />
              </div>
            )}
            {previewType.startsWith("image/") ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => setIsPreviewLoading(false)}
              />
            ) : previewType === "application/pdf" ? (
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg shadow-lg"
                title="PDF Preview"
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => setIsPreviewLoading(false)}
              />
            ) : (
              <div className="text-center p-8">
                <FileTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 mb-2">
                  {t.inbox.previewNotAvailable}
                </p>
                <p className="text-sm text-gray-500">
                  {t.inbox.downloadToView}
                </p>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handlePreviewClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              {t.inbox.closeButton}
            </button>
            <button
              onClick={() => {
                if (previewUrl) {
                  const link = document.createElement("a");
                  link.href = previewUrl;
                  link.download = "file";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-105"
            >
              {t.inbox.downloadButton}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(Inbox);
