import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { PhoneCall, Check, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import ListRow from '../../components/ui/ListRow';
import { sound } from '../../utils/audio';

export default function MatchFoundPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [request, setRequest] = useState(null);
  const [matchedStore, setMatchedStore] = useState(location.state?.matchData?.matchedStore || null);
  const [allAvailableStores, setAllAvailableStores] = useState(location.state?.matchData?.allAvailableStores || []);
  const [loading, setLoading] = useState(!matchedStore);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    sound.playMatchFound();

    const fetchDetails = async () => {
      try {
        const res = await api.get(`/requests/${id}`);
        if (res.data.success) {
          setRequest(res.data.request);
          if (res.data.request.matched_store) {
            setMatchedStore(res.data.request.matched_store);
          }
          if (res.data.request.responses) {
            const avail = res.data.request.responses
              .filter((r) => r.response === 'available')
              .map((r) => r.store);
            setAllAvailableStores(avail);
          }
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleMarkResolved = async () => {
    setResolving(true);
    try {
      await api.put(`/requests/${id}/resolve`);
      navigate('/patient/history');
    } catch (err) {
    } finally {
      setResolving(false);
    }
  };

  const primaryStore = matchedStore || allAvailableStores[0];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-lg w-full">
        
        {/* Simple Line-drawn Checkmark Motif */}
        <div className="w-16 h-16 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
          Medicine confirmed.
        </h1>

        {primaryStore && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {primaryStore.store_name}
            </h2>
            <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-1 tabular-nums">
              {primaryStore.distance_km} km away • {primaryStore.address}
            </p>

            {/* Huge Unmissable "Call Store Now" in System Red #FF3B30 */}
            <div className="mt-10">
              <a
                href={`tel:${primaryStore.phone || '+15559871001'}`}
                className="w-full inline-flex items-center justify-center font-semibold rounded-[18px] transition-all duration-200 ease-[cubic-bezier(0.28,0.11,0.32,1)] active:scale-[0.97] min-h-[56px] text-lg bg-[#FF3B30] hover:bg-[#E03228] active:bg-[#C9251C] text-white shadow-apple-subtle gap-2"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call Store Now ({primaryStore.phone || 'Direct Line'})</span>
              </a>
            </div>

            {/* Other Stores List (Hairline only) */}
            {allAvailableStores.length > 1 && (
              <div className="mt-14 pt-8 hairline-t border-[#D2D2D7] dark:border-[#333336] text-left">
                <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider block mb-2">
                  Other available stores
                </span>
                <div className="divide-y divide-[#D2D2D7] dark:divide-[#333336]">
                  {allAvailableStores
                    .filter((s) => s.id !== primaryStore.id)
                    .map((alt) => (
                      <ListRow key={alt.id}>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
                              {alt.store_name}
                            </span>
                            <span className="text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
                              {alt.distance_km} km • {alt.phone}
                            </span>
                          </div>
                          <a
                            href={`tel:${alt.phone}`}
                            className="text-xs font-medium text-[#0071E3] dark:text-[#2997FF] hover:underline"
                          >
                            Call
                          </a>
                        </div>
                      </ListRow>
                    ))}
                </div>
              </div>
            )}

            {/* Resolve Request Action */}
            <div className="mt-12">
              <Button
                variant="text"
                size="sm"
                loading={resolving}
                onClick={handleMarkResolved}
              >
                I have received the medicine (Mark resolved)
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
