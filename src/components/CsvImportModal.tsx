import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCsv: (csvText: string) => { imported: number; errors: string[] };
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportCsv,
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const sampleCsv = `Symbol,Quantity,Buy Price,Purchase Date,Sector\nRELIANCE,25,2450.00,2025-02-15,Oil & Gas\nTCS,15,4050.00,2025-03-01,IT\nHDFCBANK,40,1620.00,2025-01-20,Banking`;

  const handleImport = () => {
    if (!csvContent.trim()) return;
    const res = onImportCsv(csvContent);
    setImportResult(res);
    if (res.imported > 0 && res.errors.length === 0) {
      setTimeout(() => {
        onClose();
        setImportResult(null);
        setCsvContent('');
      }, 1500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setCsvContent(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-xs font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Import Portfolio Holdings from CSV</span>
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          Upload a CSV or paste your spreadsheet data with headers: <code>Symbol, Quantity, Buy Price</code>.
        </p>

        {importResult && (
          <div
            className={`my-3 p-3 rounded-lg border text-xs ${
              importResult.errors.length > 0
                ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            }`}
          >
            <div className="font-semibold">
              Imported {importResult.imported} position{importResult.imported === 1 ? '' : 's'}.
            </div>
            {importResult.errors.length > 0 && (
              <ul className="mt-1 list-disc list-inside text-[11px] text-rose-300">
                {importResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Upload File</span>
            <button
              type="button"
              onClick={() => setCsvContent(sampleCsv)}
              className="text-emerald-400 text-[11px] hover:underline"
            >
              Load Sample Template
            </button>
          </div>

          <label className="border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950/60 transition-colors">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-slate-300 block font-medium">Click to upload CSV</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Supports exports from Zerodha, Groww, AngelOne</span>
          </label>

          <div className="flex flex-col gap-1 mt-1">
            <label className="text-slate-300 font-medium">Or Paste CSV Text</label>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Symbol,Quantity,Buy Price..."
              className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!csvContent.trim()}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold transition-colors"
            >
              Import Holdings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
