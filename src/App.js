import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Imports the Excel reader engine

export default function App() {
  const [emailText, setEmailText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [emailCount, setEmailCount] = useState(0);
  const [emailsList, setEmailsList] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Loading & Popup states
  const [isSending, setIsSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Parse Excel File Rows
  const processExcelFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to array of rows
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Flatten rows and filter out valid email strings
      const foundEmails = jsonData
        .flat()
        .map(cell => String(cell).trim())
        .filter(cell => cell.includes('@') && cell.includes('.'));

      setEmailsList(foundEmails);
      setEmailCount(foundEmails.length); // Sets the exact dynamic count
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      processExcelFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  // Submit Bulk Campaign with Visual State Actions
  const handleSendCampaign = async () => {
    if (!emailText) return alert("Please enter email text context.");
    if (emailCount === 0) return alert("Please upload a valid Excel file containing emails first.");

    setIsSending(true); // Changes button text to "Sending..."

    try {
      // Send data to Express backend endpoint
      await axios.post('http://localhost:5000/api/campaigns', {
        title: "Excel Bulk Dispatch",
        subject: emailText.substring(0, 30),
        recipientCount: emailCount,
        category: "Technology"
      });

      // Simulation delay for user experience, then open successful notification modal
      setTimeout(() => {
        setIsSending(false);
        setShowPopup(true);
        setEmailText('');
        setSelectedFile(null);
        setEmailCount(0);
        setEmailsList([]);
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Failed to reach backend cluster repository.");
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col relative">
      
      {/* Dynamic Success Popup Modal Notification */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-emerald-500/30 p-6 rounded-xl max-w-sm w-full text-center shadow-2xl tracking-wide animate-fade-in">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100">Status Update</h3>
            <p className="text-slate-400 text-sm mt-2">The mails were sent successfully!</p>
            <button 
              onClick={() => setShowPopup(false)}
              className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded-lg transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header View */}
      <header className="bg-gradient-to-r from-violet-900 to-indigo-900 py-8 px-4 text-center shadow-xl border-b border-indigo-500/20">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">
          BulkMail
        </h1>
        <p className="text-indigo-200 text-sm mt-2 max-w-xl mx-auto font-medium">
          We can help your business with sending multiple emails at once
        </p>
      </header>

      <section className="bg-indigo-600 text-center py-3 font-semibold text-sm tracking-wide text-white uppercase shadow-md shadow-indigo-600/10">
        Drag and Drop Area Configuration
      </section>

      {/* Input Operations Interface */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center gap-6">
        
        <div className="relative bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-2xl">
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Enter the email text context here..."
            className="w-full h-44 bg-transparent text-slate-200 placeholder-slate-500 resize-none outline-none text-base leading-relaxed"
          />
        </div>

        {/* Drop Zone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition duration-200 ${
            isDragging ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-700 bg-slate-900/40'
          }`}
        >
          <label className="cursor-pointer inline-block">
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" />
            <span className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition text-slate-300">
              Choose File
            </span>
          </label>
          <p className="text-slate-400 text-sm mt-3 font-medium">
            {selectedFile ? `Active: ${selectedFile.name}` : "No file chosen"}
          </p>
        </div>

        {/* Dynamic Total Metrics Counter */}
        <div className="text-center font-mono text-sm tracking-wide text-slate-400 bg-slate-900/30 py-2 rounded-lg border border-slate-800/50">
          Total Emails in the file: <span className="text-cyan-400 font-bold">{emailCount}</span>
        </div>

        {/* Dispatch Trigger changing to 'Sending' Status State */}
        <button 
          onClick={handleSendCampaign}
          disabled={isSending}
          className={`w-full md:w-48 mx-auto text-white font-bold py-3.5 px-6 rounded-xl transition duration-150 shadow-xl text-center tracking-wide uppercase text-sm ${
            isSending 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'
          }`}
        >
          {isSending ? "Sending..." : "Send"}
        </button>

      </main>
    </div>
  );
}
