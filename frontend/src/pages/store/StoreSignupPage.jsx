import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCurrentLocation } from '../../utils/geo';
import { Store, ShieldCheck, MapPin, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function StoreSignupPage() {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('24 Hours / 7 Days');
  
  // Geolocation
  const [latitude, setLatitude] = useState(18.5204);
  const [longitude, setLongitude] = useState(73.8567);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Auto-detect location on load
  useEffect(() => {
    handleAutoDetectLocation();
  }, []);

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
    } catch (e) {
      console.warn('Geolocation warning:', e);
    } finally {
      setDetectingLocation(false);
    }
  };

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasMatchingPassword = password && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters long and contain at least one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: ownerName,
        email,
        password,
        phone,
        role: 'store',
        store_name: storeName,
        license_number: licenseNumber,
        address,
        latitude,
        longitude,
        operating_hours: operatingHours,
      };

      const res = await signup(payload);
      if (res.success) {
        navigate('/store/pending-approval');
      } else {
        setError(res.message || 'Store registration failed.');
      }
    } catch (err) {
      console.error('Store signup error:', err);
      setError(err.response?.data?.message || 'Failed to submit pharmacy registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      
      {/* Top Back Link */}
      <div className="w-full max-w-[500px] mb-4 flex justify-start">
        <Link
          to="/select-role?role=store"
          className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to role selection</span>
        </Link>
      </div>

      {/* Main Elevated Card Container */}
      <div className="w-full max-w-[500px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-[24px] sm:rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-7 sm:p-10 text-center transition-all duration-200">
        
        {/* Crafted Store Icon with Glowing Badge */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50/80 dark:bg-emerald-900/30 text-[#34C759] dark:text-[#30D158] shadow-sm mb-6 mx-auto ring-1 ring-[#34C759]/20">
          <div className="absolute inset-0 bg-[#34C759]/15 blur-xl rounded-full" />
          <Store className="w-7 h-7 relative z-10" />
        </div>

        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            Register Your Pharmacy
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
            Join the emergency dispatch network. Account activation requires license review.
          </p>
        </div>

        {error && (
          <div className="mt-5 p-3.5 rounded-r-[14px] bg-[#FF3B30]/5 border-l-4 border-l-[#FF3B30] text-[#FF3B30] text-xs text-left flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 stroke-[2]" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4 text-left animate-fade-in">
          
          <Input
            label="Pharmacy / Store Name"
            placeholder="e.g. Apollo 24/7 Chemist"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />

          <Input
            label="Owner / Pharmacist Name"
            placeholder="e.g. Dr. Rajesh Sharma"
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="store@pharmacy.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Contact Phone"
              type="tel"
              placeholder="+91 98765 43210"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="Drug License Number"
            placeholder="e.g. MH-PUN-2026-98124"
            required
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />

          <Input
            label="Physical Store Address"
            placeholder="Shop 12, Main Road, Near Hospital"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* GPS Coordinates Section */}
          <div className="p-3.5 rounded-[14px] bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#3E3E42] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#86868B]">
              <span className="flex items-center gap-1 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                <MapPin className="w-3.5 h-3.5 text-[#0071E3]" /> GPS Location for Radar Dispatch
              </span>
              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={detectingLocation}
                className="text-[#0071E3] dark:text-[#2997FF] hover:underline font-semibold"
              >
                {detectingLocation ? 'Locating...' : 'Auto Detect'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <label className="text-[#6E6E73] dark:text-[#86868B] block text-[10px]">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 rounded-lg bg-white dark:bg-[#1D1D1F] border border-[#D2D2D7] dark:border-[#3E3E42]"
                />
              </div>
              <div>
                <label className="text-[#6E6E73] dark:text-[#86868B] block text-[10px]">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 rounded-lg bg-white dark:bg-[#1D1D1F] border border-[#D2D2D7] dark:border-[#3E3E42]"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Real-time Password Strength Meter */}
          <div className="p-3.5 rounded-[14px] bg-[#F5F5F7] dark:bg-[#2C2C2E] space-y-1.5 text-xs text-[#6E6E73] dark:text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider block text-[#1D1D1F] dark:text-[#F5F5F7]">
              Password Requirements:
            </span>
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-[#34C759]" />
              ) : (
                <X className="w-3.5 h-3.5 text-[#FF3B30]" />
              )}
              <span className={hasMinLength ? 'text-[#34C759]' : ''}>Minimum 8 characters</span>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber ? (
                <Check className="w-3.5 h-3.5 text-[#34C759]" />
              ) : (
                <X className="w-3.5 h-3.5 text-[#FF3B30]" />
              )}
              <span className={hasNumber ? 'text-[#34C759]' : ''}>At least one number (0-9)</span>
            </div>
            {password && confirmPassword && (
              <div className="flex items-center gap-2">
                {hasMatchingPassword ? (
                  <Check className="w-3.5 h-3.5 text-[#34C759]" />
                ) : (
                  <X className="w-3.5 h-3.5 text-[#FF3B30]" />
                )}
                <span className={hasMatchingPassword ? 'text-[#34C759]' : 'text-[#FF3B30]'}>
                  {hasMatchingPassword ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="accent"
              fullWidth
              loading={loading}
              className="bg-[#34C759] hover:bg-[#30D158] py-3.5"
            >
              Submit Pharmacy Registration
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-[#6E6E73] dark:text-[#86868B]">
          Already registered?{' '}
          <Link to="/store/login" className="text-[#34C759] dark:text-[#30D158] font-semibold hover:underline">
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  );
}
