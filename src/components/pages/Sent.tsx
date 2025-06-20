import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Input, Select, Modal, Form } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  SendOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  PrinterOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import TemplateMemoLetter from "./TemplateMemoLetter";
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { useSent } from "../../context/SentContext";
import ErrorBoundary from "../common/ErrorBoundary";

interface Attachment {
  filename: string;
  contentType: string;
  uploadDate: string;
}

interface Letter {
  _id: string;
  subject: string;
  to: string;
  toEmail: string;
  fromEmail: string;
  createdAt: string;
  status: string;
  department: string;
  priority: string;
  attachments: Attachment[];
  content: string;
  fromName: string;
}

const Sent: React.FC = () => {
  const { letters, loading, fetchLetters, refresh } = useSent();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [composeVisible, setComposeVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewType, setPreviewType] = useState<string>("");
  const [memoViewVisible, setMemoViewVisible] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [form] = Form.useForm();
  const [attachment, setAttachment] = useState<File | null>(null);
  const memoPrintRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user.email || "";

  const handleDownload = async (letterId: string, filename: string) => {
    try {
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
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(t.sent.errorDownloadingFile);
    }
  };

  const handleView = async (
    letterId: string,
    filename: string,
    contentType: string
  ) => {
    try {
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
      toast.error(t.sent.errorViewingFile);
    }
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  const handleMemoView = (letter: Letter) => {
    setSelectedLetter(letter);
    setMemoViewVisible(true);
  };

  const handlePrint = () => {
    if (memoPrintRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${t.sent.memoLetterView}</title>
              <style>
                @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;700&display=swap");
                body {
                  font-family: 'Noto Sans Ethiopic', Arial, sans-serif;
                  margin: 40px;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 20px;
                  }
                }
              </style>
            </head>
            <body>
              ${memoPrintRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const columns = [
    {
      title: t.sent.subjectColumn,
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: t.sent.toColumn,
      dataIndex: "to",
      key: "to",
    },
    {
      title: t.sent.departmentColumn,
      dataIndex: "department",
      key: "department",
    },
    {
      title: t.sent.dateColumn,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t.sent.statusColumn,
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status.charAt(0).toUpperCase() + status.slice(1),
    },
    {
      title: t.sent.priorityColumn,
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) =>
        priority.charAt(0).toUpperCase() + priority.slice(1),
    },
    {
      title: t.sent.attachmentsColumn,
      key: "attachments",
      render: (record: Letter) => (
        <div className="flex gap-2">
          {record.attachments && record.attachments.length > 0 ? (
            record.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-1">
                <PaperClipOutlined className="text-gray-600" />
                <span className="text-sm text-gray-600">
                  {attachment.filename}
                </span>
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    handleView(
                      record._id,
                      attachment.filename,
                      attachment.contentType
                    )
                  }
                  size="small"
                />
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    handleDownload(record._id, attachment.filename)
                  }
                  size="small"
                />
              </div>
            ))
          ) : (
            <span className="text-gray-400">{t.sent.noAttachments}</span>
          )}
        </div>
      ),
    },
    {
      title: t.sent.memoViewColumn,
      key: "memoView",
      render: (record: Letter) => (
        <Button
          type="link"
          icon={<FileTextOutlined />}
          onClick={() => handleMemoView(record)}
          size="small"
        >
          {t.sent.viewMemoButton}
        </Button>
      ),
    },
  ];

  const filteredLetters = letters.filter((letter) => {
    const matchesSearch =
      letter.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      letter.to.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || letter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendLetter = async (values: {
    subject: string;
    recipient: string;
    content: string;
    department: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append("subject", values.subject);
      formData.append("to", values.recipient);
      formData.append("content", values.content);
      formData.append("department", values.department);
      formData.append("priority", "normal");
      formData.append("fromEmail", userEmail); // Add sender's email

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await axios.post(
        "http://localhost:5000/api/letters",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh the sent letters list to include the new letter
      refresh();
      toast.success(t.sent.letterSentSuccess);
      setComposeVisible(false);
      form.resetFields();
      setAttachment(null);
    } catch (error) {
      console.error("Error sending letter:", error);
      toast.error(t.sent.failedToSendLetter);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-3 mb-2">
          <MailOutlined className="text-4xl text-blue-500 animate-bounce" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg">
            {t.sent.title || "Sent Letters"}
          </h1>
        </div>
        <p className="text-lg text-gray-500 font-medium">
          Easily track and manage all your sent correspondence
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 justify-between">
        <div className="flex gap-4 w-full md:w-auto">
          <Input
            placeholder={t.sent.searchPlaceholder || "Search letters..."}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs rounded-lg shadow-sm border-blue-200 focus:border-blue-400"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-40 rounded-lg shadow-sm border-blue-200"
          >
            <Select.Option value="all">
              {t.sent.allStatus || "All Status"}
            </Select.Option>
            <Select.Option value="sent">
              {t.sent.statusSent || "Sent"}
            </Select.Option>
            <Select.Option value="delivered">
              {t.sent.statusDelivered || "Delivered"}
            </Select.Option>
          </Select>
        </div>
        <Button
          type="primary"
          icon={<SendOutlined />}
          className="bg-gradient-to-r from-blue-500 to-pink-500 border-0 shadow-lg hover:from-pink-500 hover:to-blue-500 transition-all duration-300"
          onClick={() => navigate("/new-letter")}
        >
          {t.sent.newLetterButton || "New Letter"}
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your sent letters..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {letters.length === 0 && (
            <div className="col-span-full text-center text-gray-400 text-xl font-semibold py-20">
              <MailOutlined className="text-6xl mb-4 animate-pulse text-blue-300" />
              <div>No sent letters found.</div>
            </div>
          )}
          {filteredLetters.map((letter) => (
            <div
              key={letter._id}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border-t-4 border-blue-400 hover:border-pink-400 relative group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-blue-700 group-hover:text-pink-600 transition-colors duration-300">
                  {letter.subject}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    letter.priority === "urgent"
                      ? "bg-pink-100 text-pink-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {letter.priority.charAt(0).toUpperCase() +
                    letter.priority.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-sm">
                  To:{" "}
                  <span className="font-medium text-gray-700">{letter.to}</span>
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(letter.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mb-2 text-gray-600 text-sm">
                Department:{" "}
                <span className="font-medium">{letter.department}</span>
              </div>
              <div className="mb-3 text-gray-700 line-clamp-2">
                {letter.content}
              </div>
              <div className="flex gap-2 mb-2">
                {letter.attachments && letter.attachments.length > 0 ? (
                  letter.attachments.map((attachment, idx) => (
                    <Button
                      key={idx}
                      type="link"
                      icon={<PaperClipOutlined />}
                      className="text-blue-500 hover:text-pink-500"
                      onClick={() =>
                        handleDownload(letter._id, attachment.filename)
                      }
                    >
                      {attachment.filename}
                    </Button>
                  ))
                ) : (
                  <span className="text-gray-300 italic">No attachments</span>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  className="hover:bg-blue-50 hover:text-blue-700"
                  onClick={() =>
                    handleView(
                      letter._id,
                      letter.attachments[0]?.filename,
                      letter.attachments[0]?.contentType
                    )
                  }
                  disabled={
                    !letter.attachments || letter.attachments.length === 0
                  }
                >
                  View
                </Button>
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  className="hover:bg-pink-50 hover:text-pink-700"
                  onClick={() => handleMemoView(letter)}
                >
                  Memo
                </Button>
              </div>
              <span
                className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold ${
                  letter.status === "read"
                    ? "bg-green-100 text-green-600"
                    : letter.status === "delivered"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={t.sent.composeNewLetter}
        open={composeVisible}
        onCancel={() => {
          setComposeVisible(false);
          setAttachment(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSendLetter}>
          <Form.Item
            label={t.sent.subjectLabel}
            name="subject"
            rules={[{ required: true, message: t.sent.subjectRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t.sent.recipientLabel}
            name="recipient"
            rules={[{ required: true, message: t.sent.recipientRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t.sent.departmentLabel}
            name="department"
            rules={[{ required: true, message: t.sent.departmentRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t.sent.contentLabel}
            name="content"
            rules={[{ required: true, message: t.sent.contentRequired }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label={t.sent.attachmentLabel}>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {attachment && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <PaperClipOutlined />
                  <span>{attachment.name}</span>
                  <Button
                    type="link"
                    danger
                    onClick={removeAttachment}
                    size="small"
                  >
                    {t.sent.removeAttachment}
                  </Button>
                </div>
              )}
            </div>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              block
            >
              {t.sent.sendLetterButton}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={t.sent.filePreview}
        open={previewVisible}
        onCancel={handlePreviewClose}
        footer={[
          <Button key="close" onClick={handlePreviewClose}>
            {t.sent.closeButton}
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
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
          >
            {t.sent.downloadButton}
          </Button>,
        ]}
        width={800}
      >
        <div className="w-full h-[600px] flex items-center justify-center">
          {previewType.startsWith("image/") ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          ) : previewType === "application/pdf" ? (
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-500">{t.sent.previewNotAvailable}</p>
              <p className="text-sm text-gray-400">{t.sent.downloadToView}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Memo View Modal */}
      <Modal
        title={t.sent.memoLetterView}
        open={memoViewVisible}
        onCancel={() => {
          setMemoViewVisible(false);
          setSelectedLetter(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setMemoViewVisible(false);
              setSelectedLetter(null);
            }}
          >
            {t.sent.closeButton}
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            {t.sent.printButton}
          </Button>,
        ]}
        width={800}
      >
        {selectedLetter && (
          <div className="p-4" ref={memoPrintRef}>
            <TemplateMemoLetter
              subject={selectedLetter.subject}
              date={selectedLetter.createdAt}
              recipient={selectedLetter.to}
              reference={""}
              body={selectedLetter.content}
              signature={selectedLetter.fromName}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default (props: any) => (
  <ErrorBoundary>
    <Sent {...props} />
  </ErrorBoundary>
);
