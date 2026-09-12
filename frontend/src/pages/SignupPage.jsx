import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentLocation } from '../utils/geo';
import { HeartPulse, ArrowLeft, AlertCircle, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SegmentedControl from '../components/ui/SegmentedControl';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'store' ? 'store' : 'patient';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Pharmacy specific
  const [storeName, setStoreName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(18.5204);
  const [longitude, setLongitude] = useState(73.8567);
  const [operatingHours, setOperatingHours] = useState('24 Hours / 7 Days');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'store') {
      handleAutoDetectLocation();
    }
  }, [role]);

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
    } catch (e) {
      console.warn(e);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
      };

      if (role === 'store') {
        payload.store_name = storeName;
        payload.license_number = licenseNumber;
        payload.address = address;
        payload.latitude = latitude;
        payload.longitude = longitude;
        payload.operating_hours = operatingHours;
      }

      const res = await signup(payload);
      if (res.success) {
        if (role === 'store') {
          navigate('/store/dashboard');
        } else {
          navigate('/upload');
        }
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
      
      {/* Top Back Link */}
      <div className="w-full max-w-[460px] mb-4 flex justify-start">
        <Link
          to="/select-role"
          className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to role selection</span>
        </Link>
      </div>

      {/* Main Elevated Card Container */}
      <div className="w-full max-w-[460px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-[24px] sm:rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-7 sm:p-10 text-center transition-all duration-200">
        
        {/* Glowing Heart Icon */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071E3]/20 to-[#0071E3]/5 text-[#0071E3] dark:text-[#2997FF] shadow-sm mb-6 mx-auto ring-1 ring-[#0071E3]/20">
          <div className="absolute inset-0 bg-[#0071E3]/15 blur-xl rounded-full" />
          <HeartPulse className="w-7 h-7 relative z-10" />
        </div>

        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            Create your account.
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
            Join the emergency medicine dispatch network.
          </p>
        </div>

        {/* Apple-Settings Segmented Pill Control */}
        <div className="mt-6 flex justify-center">
          <SegmentedControl
            value={role}
            onChange={setRole}
            options={[
              { value: 'patient', label: 'Patient' },
              { value: 'store', label: 'Pharmacy' },
            ]}
          />
        </div>

        {error && (
          <div className="mt-5 p-3.5 rounded-r-[14px] bg-[#FF3B30]/5 border-l-4 border-l-[#FF3B30] text-[#FF3B30] text-xs text-left flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 stroke-[2]" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4 text-left animate-fade-in">
          
          <Input
            label={role === 'store' ? 'Pharmacist / Contact Person' : 'Full Name'}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone Number"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {role === 'store' && (
            <div className="pt-2 space-y-4">
              <Input
                label="Store / Pharmacy Name"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />

              <Input
                label="Drug License Number"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />

              <Input
                label="Physical Address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="flex items-center justify-between text-xs text-[#6E6E73] dark:text-[#86868B] pt-1">
                <span>GPS: <span className="tabular-nums font-mono">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span></span>
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  disabled={detectingLocation}
                  className="text-[#0071E3] dark:text-[#2997FF] hover:underline font-semibold"
                >
                  {detectingLocation ? 'Locating...' : 'Auto-detect'}
                </button>
              </div>
            </div>
          )}

          <div className="pt-3">
            <Button
              type="submit"
              variant="accent"
              fullWidth
              loading={loading}
              className="py-3.5"
            >
              {role === 'store' ? 'Register Pharmacy' : 'Continue'}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-xs text-[#6E6E73] dark:text-[#86868B]">
          Already have an account?{' '}
          <Link to="/patient/login" className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
