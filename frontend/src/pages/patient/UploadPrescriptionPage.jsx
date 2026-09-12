import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { Upload, ArrowRight, X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';

export default function UploadPrescriptionPage() {
  const location = useLocation();
  const initialEmergency = location.state?.isEmergency ?? true;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEmergency, setIsEmergency] = useState(initialEmergency);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processSelectedFile(selected);
    }
  };

  const processSelectedFile = (selectedFile) => {
    setFile(selectedFile);
    setError('');

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUseSample = (sampleType) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 400);

    ctx.fillStyle = '#1D1D1F';
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillText('EMERGENCY CLINICAL PRESCRIPTION', 40, 50);

    ctx.font = '13px -apple-system, sans-serif';
    ctx.fillStyle = '#6E6E73';
    ctx.fillText('Dr. R. Vance, MD (Lic: MD-88219)', 40, 75);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()} | Urgent Care`, 40, 95);

    ctx.strokeStyle = '#D2D2D7';
    ctx.beginPath();
    ctx.moveTo(40, 110);
    ctx.lineTo(560, 110);
    ctx.stroke();

    ctx.font = 'bold 26px serif';
    ctx.fillStyle = '#0071E3';
    ctx.fillText('Rx', 40, 150);

    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillStyle = '#1D1D1F';

    if (sampleType === 'anaphylaxis') {
      ctx.fillText('1. Epinephrine Auto-Injector (EpiPen) 0.3mg - Stat IM', 40, 190);
      ctx.fillText('2. Salbutamol Inhaler 100mcg - 2 puffs stat', 40, 230);
      ctx.fillText('3. Dexamethasone 4mg/ml - 1 ampule IM', 40, 270);
    } else if (sampleType === 'cardiac') {
      ctx.fillText('1. Nitroglycerin 0.4mg Sublingual - 1 tab SOS', 40, 190);
      ctx.fillText('2. Aspirin 325mg (Emergency Chewable) - 1 tab stat', 40, 230);
      ctx.fillText('3. Atorvastatin 20mg - 1 tab daily', 40, 270);
    } else {
      ctx.fillText('1. Augmentin 625 Duo - 1 tab BD x 5 days', 40, 190);
      ctx.fillText('2. Paracetamol 650mg (Dolo 650) - 1 tab TDS', 40, 230);
      ctx.fillText('3. Pantoprazole 40mg - 1 tab OD before breakfast', 40, 270);
    }

    canvas.toBlob((blob) => {
      const sampleFile = new File([blob], `sample_${sampleType}.png`, { type: 'image/png' });
      processSelectedFile(sampleFile);
    }, 'image/png');
  };

  const handleUploadAndScan = async () => {
    if (!file) {
      setError('Please select or drop a prescription image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('prescription', file);
      formData.append('is_emergency', isEmergency);

      const res = await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        navigate(`/prescription/${res.data.prescription.id}/review`, {
          state: {
            prescription: res.data.prescription,
            provider: res.data.provider,
          },
        });
      } else {
        setError(res.data.message || 'Failed to scan prescription.');
      }
    } catch (err) {
      console.error('Upload & scan error:', err);
      setError(err.response?.data?.message || 'Error processing prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center">
      
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#2997FF] text-xs font-semibold uppercase tracking-wider mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Medical AI Vision Extraction</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
        Upload Prescription
      </h1>
      <p className="text-sm sm:text-base text-[#6E6E73] dark:text-[#86868B] mt-2 max-w-md mx-auto">
        Drop a doctor's prescription photo or document. Medical AI Vision reads handwriting & extracts medicines.
      </p>

      {error && (
        <div className="mt-6 p-3.5 rounded-[14px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-xs max-w-md mx-auto text-left flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Simple Full-Bleed Dropzone */}
      <div className="mt-10 max-w-lg mx-auto">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border border-dashed rounded-[20px] p-10 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.28,0.11,0.32,1)]
            ${preview
              ? 'border-[#34C759] bg-[#F5F5F7] dark:bg-[#1D1D1F]'
              : 'border-[#D2D2D7] dark:border-[#333336] bg-white dark:bg-black hover:bg-[#F5F5F7] dark:hover:bg-[#1D1D1F]'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview ? (
            <div className="space-y-4 animate-fade-in">
              <img
                src={preview}
                alt="Prescription preview"
                className="max-h-72 mx-auto rounded-[12px] object-contain shadow-apple-card"
              />
              <p className="text-xs text-[#34C759] font-medium">
                {file?.name} ready for AI Vision extraction
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-8 h-8 text-[#6E6E73] dark:text-[#86868B] mx-auto stroke-1" />
              <p className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                Drop prescription photo here, or <span className="text-[#0071E3] dark:text-[#2997FF]">browse</span>
              </p>
              <p className="text-xs text-[#6E6E73] dark:text-[#86868B]">
                JPG, PNG, WEBP or PDF
              </p>
            </div>
          )}
        </div>

        {/* Emergency Priority Toggle */}
        <div className="mt-6 p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-[#1D1D1F] text-left">
          <Toggle
            checked={isEmergency}
            onChange={setIsEmergency}
            isEmergency={true}
            label="Mark as Emergency Request"
            description="Dispatches immediately with high priority sound alert to nearby pharmacies."
          />
        </div>

        {/* Primary Action Button */}
        <div className="mt-8">
          <Button
            variant={isEmergency ? 'emergency' : 'accent'}
            size="lg"
            fullWidth
            loading={loading}
            disabled={!file}
            onClick={handleUploadAndScan}
            className="py-4 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning with Medical AI Vision...
              </span>
            ) : (
              'Scan & Extract Medicines'
            )}
          </Button>
          {loading && (
            <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-2 animate-pulse">
              Interpreting doctor's handwriting & dosages...
            </p>
          )}
        </div>

        {/* 1-Click Samples */}
        <div className="mt-12 pt-8 hairline-t border-[#D2D2D7] dark:border-[#333336] text-center">
          <p className="text-[11px] font-medium text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider mb-3">
            Or test with a sample prescription
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleUseSample('anaphylaxis')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#1D1D1F] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              Anaphylaxis (EpiPen)
            </button>
            <button
              type="button"
              onClick={() => handleUseSample('cardiac')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#1D1D1F] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              Cardiac (Nitroglycerin)
            </button>
            <button
              type="button"
              onClick={() => handleUseSample('infection')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#1D1D1F] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              Infection (Augmentin)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
