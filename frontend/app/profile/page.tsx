// app/profile/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import toast from "react-hot-toast";
import OrderProgressBar from "@/components/OrderProgressBar";
import VoucherCard from "@/components/VoucherCard";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Package,
  Gift,
  Mail,
  Phone,
  Lock,
  ChevronRight,
  LogOut,
  MapPin,
  ShieldCheck,
  Save,
  AlertCircle,
  Compass,
  CheckCircle2,
  Loader2
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type TabType = "info" | "orders" | "vouchers" | "address";

const COUNTRY_DIAL_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+1", country: "US / Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "other", country: "Other Country", flag: "🌐" },
];

type OrderItem = {
  productId: string;
  qty: number;
  size?: string;
  title: string;
  price: number;
  image: string;
};

type Order = {
  _id: string;
  orderId: string;
  status: string;
  createdAt: string;
  total: number;
  payableAmount?: number;
  items: OrderItem[];
  statusHistory?: Array<{
    status: string;
    at?: string;
    by?: string;
  }>;
  billing: {
    name?: string;
    fullName?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    paymentMethod: string;
  };
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState<"all" | "active" | "delivered" | "cancelled">("all");

  // Profile Edit State & Picklist
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Validation Errors State
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Address Edit & Pincode Auto-Fill State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [pincodeMsg, setPincodeMsg] = useState("");

  // Vouchers
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Tab Syncing
  useEffect(() => {
    if (tabFromUrl && ["info", "orders", "vouchers", "address"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  /* ================= 1. AUTH & USER FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth-change"));
          }
          setUser(null);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setName(data.name || "");
          
          if (data.phone) {
            const matched = COUNTRY_DIAL_CODES.find((c) => data.phone.startsWith(c.code));
            if (matched) {
              setCountryCode(matched.code);
              setPhoneDigits(data.phone.replace(matched.code, "").trim());
            } else {
              setPhoneDigits(data.phone);
            }
          }

          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchMe();
  }, []);

  /* ================= 2. FETCH ORDERS ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingOrders(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          setOrders([]);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= 3. FETCH VOUCHERS ================= */
  useEffect(() => {
    if (activeTab === "vouchers") {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingVouchers(true);
      fetch(`${API}/api/auth/vouchers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setVouchers(Array.isArray(data) ? data : []))
        .catch(() => setVouchers([]))
        .finally(() => setLoadingVouchers(false));
    }
  }, [activeTab]);

  /* ================= 4. LOAD SAVED ADDRESS ================= */
  useEffect(() => {
    const savedAddressStr = localStorage.getItem("checkoutAddress");
    if (savedAddressStr) {
      try {
        const parsed = JSON.parse(savedAddressStr);
        setAddress(parsed.address || "");
        setCity(parsed.city || "");
        setStateName(parsed.state || "");
        setCountry(parsed.country || "India");
        setPincode(parsed.pincode || "");
      } catch (_) {}
    }
  }, []);

  /* ================= PINCODE AUTO-LOCATION FETCH ================= */
  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    const cleanPin = val.trim().replace(/[^0-9]/g, "");

    if (cleanPin.length === 6) {
      setFetchingPincode(true);
      setPincodeMsg("Detecting location details...");
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();

        if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const info = data[0].PostOffice[0];
          setCity(info.District || info.Name || "");
          setStateName(info.State || "");
          setCountry(info.Country || "India");
          setPincodeMsg(`✓ Detected: ${info.District}, ${info.State}`);
        } else {
          setPincodeMsg("Location not found automatically — please fill details below.");
        }
      } catch (err) {
        setPincodeMsg("");
      } finally {
        setFetchingPincode(false);
      }
    } else {
      setPincodeMsg("");
    }
  };

  /* ================= PHONE VALIDATION ================= */
  const validatePhone = (val: string) => {
    if (!val || !val.trim()) {
      setPhoneError("");
      return true;
    }
    const cleanDigits = val.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      setPhoneError("Phone number must contain 7 to 15 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  /* ================= PASSWORD VALIDATION ================= */
  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError("");
      return true;
    }
    if (val.trim().length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  /* ================= SAVE PROFILE ================= */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired — please log in again");
      return;
    }

    const isPhoneValid = validatePhone(phoneDigits);
    const isPassValid = validatePassword(password);

    if (!isPhoneValid || !isPassValid) {
      toast.error("Please resolve validation errors before saving");
      return;
    }

    const fullPhone = phoneDigits.trim()
      ? countryCode === "other"
        ? phoneDigits.trim()
        : `${countryCode} ${phoneDigits.trim()}`
      : "";

    setSavingProfile(true);
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone: fullPhone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      setUser(data.user);
      setPassword("");
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      toast.error("Network error — please try again");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= SAVE ADDRESS ================= */
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    const addrObj = { address, city, state: stateName, country, pincode };
    localStorage.setItem("checkoutAddress", JSON.stringify(addrObj));
    setTimeout(() => {
      setSavingAddress(false);
      toast.success("Default shipping address & map location saved!");
    }, 400);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }
    toast.success("Logged out successfully");
    router.push("/login");
  };

  /* Map Query String */
  const mapQuery = [pincode, city, stateName, country].filter(Boolean).join(", ");

  /* ================= GUEST STATE ================= */
  if (!loadingUser && !user) {
    return (
      <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-12 bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <UserIcon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Account Login Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Please sign in to your IONYX account to view your order history, manage saved addresses, and update security details.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/login?redirect=/profile"
              className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs py-3.5 rounded-xl shadow-md hover:bg-slate-800 transition"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex-1 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 font-bold text-xs py-3.5 rounded-xl transition hover:bg-slate-200"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* Filtered orders */
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "active") return ["Pending", "Processing", "Shipped"].includes(o.status);
    if (orderFilter === "delivered") return o.status === "Delivered";
    if (orderFilter === "cancelled") return o.status === "Cancelled";
    return true;
  });

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "U";
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameStr.substring(0, 2).toUpperCase();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white transition-colors duration-300 pb-24 pt-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER TITLE BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-300">
              Executive Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              My Account Center
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition shadow-sm self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>

        {/* DASHBOARD MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR ================= */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Profile Overview Card */}
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm dark:shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl flex items-center justify-center shadow-lg border border-white/20">
                  {getInitials(user?.name)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white truncate">
                    {user?.name || "User"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || "No email"}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="h-3 w-3" /> Verified Member
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Menu */}
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-3xl shadow-sm dark:shadow-xl space-y-1">
              
              <button
                onClick={() => setActiveTab("info")}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition ${
                  activeTab === "info"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <UserIcon className="h-4 w-4" /> Personal Details & Security
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition ${
                  activeTab === "orders"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Package className="h-4 w-4" /> My Orders ({orders.length})
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => setActiveTab("address")}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition ${
                  activeTab === "address"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <MapPin className="h-4 w-4" /> Saved Address & Map
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => setActiveTab("vouchers")}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition ${
                  activeTab === "vouchers"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Gift className="h-4 w-4" /> Vouchers & Rewards
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

            </div>

          </div>

          {/* ================= RIGHT TAB BODY ================= */}
          <div className="lg:col-span-8">
            
            {/* TAB 1: PERSONAL DETAILS */}
            {activeTab === "info" && (
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl space-y-6">
                
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Personal Information & Security
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Update your account name, contact details, and password.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Email Address (Verified Readonly) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Email Address (Verified)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Phone Number with Country Code Dropdown Picklist */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Phone Number & Country Code</span>
                        <span className="text-[10px] text-slate-400 font-normal">7-15 numeric digits</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        
                        {/* Country Code Picklist */}
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm min-w-[150px]"
                        >
                          {COUNTRY_DIAL_CODES.map((c) => (
                            <option key={c.code} value={c.code} className="dark:bg-zinc-900">
                              {c.flag} {c.code} ({c.country})
                            </option>
                          ))}
                        </select>

                        {/* Subscriber Number Input */}
                        <div className="relative flex-1">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="tel"
                            value={phoneDigits}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPhoneDigits(val);
                              validatePhone(val);
                            }}
                            placeholder="9876543210"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border ${
                              phoneError
                                ? "border-rose-500 text-rose-600 focus:ring-rose-500"
                                : "border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-indigo-500"
                            } text-xs font-semibold focus:outline-none focus:ring-2`}
                          />
                        </div>

                      </div>

                      {phoneError && (
                        <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {phoneError}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        New Password (Optional)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPassword(val);
                            validatePassword(val);
                          }}
                          placeholder="Leave blank to keep current password (min 6 characters)"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border ${
                            passwordError
                              ? "border-rose-500 text-rose-600 focus:ring-rose-500"
                              : "border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-indigo-500"
                          } text-xs font-semibold focus:outline-none focus:ring-2`}
                        />
                      </div>
                      {passwordError && (
                        <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {passwordError}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile || !!phoneError || !!passwordError}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* TAB 2: MY ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                
                <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Order History & Tracking
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Review all past purchases, track active shipments, and view order receipts.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(["all", "active", "delivered", "cancelled"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setOrderFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap transition ${
                          orderFilter === filter
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                {loadingOrders ? (
                  <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
                    Loading your orders...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
                    <Package className="h-10 w-10 mx-auto text-slate-400" />
                    <h4 className="font-bold text-slate-900 dark:text-white">No Orders Found</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      You haven't placed any orders matching this filter yet.
                    </p>
                    <Link
                      href="/products"
                      className="inline-block bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3 text-xs">
                          <div>
                            <span className="font-black text-slate-900 dark:text-white">
                              Order #{order.orderId || order._id.substring(0, 8)}
                            </span>
                            <span className="text-slate-400 block text-[10px]">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              order.status === "Delivered"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                                : order.status === "Cancelled"
                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800"
                            }`}>
                              {order.status === "Cancelled" ? (
                                order.statusHistory?.find((h) => h.status === "Cancelled")?.by === "user"
                                  ? "Cancelled by You"
                                  : order.statusHistory?.find((h) => h.status === "Cancelled")?.by === "admin"
                                  ? "Cancelled by Brand"
                                  : "Cancelled"
                              ) : (
                                order.status
                              )}
                            </span>
                            <span className="font-black text-slate-900 dark:text-white text-sm">
                              ₹{(order.payableAmount || order.total)?.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Component */}
                        <OrderProgressBar currentStatus={order.status} statusHistory={order.statusHistory} />

                        {/* Items Preview */}
                        <div className="space-y-2 pt-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-xs">
                              <img
                                src={item.image || "/placeholder.png"}
                                alt={item.title}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-zinc-800"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h5>
                                <p className="text-[10px] text-slate-400">Qty: {item.qty} {item.size ? `• Size: ${item.size}` : ""}</p>
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                ₹{(item.price * item.qty).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: SAVED ADDRESS WITH AUTO PINCODE & MAP PREVIEW */}
            {activeTab === "address" && (
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Default Shipping Address & Map
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enter your pincode to auto-detect your district, state, and view your live map location.
                  </p>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4">
                  {/* Pincode with Auto-Detect */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span>Pincode (Auto-Detect Location)</span>
                      {fetchingPincode && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-300 font-bold flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Auto-Detecting...
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="Enter 6-digit Pincode (e.g. 700001, 110001)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    {pincodeMsg && (
                      <p className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${
                        pincodeMsg.startsWith("✓") ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"
                      }`}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> {pincodeMsg}
                      </p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Flat No, Building Name, Street, Landmark"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* City/District, State, Country Auto-Filled Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        District / City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="District / City"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        State
                      </label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="State"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* LIVE INTERACTIVE MAP PREVIEW */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Live Address Map Preview
                      </span>
                      {fetchingPincode && <span className="text-[11px] text-emerald-500 animate-pulse font-bold">Locating Pin...</span>}
                    </label>

                    {mapQuery ? (
                      <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-md bg-slate-100 dark:bg-zinc-900">
                        <iframe
                          title="Live Address Location Map"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                        <MapPin className="h-6 w-6 opacity-40" />
                        <span>Enter a pincode above to preview location on map</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {savingAddress ? "Saving..." : "Save Address & Map Location"}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* TAB 4: VOUCHERS */}
            {activeTab === "vouchers" && (
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Active Vouchers & Discount Coupons
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your available store credits and promotional coupons.
                  </p>
                </div>

                {loadingVouchers ? (
                  <div className="p-8 text-center text-xs text-slate-400">Loading vouchers...</div>
                ) : vouchers.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                    <Gift className="h-8 w-8 mx-auto text-slate-400" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">No Vouchers Currently Available</h4>
                    <p className="text-[11px] text-slate-500">
                      Earn gift vouchers on your next order delivery!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vouchers.map((voucher) => (
                      <VoucherCard key={voucher._id} voucher={voucher} />
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-12 text-center text-sm text-slate-500">Loading account center...</div>}>
      <ProfileContent />
    </Suspense>
  );
}