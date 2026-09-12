import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ListRow from '../../components/ui/ListRow';
import EmptyState from '../../components/ui/EmptyState';
import { History } from 'lucide-react';

export default function StoreHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests/store/history')
      .then((res) => {
        if (res.data.success) {
          setHistory(res.data.history);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      
      <h1 className="text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
        Response History
      </h1>
      <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-1">
        Log of all past emergency responses by your store.
      </p>

      <div className="mt-10">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={History}
            headline="No response history"
            description="When you respond to prescription requests, your activity is recorded here."
          />
        ) : (
          <div className="divide-y divide-[#D2D2D7] dark:divide-[#333336]">
            {history.map((item) => (
              <ListRow key={item.id}>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        Request #{item.request_id}
                      </span>
                      <span className={`text-xs capitalize font-medium ${item.response === 'available' ? 'text-[#34C759]' : 'text-[#6E6E73]'}`}>
                        {item.response}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                      {item.request?.prescription?.medicines?.map(m => m.custom_name).join(', ')}
                    </p>
                  </div>

                  <div className="text-right text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
                    {new Date(item.responded_at).toLocaleDateString()}
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
