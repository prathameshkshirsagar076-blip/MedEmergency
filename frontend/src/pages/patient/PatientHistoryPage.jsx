import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import ListRow from '../../components/ui/ListRow';
import EmptyState from '../../components/ui/EmptyState';
import { History, ArrowRight } from 'lucide-react';

export default function PatientHistoryPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests/my-requests')
      .then((res) => {
        if (res.data.success) {
          setRequests(res.data.requests);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      
      <div className="flex items-center justify-between pb-6 hairline-b border-[#D2D2D7] dark:border-[#333336]">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            My Requests
          </h1>
          <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-1">
            Track and review all your prescription broadcasts.
          </p>
        </div>

        <Link to="/upload">
          <Button variant="accent" size="sm">
            New Search
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={History}
            headline="No requests yet"
            description="When you upload a prescription, your tracking details and matches will appear here."
            actionLabel="Upload Prescription"
            onAction={() => window.location.href = '/upload'}
          />
        ) : (
          <div className="divide-y divide-[#D2D2D7] dark:divide-[#333336]">
            {requests.map((req) => (
              <ListRow
                key={req.id}
                onClick={() => window.location.href = req.status === 'matched' ? `/request/${req.id}/match-found` : `/request/${req.id}/broadcast`}
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                        Request #{req.id}
                      </span>
                      {req.is_emergency && (
                        <span className="text-[11px] text-[#FF3B30] font-medium">
                          Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E6E73] dark:text-[#86868B]">
                      {req.prescription?.medicines?.map(m => m.custom_name).join(', ') || 'Medications'}
                    </p>
                    <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] tabular-nums block">
                      {new Date(req.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className={`capitalize font-medium ${req.status === 'matched' ? 'text-[#34C759]' : 'text-[#6E6E73] dark:text-[#86868B]'}`}>
                      {req.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#6E6E73]" />
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
