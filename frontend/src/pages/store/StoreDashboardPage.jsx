import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import ListRow from '../../components/ui/ListRow';
import EmptyState from '../../components/ui/EmptyState';
import { Inbox } from 'lucide-react';

export default function StoreDashboardPage() {
  const { user } = useAuth();
  const { incomingRequests, clearIncomingRequest } = useSocket();

  const [activeRequests, setActiveRequests] = useState([]);
  const [isOnline, setIsOnline] = useState(user?.store?.is_online ?? true);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);

  useEffect(() => {
    fetchStoreRequests();
  }, []);

  const fetchStoreRequests = async () => {
    try {
      const res = await api.get('/requests/store/active');
      if (res.data.success) {
        setActiveRequests(res.data.requests);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async (newStatus) => {
    try {
      const res = await api.put('/stores/status', { is_online: newStatus });
      if (res.data.success) {
        setIsOnline(newStatus);
      }
    } catch (err) {}
  };

  const handleRespond = async (requestId, responseType) => {
    setRespondingId(requestId);

    try {
      const res = await api.put(`/requests/${requestId}/respond`, {
        response: responseType,
      });

      if (res.data.success) {
        setActiveRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  my_response: responseType,
                  status: res.data.status,
                  is_matched_to_me: res.data.isFirstMatch,
                }
              : r
          )
        );

        clearIncomingRequest(requestId);
      }
    } catch (err) {
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      
      {/* Apple-style Page Header with Quiet Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 hairline-b border-[#D2D2D7] dark:border-[#333336]">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            {user?.store?.store_name || 'Emergency Feed'}
          </h1>
          <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-1 tabular-nums">
            License: {user?.store?.license_number} • {user?.store?.address}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            checked={isOnline}
            onChange={handleToggleOnline}
            label={isOnline ? 'Accepting Requests' : 'Offline'}
          />
        </div>
      </div>

      {/* List-Based Inbox Feed (Apple Mail Style) */}
      <div className="mt-8">
        <div className="flex items-center justify-between pb-3 hairline-b border-[#D2D2D7] dark:border-[#333336]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B]">
            Incoming Prescriptions ({activeRequests.length})
          </span>
          <span className="text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
            5–15 km zone
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeRequests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            headline="No incoming requests"
            description="When a patient within your radius broadcasts an emergency prescription, it will appear here."
          />
        ) : (
          <div className="divide-y divide-[#D2D2D7] dark:divide-[#333336]">
            {activeRequests.map((req) => (
              <ListRow key={req.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left info with small emergency dot */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {req.is_emergency && (
                        <span className="w-2 h-2 rounded-full bg-[#FF3B30] flex-shrink-0" />
                      )}
                      <span className={`text-base ${req.is_emergency ? 'font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]' : 'font-medium text-[#1D1D1F] dark:text-[#F5F5F7]'}`}>
                        Request #{req.id}
                      </span>
                      <span className="text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
                        {req.distance_km} km away
                      </span>
                    </div>

                    <p className="text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {req.prescription?.medicines?.map(m => m.custom_name).join(', ') || 'Prescription items'}
                    </p>

                    <div className="text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
                      Patient: {req.patient?.name || 'Patient'} • {new Date(req.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Right Actions: Two clean buttons */}
                  <div className="flex items-center gap-3">
                    {req.my_response ? (
                      <span className={`text-xs font-semibold uppercase tracking-wider ${req.my_response === 'available' ? 'text-[#34C759]' : 'text-[#6E6E73]'}`}>
                        {req.my_response === 'available' ? '✓ Available' : 'Declined'}
                      </span>
                    ) : req.status === 'matched' && !req.is_matched_to_me ? (
                      <span className="text-xs text-[#6E6E73] dark:text-[#86868B]">
                        Fulfilled by other store
                      </span>
                    ) : (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          loading={respondingId === req.id}
                          onClick={() => handleRespond(req.id, 'available')}
                        >
                          Available
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={respondingId === req.id}
                          onClick={() => handleRespond(req.id, 'not_available')}
                        >
                          Not Available
                        </Button>
                      </>
                    )}
                  </div>

                </div>
              </ListRow>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
