"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";
import * as XLSX from "xlsx";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app";

export default function CustomersAdminPage() {
  const { user } = useAppContext();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);

  // Bulk Upload State
  const [bulkTab, setBulkTab] = useState("file"); // 'file' or 'paste'
  const [pastedText, setPastedText] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const [fileName, setFileName] = useState("");

  // Single Customer State
  const [singleName, setSingleName] = useState("");
  const [singlePhone, setSinglePhone] = useState("");
  const [isSavingSingle, setIsSavingSingle] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, search]);

  // Clean phone number helper to international format
  const cleanPhone = (val) => {
    let digits = String(val || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("0")) {
      digits = "91" + digits.substring(1);
    } else if (digits.length === 10) {
      digits = "91" + digits;
    }
    return digits;
  };

  // Parse Excel 2D rows into customer list
  const parseExcelRows = (rawRows) => {
    if (!rawRows || rawRows.length === 0) {
      setParsedRows([]);
      return;
    }

    // Filter out rows that are completely empty
    const rows = rawRows.filter(
      (r) =>
        Array.isArray(r) &&
        r.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== "")
    );

    if (rows.length === 0) {
      setParsedRows([]);
      return;
    }

    let startIndex = 0;
    let nameCol = -1;
    let phoneCol = -1;

    // Check if row 0 is a header
    const firstRow = rows[0].map((c) => String(c || "").trim().toLowerCase());
    const hasHeader = firstRow.some(
      (c) =>
        c.includes("name") ||
        c.includes("phone") ||
        c.includes("mobile") ||
        c.includes("contact") ||
        c.includes("number") ||
        c.includes("customer")
    );

    if (hasHeader) {
      startIndex = 1;
      firstRow.forEach((h, idx) => {
        if (nameCol === -1 && (h.includes("name") || h.includes("customer"))) {
          nameCol = idx;
        }
        if (
          phoneCol === -1 &&
          (h.includes("phone") || h.includes("mobile") || h.includes("contact") || h.includes("number"))
        ) {
          phoneCol = idx;
        }
      });
    }

    // Fallbacks if columns are not named explicitly
    if (nameCol === -1 && phoneCol === -1) {
      if (rows[startIndex] && rows[startIndex].length >= 2) {
        const cell0Digits = String(rows[startIndex][0] || "").replace(/\D/g, "");
        const cell1Digits = String(rows[startIndex][1] || "").replace(/\D/g, "");
        if (cell0Digits.length >= 7 && cell1Digits.length < 7) {
          phoneCol = 0;
          nameCol = 1;
        } else {
          nameCol = 0;
          phoneCol = 1;
        }
      } else {
        nameCol = 0;
        phoneCol = 0;
      }
    } else if (nameCol === -1) {
      nameCol = phoneCol === 0 ? 1 : 0;
    } else if (phoneCol === -1) {
      phoneCol = nameCol === 0 ? 1 : 0;
    }

    const dataRows = rows.slice(startIndex);
    const parsed = dataRows.map((row, idx) => {
      let name = String(row[nameCol] !== undefined && row[nameCol] !== null ? row[nameCol] : "").trim();
      let phone = String(row[phoneCol] !== undefined && row[phoneCol] !== null ? row[phoneCol] : "").trim();

      // If only phone was provided in the row
      if (!name && phone) {
        name = "Valued Customer";
      } else if (name && !phone) {
        const digits = name.replace(/\D/g, "");
        if (digits.length >= 10) {
          phone = name;
          name = "Valued Customer";
        }
      } else if (/^\d{10,15}$/.test(name.replace(/\D/g, "")) && !/\d{5,}/.test(phone)) {
        // Swap if name contains phone digits and phone has name string
        const temp = name;
        name = phone || "Valued Customer";
        phone = temp;
      }

      const formatted = cleanPhone(phone);
      const isValid = formatted.length >= 10 && formatted.length <= 15;

      return {
        id: idx + 1,
        name: name || "Valued Customer",
        phone: formatted || phone,
        rawPhone: phone,
        isValid,
        reason: isValid ? "Valid WhatsApp candidate" : "Phone must be at least 10 digits",
      };
    });

    setParsedRows(parsed);
  };

  // Handle Excel file selection (.xlsx, .xls)
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStats(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          alert("The Excel file has no worksheets.");
          return;
        }
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        parseExcelRows(rows);
      } catch (err) {
        console.error("Excel parse error:", err);
        alert("Could not read this Excel file. Please ensure it is a valid .xlsx or .xls file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Parse raw text paste (Name, Phone per line)
  const parseCustomerData = (text) => {
    if (!text || !text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    const firstLineLower = lines[0].toLowerCase();
    const hasHeader =
      firstLineLower.includes("name") ||
      firstLineLower.includes("phone") ||
      firstLineLower.includes("mobile") ||
      firstLineLower.includes("contact");

    const dataLines = hasHeader ? lines.slice(1) : lines;

    const parsed = dataLines.map((line, idx) => {
      const parts = line.split(/[,\t;]/).map((p) => p.trim());

      let name = "";
      let phone = "";

      if (parts.length === 1) {
        phone = parts[0];
        name = "Valued Customer";
      } else {
        if (/\d{7,}/.test(parts[0])) {
          phone = parts[0];
          name = parts[1] || "Valued Customer";
        } else {
          name = parts[0] || "Valued Customer";
          phone = parts[1];
        }
      }

      const formatted = cleanPhone(phone);
      const isValid = formatted.length >= 10 && formatted.length <= 15;

      return {
        id: idx + 1,
        name: name || "Valued Customer",
        phone: formatted || phone,
        rawPhone: phone,
        isValid,
        reason: isValid ? "Valid WhatsApp candidate" : "Phone must be at least 10 digits",
      };
    });

    setParsedRows(parsed);
  };

  const handlePasteChange = (e) => {
    const val = e.target.value;
    setPastedText(val);
    setUploadStats(null);
    parseCustomerData(val);
  };

  // Execute bulk upload to backend
  const handleConfirmBulkUpload = async () => {
    const validCandidates = parsedRows.filter((r) => r.isValid);
    if (validCandidates.length === 0) {
      alert("No valid contacts found to upload. Please ensure phone numbers have at least 10 digits.");
      return;
    }

    setIsUploading(true);
    setUploadStats(null);

    try {
      const payload = validCandidates.map((r) => ({
        name: r.name,
        phone: r.phone,
      }));

      const res = await fetch(`${API_BASE}/api/customers/bulk-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers: payload }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStats(data.stats);
        fetchCustomers();
      } else {
        alert(data.error || "Failed to process bulk upload.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while uploading contacts. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Single Customer Add
  const handleAddSingle = async (e) => {
    e.preventDefault();
    if (!singlePhone) return;

    setIsSavingSingle(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: singleName.trim() || "Valued Customer",
          phone: singlePhone.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Customer saved successfully!");
        setSingleName("");
        setSinglePhone("");
        setShowSingleModal(false);
        fetchCustomers();
      } else {
        alert(data.error || "Failed to save customer.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving customer.");
    } finally {
      setIsSavingSingle(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from your customer database?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete customer.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting customer.");
    }
  };

  // Download Sample Excel Template (.xlsx) with 3 mock data rows
  const downloadSampleExcel = () => {
    const templateData = [
      ["Name", "Phone"],
      ["Ramesh Kumar", "9876543210"],
      ["Suresh Patel", "9845612345"],
      ["Kavitha Selvam", "9688226761"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    // Set column widths for optimal display
    ws["!cols"] = [{ wch: 22 }, { wch: 18 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customer_upload_template.xlsx");
  };

  // Export All Customers to Excel (.xlsx)
  const exportAllCustomersExcel = () => {
    if (customers.length === 0) {
      alert("No customers in database to export.");
      return;
    }

    const exportData = customers.map((c, idx) => ({
      "S.No": idx + 1,
      "Customer Name": c.name || "Valued Customer",
      "WhatsApp Phone": `+${c.phone}`,
      "Status": c.is_verified ? "Verified" : "Active",
      "Date Added": new Date(c.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [{ wch: 8 }, { wch: 26 }, { wch: 20 }, { wch: 14 }, { wch: 16 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `customers_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen max-w-7xl">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-green-700 hover:text-green-900 font-bold bg-green-50 hover:bg-green-100 p-3 rounded-full transition-colors"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold text-green-950 dark:text-white tracking-tight">
              Customer Database
            </h1>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Manage contacts and bulk upload Excel files for WhatsApp campaigns.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/whatsapp"
            style={{ backgroundColor: "#25D366" }}
            className="hover:opacity-90 text-white font-extrabold py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <span>📱 Blast Promo to All ({customers.length})</span>
          </Link>
          <Link
            href="/admin/products"
            className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <span>📦 Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards & Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-modern p-6 rounded-3xl border border-white/40 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 bg-green-500/20 text-green-600 rounded-2xl flex items-center justify-center text-3xl">
            👥
          </div>
          <div>
            <div className="text-3xl font-extrabold text-green-950 dark:text-white">
              {loading ? "..." : customers.length}
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Stored Contacts
            </div>
          </div>
        </div>

        <div className="glass-modern p-6 rounded-3xl border border-white/40 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 bg-[#25D366]/20 text-[#25D366] rounded-2xl flex items-center justify-center text-3xl">
            ✅
          </div>
          <div>
            <div className="text-3xl font-extrabold text-green-950 dark:text-white">
              {loading ? "..." : customers.filter((c) => c.is_verified).length}
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              WhatsApp Active
            </div>
          </div>
        </div>

        {/* Action 1: Bulk Upload */}
        <button
          onClick={() => {
            setShowBulkModal(true);
            setUploadStats(null);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-6 rounded-3xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 text-left"
        >
          <span className="text-3xl">📊</span>
          <div>
            <div className="font-extrabold text-lg">Bulk Upload</div>
            <div className="text-xs text-emerald-100 font-medium">Excel (.xlsx, .xls) file</div>
          </div>
        </button>

        {/* Action 2: Add Single Customer */}
        <button
          onClick={() => setShowSingleModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-6 rounded-3xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 text-left"
        >
          <span className="text-3xl">➕</span>
          <div>
            <div className="font-extrabold text-lg">Add Single Contact</div>
            <div className="text-xs text-blue-100 font-medium">Quick entry (Name & Phone)</div>
          </div>
        </button>
      </div>

      {/* Main Customers Table Container */}
      <div className="glass-modern p-8 rounded-[2.5rem] shadow-2xl border border-white/40">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name or phone..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/60 dark:bg-black/30 border border-green-200 dark:border-green-800 text-sm focus:border-green-500 outline-none transition text-green-950 dark:text-white"
            />
          </div>

          {/* Export to Excel */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={exportAllCustomersExcel}
              className="text-xs font-bold px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 transition-colors flex items-center gap-2 border border-emerald-200 dark:border-emerald-800"
              title="Download customer database as Excel workbook (.xlsx)"
            >
              <span>📊</span> Export to Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-green-100 dark:border-green-900/40">
          <table className="w-full text-left text-sm text-green-950 dark:text-gray-200">
            <thead className="bg-green-100/70 dark:bg-green-900/40 text-xs font-bold uppercase tracking-wider text-green-900 dark:text-green-300">
              <tr>
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">WhatsApp Phone</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Added On</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100/50 dark:divide-green-900/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 font-medium">
                    Loading customer contacts...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-2">👥</div>
                    <div className="font-bold text-base text-gray-700 dark:text-gray-300">
                      {search ? "No matching contacts found" : "No customers stored yet"}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Use the <strong>Bulk Upload</strong> button above to import your customer list from an Excel (.xlsx) file.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, index) => (
                  <tr
                    key={c.id}
                    className="hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <td className="py-4 px-6 text-gray-400 text-xs">{index + 1}</td>
                    <td className="py-4 px-6 font-bold text-green-950 dark:text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 flex items-center justify-center text-xs font-extrabold shadow-sm">
                        {(c.name || "C").charAt(0).toUpperCase()}
                      </span>
                      {c.name || "Valued Customer"}
                    </td>
                    <td className="py-4 px-6 font-semibold tracking-wide">
                      <a
                        href={`https://wa.me/${c.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] hover:underline flex items-center gap-1.5 font-mono"
                        title="Chat on WhatsApp"
                      >
                        <span>💬</span> +{c.phone}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteCustomer(c.id, c.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 p-2 rounded-xl transition-colors text-xs font-bold"
                        title="Remove contact"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= BULK UPLOAD MODAL ================= */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-white/20 p-8 my-8 relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-2xl font-extrabold text-green-950 dark:text-white flex items-center gap-2">
                  <span>📊</span> Bulk Upload Customers (Excel)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload an Excel spreadsheet (.xlsx, .xls) with customer names and WhatsApp phone numbers.
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Upload Method Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setBulkTab("file")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  bulkTab === "file"
                    ? "bg-white dark:bg-neutral-700 text-green-800 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                📊 Upload Excel File (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setBulkTab("paste")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  bulkTab === "paste"
                    ? "bg-white dark:bg-neutral-700 text-green-800 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                📋 Copy & Paste List
              </button>
            </div>

            {/* Tab 1: Excel File Upload */}
            {bulkTab === "file" ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-3xl p-8 text-center bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 transition-colors">
                  <input
                    type="file"
                    id="excelFileInput"
                    accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="excelFileInput"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-5xl">📊</span>
                    <span className="font-extrabold text-green-950 dark:text-white text-base">
                      {fileName ? fileName : "Click to select Excel file (.xlsx, .xls), or drag and drop"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Requires columns: <strong>Name</strong> and <strong>Phone</strong> (no email required)
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 pt-1 gap-2">
                  <span>Need an formatted template with mock sample data?</span>
                  <button
                    type="button"
                    onClick={downloadSampleExcel}
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800"
                  >
                    <span>📥</span> Download Excel Template (.xlsx)
                  </button>
                </div>
              </div>
            ) : (
              /* Tab 2: Paste List */
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Paste contacts below (Format: <code>Name, Phone</code> or just <code>Phone</code> per line):
                </label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={handlePasteChange}
                  placeholder={`Ramesh Kumar, 9876543210\nSuresh Patel, 9845612345\nKavitha Selvam, 9688226761`}
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm font-mono focus:border-green-500 outline-none text-green-950 dark:text-white"
                ></textarea>
                <p className="text-xs text-gray-400">
                  Each line can be <code>Name, Phone</code> or just a list of 10-digit mobile numbers.
                </p>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="mt-6 border-t border-gray-100 dark:border-neutral-800 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold text-sm text-green-950 dark:text-white">
                    Preview: {parsedRows.length} contacts found in sheet
                  </div>
                  <div className="flex gap-2 text-xs font-bold">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                      ✓ {parsedRows.filter((r) => r.isValid).length} Valid
                    </span>
                    {parsedRows.filter((r) => !r.isValid).length > 0 && (
                      <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
                        ✕ {parsedRows.filter((r) => !r.isValid).length} Invalid
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-neutral-800 rounded-2xl text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5 pl-4">#</th>
                        <th className="p-2.5">Customer Name</th>
                        <th className="p-2.5">Formatted WhatsApp Phone</th>
                        <th className="p-2.5">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                      {parsedRows.slice(0, 50).map((r, i) => (
                        <tr key={r.id} className={r.isValid ? "" : "bg-red-50/50 dark:bg-red-950/20"}>
                          <td className="p-2.5 pl-4 text-gray-400 font-mono">{i + 1}</td>
                          <td className="p-2.5 font-semibold text-green-950 dark:text-white">
                            {r.name}
                          </td>
                          <td className="p-2.5 font-mono text-[#25D366] font-bold">+{r.phone}</td>
                          <td className="p-2.5">
                            {r.isValid ? (
                              <span className="text-emerald-600 font-bold">✓ Ready to Import</span>
                            ) : (
                              <span className="text-red-500 font-bold">{r.reason}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 50 && (
                    <div className="p-2 text-center text-gray-400 text-xs bg-gray-50 dark:bg-neutral-800/50">
                      ...and {parsedRows.length - 50} more contacts
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Banner */}
            {uploadStats && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-sm">
                <div className="font-extrabold flex items-center gap-2 mb-1">
                  <span>🎉</span> Bulk Upload Successful!
                </div>
                <div className="text-xs font-medium space-y-0.5">
                  <div>• <strong>{uploadStats.inserted}</strong> new customers added to database.</div>
                  <div>• <strong>{uploadStats.updated}</strong> existing customers updated.</div>
                  {uploadStats.skipped > 0 && (
                    <div>• <strong>{uploadStats.skipped}</strong> invalid contacts skipped.</div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-neutral-800 pt-4">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-3 rounded-2xl text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isUploading || parsedRows.filter((r) => r.isValid).length === 0}
                onClick={handleConfirmBulkUpload}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-extrabold text-sm shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin">⏳</span> Processing Excel Data...
                  </>
                ) : (
                  <>
                    <span>💾</span> Save {parsedRows.filter((r) => r.isValid).length} Contacts to Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD SINGLE CUSTOMER MODAL ================= */}
      {showSingleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 p-8 relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-neutral-800 pb-3">
              <h3 className="text-xl font-extrabold text-green-950 dark:text-white flex items-center gap-2">
                <span>➕</span> Add Customer
              </h3>
              <button
                onClick={() => setShowSingleModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSingle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm focus:border-green-500 outline-none text-green-950 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">
                  WhatsApp Phone Number *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    placeholder="9876543210"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm focus:border-green-500 outline-none text-green-950 dark:text-white font-bold"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1 ml-1">
                  Enter 10-digit mobile number.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSingle}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isSavingSingle ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
