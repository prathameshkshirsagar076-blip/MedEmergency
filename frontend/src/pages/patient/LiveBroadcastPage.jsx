import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import PulseCircle from '../../components/ui/PulseCircle';
import Button from '../../components/ui/Button';
import { sound } from '../../utils/audio';

export default function LiveBroadcastPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [request, setRequest] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5.0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [expanding, setExpanding] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await api.get(`/requests/${id}`);
        if (res.data.success) {
          const reqData = res.data.request;
          setRequest(reqData);
          setRadiusKm(reqData.search_radius_km || 5.0);

          if (reqData.status === 'matched') {
            navigate(`/request/${id}/match-found`, { state: { request: reqData } });
          }
        }
      } catch (err) {}
    };

    fetchRequest();

    if (socket) {
      socket.emit('join_request_room', id);
    }
  }, [id, socket]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (payload) => {
      sound.playMatchFound();
      navigate(`/request/${id}/match-found`, { state: { matchData: payload } });
    };

    const handleStatusChange = (statusChange) => {
      if (statusChange.new_radius_km) {
        setRadiusKm(statusChange.new_radius_km);
      }
    };

    socket.on('request_matched', handleMatchFound);
    socket.on('request_status_change', handleStatusChange);

    return () => {
      socket.off('request_matched', handleMatchFound);
      socket.off('request_status_change', handleStatusChange);
    };
  }, [socket, id, navigate]);

  const handleManualExpand = async () => {
    setExpanding(true);
    try {
      const res = await api.put(`/requests/${id}/expand-radius`);
      if (res.data.success) {
        setRadiusKm(res.data.search_radius_km);
      }
    } catch (err) {}
    finally {
      setExpanding(false);
    }
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-md w-full">
        
        {/* Signature Apple-Style Concentric Pulse */}
        <PulseCircle isEmergency={request?.is_emergency} />

        {/* Confident Live Status Text */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
          Broadcasting within <span className="tabular-nums font-semibold">{radiusKm} km</span>
        </h1>

        <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-2">
          We'll connect you the moment a store confirms.
        </p>

        {/* Tabular Elapsed Time */}
        <div className="mt-8 font-normal text-xs text-[#6E6E73] dark:text-[#86868B]">
          Elapsed time: <span className="tabular-nums font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{formatTime(secondsElapsed)}</span>
        </div>

        {/* Expand Radius Affordance */}
        {radiusKm < 15 && (
          <div className="mt-6">
            <Button
              variant="secondary"
              size="sm"
              loading={expanding}
              onClick={handleManualExpand}
            >
              Expand to 10 km
            </Button>
          </div>
        )}

        {/* Subtle Cancel Link */}
        <div className="mt-12">
          <Link
            to="/patient/history"
            className="text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
          >
            Cancel and view my requests
          </Link>
        </div>

      </div>
    </div>
  );
}
