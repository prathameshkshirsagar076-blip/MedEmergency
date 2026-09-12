import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { getCurrentLocation } from '../../utils/geo';
import { X, Plus, Search, Check, Info, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import ListRow from '../../components/ui/ListRow';

export default function OcrReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [prescription, setPrescription] = useState(location.state?.prescription || null);
  const [medicines, setMedicines] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(location.state?.provider || 'gemini_vision');
  const [activeNoteIdx, setActiveNoteIdx] = useState(null);

  const formatConfidence = (conf, level) => {
    if (level && ['high', 'medium', 'low'].includes(String(level).toLowerCase())) {
      return String(level).toLowerCase();
    }
    const num = parseFloat(conf);
    if (!isNaN(num)) {
      if (num >= 0.8 || num >= 80) return 'high';
      if (num >= 0.5 || num >= 50) return 'medium';
      return 'low';
    }
    return 'high';
  };

  const getConfidenceBadge = (level) => {
    switch (level) {
      case 'high':
        return {
          dotClass: 'bg-[#34C759]',
          textClass: 'text-[#34C759]',
          label: 'High',
        };
      case 'medium':
        return {
          dotClass: 'bg-[#FF9500]',
          textClass: 'text-[#FF9500]',
          label: 'Medium',
        };
      case 'low':
      default:
        return {
          dotClass: 'bg-[#FF3B30]',
          textClass: 'text-[#FF3B30]',
          label: 'Low',
        };
    }
  };

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await api.get(`/prescriptions/${id}`);
        if (res.data.success) {
          const rx = res.data.prescription;
          setPrescription(rx);
          if (rx.medicines && rx.medicines.length > 0) {
            setMedicines(rx.medicines.map((m) => ({
              id: m.id,
              name: m.custom_name,
              medicine_id: m.medicine_id,
              dosage: m.dosage_instruction || '',
              confidence: m.confidence || 1.0,
              confidence_level: formatConfidence(m.confidence, m.confidence_level),
              notes: m.notes || null,
              is_selected: m.is_selected !== false,
            })));
          }
        }
      } catch (err) {
        setError('Unable to load prescription review.');
      }
    };

    if (location.state?.prescription) {
      setPrescription(location.state.prescription);
      const rxMeds = location.state.prescription.medicines || [];
      setMedicines(rxMeds.map((m) => ({
        id: m.id,
        name: m.name || m.custom_name,
        medicine_id: m.medicine_id,
        dosage: m.dosage || m.dosage_instruction || '',
        confidence: m.confidence || 1.0,
        confidence_level: formatConfidence(m.confidence, m.confidence_level),
        notes: m.notes || null,
        is_selected: m.is_selected !== false,
      })));
    } else {
      fetchPrescription();
    }
  }, [id]);

  const handleRescanAI = async () => {
    setRescanning(true);
    setError('');
    try {
      const res = await api.post(`/prescriptions/${id}/extract`);
      if (res.data.success) {
        setProvider('gemini_vision');
        const rxMeds = res.data.medicines || [];
        setMedicines(rxMeds.map((m) => ({
          id: m.id,
          name: m.name || m.custom_name,
          medicine_id: m.medicine_id,
          dosage: m.dosage || m.dosage_instruction || '',
          confidence: m.confidence || 1.0,
          confidence_level: formatConfidence(m.confidence, m.confidence_level),
          notes: m.notes || null,
          is_selected: m.is_selected !== false,
        })));
      } else {
        setError(res.data.message || 'AI Rescan failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to re-scan with AI Vision.');
    } finally {
      setRescanning(false);
    }
  };

  const handleSearchMedicine = async (query) => {
    setNewMedName(query);
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    try {
      const res = await api.get(`/medicines/search?q=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setSearchSuggestions(res.data.medicines);
      }
    } catch (e) {}
  };

  const handleAddMedicine = (medObj) => {
    const nameToAdd = typeof medObj === 'string' ? medObj.trim() : medObj.name;
    const medIdToAdd = typeof medObj === 'object' ? medObj.id : null;

    if (!nameToAdd) return;
    if (medicines.some((m) => m.name.toLowerCase() === nameToAdd.toLowerCase())) {
      setNewMedName('');
      setSearchSuggestions([]);
      return;
    }

    setMedicines([
      ...medicines,
      {
        name: nameToAdd,
        medicine_id: medIdToAdd,
        dosage: '',
        confidence: 1.0,
        confidence_level: 'high',
        notes: null,
        is_selected: true,
      },
    ]);

    setNewMedName('');
    setSearchSuggestions([]);
  };

  const handleRemove = (index) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleToggle = (index) => {
    setMedicines(medicines.map((m, idx) => (idx === index ? { ...m, is_selected: !m.is_selected } : m)));
  };

  const handleConfirmAndSearch = async () => {
    const selectedMeds = medicines.filter((m) => m.is_selected);
    if (selectedMeds.length === 0) {
      setError('Please select or add at least one medication to search.');
      return;
    }

    setBroadcasting(true);
    setError('');

    try {
      await api.put(`/prescriptions/${id}/medicines`, {
        medicines: selectedMeds.map((m) => ({
          name: m.name,
          medicine_id: m.medicine_id,
          dosage: m.dosage,
          dosage_instruction: m.dosage,
          confidence_level: m.confidence_level,
          notes: m.notes,
          is_selected: m.is_selected,
        })),
      });

      const coords = await getCurrentLocation();

      const requestRes = await api.post('/requests/create', {
        prescription_id: id,
        is_emergency: prescription?.is_emergency ?? true,
        patient_lat: coords.latitude,
        patient_lng: coords.longitude,
        medicines: selectedMeds,
      });

      if (requestRes.data.success) {
        navigate(`/request/${requestRes.data.request.id}/broadcast`);
      } else {
        setError(requestRes.data.message || 'Failed to broadcast request.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch broadcast.');
    } finally {
      setBroadcasting(false);
    }
  };

  const selectedCount = medicines.filter((m) => m.is_selected).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
      
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#2997FF] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini Vision AI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            Review Extracted Medications
          </h1>
          <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
            Doctor's handwriting interpreted with contextual AI. Adjust or add items before broadcasting.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRescanAI}
          disabled={rescanning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#F5F5F7] dark:bg-[#1D1D1F] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#333336] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${rescanning ? 'animate-spin text-[#0071E3]' : ''}`} />
          <span>{rescanning ? 'Re-scanning...' : 'Re-scan with AI Vision'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-[14px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two-Pane Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Pane: Prescription Image */}
        <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#2C2C2E]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B]">
              Original Prescription
            </span>
            <span className="text-[11px] font-mono text-[#0071E3] dark:text-[#2997FF]">
              {prescription?.status?.toUpperCase()}
            </span>
          </div>

          {prescription?.image_path ? (
            <img
              src={`http://localhost:5000/${prescription.image_path}`}
              alt="Prescription"
              className="w-full max-h-96 object-contain rounded-[12px] bg-white dark:bg-black shadow-sm"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-[#6E6E73]">
              Image loaded
            </div>
          )}
        </div>

        {/* Right Pane: Clean List of Extracted Items */}
        <div>
          <div className="flex items-center justify-between pb-3 hairline-b border-[#D2D2D7] dark:border-[#333336] mb-2">
            <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider">
              Identified Medicine
            </span>
            <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider">
              AI Confidence
            </span>
          </div>

          {medicines.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6E6E73] dark:text-[#86868B]">
              No medicines detected in image. Please add manually below.
            </div>
          ) : (
            <div className="divide-y divide-[#D2D2D7] dark:divide-[#333336]">
              {medicines.map((med, idx) => {
                const badge = getConfidenceBadge(med.confidence_level);
                return (
                  <ListRow key={idx}>
                    <div className="flex items-center justify-between w-full py-1">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(idx)}
                          className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                            med.is_selected ? 'bg-[#0071E3] text-white' : 'border border-[#D2D2D7] dark:border-[#333336]'
                          }`}
                        >
                          {med.is_selected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-base ${med.is_selected ? 'text-[#1D1D1F] dark:text-[#F5F5F7] font-medium' : 'text-[#6E6E73] line-through'}`}>
                              {med.name}
                            </span>

                            {med.notes && (
                              <div className="relative inline-block">
                                <button
                                  type="button"
                                  onClick={() => setActiveNoteIdx(activeNoteIdx === idx ? null : idx)}
                                  className="text-[#0071E3] dark:text-[#2997FF] hover:opacity-80 p-0.5"
                                  title="View AI Observation"
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                                {activeNoteIdx === idx && (
                                  <div className="absolute left-0 top-full mt-1 z-30 w-64 p-3 rounded-[12px] bg-white dark:bg-[#2C2C2E] shadow-xl border border-[#D2D2D7] dark:border-[#3E3E42] text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                                    <div className="font-semibold text-[#0071E3] mb-1">AI Observation:</div>
                                    <p>{med.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {med.dosage && (
                            <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                              Dosage: <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{med.dosage}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`w-2 h-2 rounded-full ${badge.dotClass}`} />
                          <span className={`font-medium capitalize ${badge.textClass}`}>
                            {badge.label}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(idx)}
                          className="text-[#6E6E73] hover:text-[#FF3B30] p-1 transition-colors"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </ListRow>
                );
              })}
            </div>
          )}

          {/* Add Medicine Autocomplete */}
          <div className="mt-8 relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMedName}
                onChange={(e) => handleSearchMedicine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMedicine(newMedName);
                  }
                }}
                placeholder="+ Add or edit another medicine..."
                className="w-full bg-[#F5F5F7] dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-[#F5F5F7] text-sm rounded-[14px] px-4 py-2.5 border border-[#E5E5EA] dark:border-[#2C2C2E] focus:ring-1 focus:ring-[#0071E3]"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAddMedicine(newMedName)}
                disabled={!newMedName.trim()}
              >
                Add
              </Button>
            </div>

            {searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#1D1D1F] rounded-[14px] shadow-apple-card border border-[#D2D2D7] dark:border-[#333336] overflow-hidden z-20 divide-y divide-[#D2D2D7] dark:divide-[#333336]">
                {searchSuggestions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleAddMedicine(s)}
                    className="p-3 text-sm hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{s.name}</span>
                    <span className="text-xs text-[#6E6E73] dark:text-[#86868B]">{s.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="mt-10">
            <Button
              variant={prescription?.is_emergency ? 'emergency' : 'accent'}
              size="lg"
              fullWidth
              loading={broadcasting}
              disabled={selectedCount === 0}
              onClick={handleConfirmAndSearch}
              className="py-4 text-base"
            >
              {broadcasting ? 'Broadcasting Emergency Radar...' : `Confirm & Search Nearby Stores (${selectedCount})`}
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
}
