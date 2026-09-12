import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import SegmentedControl from '../../components/ui/SegmentedControl';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('stores');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, storesRes, requestsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/stores'),
        api.get('/admin/requests'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (storesRes.data.success) setStores(storesRes.data.stores);
      if (requestsRes.data.success) setRequests(requestsRes.data.requests);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storeId, isApproved) => {
    setActionLoading(storeId);
    try {
      const res = await api.put(`/stores/${storeId}/approve`, { is_approved: isApproved });
      if (res.data.success) {
        setStores((prev) =>
          prev.map((s) => (s.id === storeId ? { ...s, is_approved: isApproved } : s))
        );
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (storeId) => {
    setActionLoading(storeId);
    try {
      const res = await api.put(`/stores/${storeId}/toggle-active`);
      if (res.data.success) {
        setStores((prev) =>
          prev.map((s) => (s.id === storeId ? { ...s, is_active: res.data.store.is_active } : s))
        );
      }
    } catch (err) {
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
          Admin Console
        </h1>
        <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-1">
          Pharmacy license approvals and real-time network monitoring.
        </p>
      </div>

      {/* Apple Settings Overview Numbers */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10 hairline-b border-[#D2D2D7] dark:border-[#333336] mb-8">
          <div>
            <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider block">
              Pharmacies
            </span>
            <span className="text-3xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums mt-1 block">
              {stats.totalStores}
            </span>
            <span className="text-xs text-[#0071E3] dark:text-[#2997FF] tabular-nums">
              {stats.pendingStoreApprovals} pending
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider block">
              Emergencies
            </span>
            <span className="text-3xl font-semibold text-[#FF3B30] tabular-nums mt-1 block">
              {stats.emergencyRequests}
            </span>
            <span className="text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
              {stats.totalRequests} total
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider block">
              Matches Found
            </span>
            <span className="text-3xl font-semibold text-[#34C759] tabular-nums mt-1 block">
              {stats.matchedRequests}
            </span>
            <span className="text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
              {stats.resolvedRequests} resolved
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider block">
              Catalog
            </span>
            <span className="text-3xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums mt-1 block">
              {stats.totalMedicines}
            </span>
            <span className="text-xs text-[#6E6E73] dark:text-[#86868B]">
              master drugs
            </span>
          </div>
        </div>
      )}

      {/* Segmented Selector */}
      <div className="mb-8">
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'stores', label: `Pharmacies (${stores.length})` },
            { value: 'requests', label: `Live Broadcasts (${requests.length})` },
          ]}
        />
      </div>

      {/* Apple System Preferences Style Direct Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'stores' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="hairline-b border-[#D2D2D7] dark:border-[#333336] text-[#6E6E73] dark:text-[#86868B] text-xs font-medium">
                <th className="py-3 px-2">Store Details</th>
                <th className="py-3 px-2">License #</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D2D2D7] dark:divide-[#333336]">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-[#F5F5F7] dark:hover:bg-[#1D1D1F] transition-colors">
                  <td className="py-4 px-2">
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                      {store.store_name}
                    </span>
                    <span className="text-xs text-[#6E6E73] dark:text-[#86868B]">
                      {store.address}
                    </span>
                  </td>
                  <td className="py-4 px-2 tabular-nums text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {store.license_number}
                  </td>
                  <td className="py-4 px-2 text-xs">
                    <span className={`font-medium ${store.is_approved ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                      {store.is_approved ? 'Approved' : 'Pending Verification'}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right space-x-3">
                    {!store.is_approved ? (
                      <Button
                        variant="accent"
                        size="sm"
                        loading={actionLoading === store.id}
                        onClick={() => handleApprove(store.id, true)}
                      >
                        Approve
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={actionLoading === store.id}
                        onClick={() => handleApprove(store.id, false)}
                      >
                        Revoke
                      </Button>
                    )}

                    <Button
                      variant="text"
                      size="sm"
                      loading={actionLoading === store.id}
                      onClick={() => handleToggleActive(store.id)}
                    >
                      {store.is_active ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="hairline-b border-[#D2D2D7] dark:border-[#333336] text-[#6E6E73] dark:text-[#86868B] text-xs font-medium">
                <th className="py-3 px-2">Request</th>
                <th className="py-3 px-2">Patient</th>
                <th className="py-3 px-2">Radius</th>
                <th className="py-3 px-2">Matched Store</th>
                <th className="py-3 px-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D2D2D7] dark:divide-[#333336]">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F5F5F7] dark:hover:bg-[#1D1D1F] transition-colors">
                  <td className="py-4 px-2">
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                      #{req.id}
                    </span>
                    {req.is_emergency && (
                      <span className="text-xs text-[#FF3B30] ml-2 font-medium">
                        Emergency
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
                      {req.patient?.name}
                    </span>
                    <span className="text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
                      {req.patient?.phone}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-xs tabular-nums text-[#6E6E73] dark:text-[#86868B]">
                    {req.search_radius_km} km
                  </td>
                  <td className="py-4 px-2 text-xs">
                    {req.matched_store ? (
                      <span className="text-[#34C759] font-medium">
                        {req.matched_store.store_name}
                      </span>
                    ) : (
                      <span className="text-[#6E6E73] dark:text-[#86868B]">Searching...</span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right text-xs text-[#6E6E73] dark:text-[#86868B] tabular-nums">
                    {new Date(req.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
