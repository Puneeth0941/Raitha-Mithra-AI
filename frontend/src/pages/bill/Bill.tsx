import { useState, useEffect } from "react";
import {
  FaReceipt,
  FaPlus,
  FaTrash,
  FaDownload,
  FaEye,
  FaSpinner,
  FaFileAlt,
  FaFilePdf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { getAllBills, uploadBill, deleteBill, downloadBillUrl } from "../../services/billService";
import type { BillData } from "../../services/billService";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

export default function BillPage() {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

  // Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [billType, setBillType] = useState<string>("Pesticide / Fertilizer");
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Modal lightbox for viewing full bill
  const [viewingBill, setViewingBill] = useState<BillData | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const list = await getAllBills();
      setBills(list);
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress(0);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();

      // 1. Extension / Type Validation
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase()) && !ALLOWED_EXTENSIONS.includes(ext)) {
        setErrorMsg("Unsupported file format! Please select a JPG, JPEG, PNG, or PDF file.");
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      // 2. File Size Validation (<= 5 MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB maximum limit.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setSelectedFile(file);
      const fileIsPdf = file.type === "application/pdf" || ext === ".pdf";
      setIsPdf(fileIsPdf);

      if (!fileIsPdf) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPdf(false);
    setUploadProgress(0);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFile) {
      setErrorMsg("Please select a bill image or PDF file before submitting.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      await uploadBill(
        selectedFile,
        undefined,
        billType,
        billDate,
        notes,
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      );
      setSuccessMsg("Bill uploaded and archived successfully!");

      // Reset form
      handleRemoveFile();
      setNotes("");
      setShowUploadForm(false);

      // Auto-refresh list
      await fetchBills();
    } catch (err: any) {
      console.error("Error uploading bill:", err);
      const detail = err.response?.data?.detail || "Failed to upload bill. Please check your internet connection.";
      setErrorMsg(detail);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bill record?")) return;
    try {
      await deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
      if (viewingBill?.id === id) setViewingBill(null);
      setSuccessMsg("Bill record deleted successfully.");
    } catch (err) {
      console.error("Error deleting bill:", err);
      setErrorMsg("Failed to delete bill record.");
    }
  };

  const getFullImageUrl = (path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `http://127.0.0.1:8000/${path}`;
  };

  const isPdfFile = (path: string) => {
    return path.toLowerCase().endsWith(".pdf");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-800 rounded-3xl text-white p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <FaReceipt /> Farm Bills & Vouchers
          </h1>
          <p className="text-green-100 mt-1">Upload, archive, and view bill receipts and payment records</p>
        </div>
        <button
          onClick={() => {
            setShowUploadForm(!showUploadForm);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className="bg-white text-green-800 font-bold px-5 py-2.5 rounded-xl shadow hover:bg-green-50 transition flex items-center gap-2"
        >
          <FaPlus /> {showUploadForm ? "Cancel Upload" : "Upload New Bill"}
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <FaCheckCircle className="text-emerald-600 text-lg" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <FaTimes />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <FaExclamationTriangle className="text-rose-600 text-lg" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Upload Bill Form Card */}
      {showUploadForm && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaReceipt className="text-green-600" /> Upload Farm Bill
          </h2>

          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* File Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Bill Image or PDF File * <span className="text-xs text-gray-400 font-normal">(Max 5 MB)</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full border border-gray-300 rounded-xl p-2 bg-gray-50 text-sm text-gray-800 focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bill Category</label>
                <select
                  value={billType}
                  onChange={(e) => setBillType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-gray-50 text-sm text-gray-800 focus:ring-2 focus:ring-green-500"
                >
                  <option value="Pesticide / Fertilizer">Pesticide / Fertilizer</option>
                  <option value="Labor Payment">Labor Payment</option>
                  <option value="Equipment & Fuel">Equipment & Fuel</option>
                  <option value="Irrigation / Electric">Irrigation / Electric</option>
                  <option value="General Harvest">General Harvest</option>
                </select>
              </div>

              {/* Bill Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bill Date</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-gray-50 text-sm text-gray-800 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes / Details (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Copper sulfate purchase bill from APMC store"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 text-sm text-gray-800 focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Live File Preview Box */}
            {selectedFile && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Bill preview"
                      className="w-20 h-20 object-cover rounded-xl border border-green-500 shadow-sm"
                    />
                  ) : isPdf ? (
                    <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      <FaFilePdf />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 text-gray-500 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      <FaFileAlt />
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB | Type:{" "}
                      {selectedFile.type || "Document"}
                    </p>
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                      Ready to Upload
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold border border-rose-200 bg-white px-3 py-1.5 rounded-lg transition"
                >
                  Remove File
                </button>
              </div>
            )}

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>Uploading file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  handleRemoveFile();
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-5 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow"
              >
                {uploading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Uploading Bill...
                  </>
                ) : (
                  <>
                    <FaPlus /> Save & Upload Bill
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bill List Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-green-600 gap-3">
          <FaSpinner className="animate-spin text-3xl" />
          <span className="text-lg font-semibold">Loading Farm Bills...</span>
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-500">
          <FaFileAlt className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-lg">No farm bills uploaded yet</p>
          <p className="text-sm mt-1">Click "Upload New Bill" to archive receipt photos and PDFs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => {
            const pdf = isPdfFile(bill.image_url);
            const fullUrl = getFullImageUrl(bill.image_url);

            return (
              <div
                key={bill.id}
                className="bg-white rounded-3xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col justify-between transition"
              >
                <div>
                  {/* Thumbnail / PDF Indicator */}
                  <div
                    className="h-48 bg-gray-100 relative cursor-pointer group flex items-center justify-center overflow-hidden"
                    onClick={() => setViewingBill(bill)}
                  >
                    {pdf ? (
                      <div className="w-full h-full bg-rose-50 flex flex-col items-center justify-center text-rose-600 group-hover:scale-105 transition">
                        <FaFilePdf className="text-5xl mb-2" />
                        <span className="text-xs font-bold text-gray-700">PDF Document</span>
                      </div>
                    ) : (
                      <img
                        src={fullUrl}
                        alt={bill.bill_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2 font-bold text-sm">
                      <FaEye /> View Full Document
                    </div>
                    <span className="absolute top-3 right-3 bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
                      {bill.bill_type}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                      <span>Date: {bill.date || bill.uploaded_at.substring(0, 10)}</span>
                    </div>
                    {bill.notes && <p className="text-sm text-gray-700 font-medium leading-snug">{bill.notes}</p>}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm">
                  <a
                    href={downloadBillUrl(bill.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 font-bold flex items-center gap-1.5 hover:underline"
                  >
                    <FaDownload /> Download
                  </a>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="text-red-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Viewing Image/PDF Lightbox Modal */}
      {viewingBill && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewingBill(null)}
        >
          <div
            className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{viewingBill.bill_type} Bill</h3>
                <p className="text-xs text-green-100">
                  Date: {viewingBill.date || viewingBill.uploaded_at.substring(0, 10)}
                </p>
              </div>
              <button
                onClick={() => setViewingBill(null)}
                className="bg-white/20 hover:bg-white/30 text-white font-bold p-2 rounded-full text-xs transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body (Content) */}
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-gray-100">
              {isPdfFile(viewingBill.image_url) ? (
                <iframe
                  src={getFullImageUrl(viewingBill.image_url)}
                  title="Bill PDF"
                  className="w-full h-[65vh] rounded-xl border border-gray-200"
                />
              ) : (
                <img
                  src={getFullImageUrl(viewingBill.image_url)}
                  alt="Full Bill"
                  className="max-h-[70vh] w-auto mx-auto object-contain rounded-xl shadow-md"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
              {viewingBill.notes ? (
                <p className="text-xs text-gray-600 font-medium truncate max-w-md">Notes: {viewingBill.notes}</p>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-3">
                <a
                  href={downloadBillUrl(viewingBill.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <FaDownload /> Download File
                </a>
                <button
                  onClick={() => handleDelete(viewingBill.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1"
                >
                  <FaTrash /> Delete Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
