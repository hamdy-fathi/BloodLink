"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from "@/lib/context";
import { authApi } from "@/lib/api";
import {
  Droplet,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Lock,
  Heart,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const CAIRO_DISTRICTS = [
  "Nasr City", "Zamalek", "Heliopolis", "Maadi", "Dokki",
  "6th of October City", "Mohandessin", "New Cairo", "Downtown",
  "Giza", "Shubra", "Ain Shams", "El Marg", "El Matariya", "El Manial",
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAppContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bloodType, setBloodType] = useState("O+");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("Nasr City");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.register({
        name,
        email,
        phone,
        password,
        bloodType,
        age: parseInt(age),
        city,
      });

      // Store token and redirect
      localStorage.setItem("bloodlink_token", res.data.access_token);
      setSuccess(true);

      // Auto-login after brief success display
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-brand selection:text-white">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand/20 via-background to-background items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(225,29,72,0.15),transparent_60%)]"></div>
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="w-20 h-20 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-8">
            <Droplet className="w-10 h-10 text-brand" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Join Blood<span className="text-brand">Link</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Register as a blood donor and help save lives. Every donation matters.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { icon: Heart, text: "Get matched to emergencies near you" },
              { icon: MapPin, text: "GPS-based proximity matching" },
              { icon: Phone, text: "Instant notifications when needed" },
              { icon: CheckCircle, text: "Track your donation history" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                <item.icon className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-brand" fill="currentColor" />
            </div>
            <span className="text-xl font-bold">
              Blood<span className="text-brand">Link</span>
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-6 h-6 text-brand" />
            <h2 className="text-2xl font-bold">Register as Donor</h2>
          </div>
          <p className="text-zinc-400 text-sm mb-8">
            Create your account and start saving lives.
          </p>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-emerald-500 mb-2">Registration Successful!</h3>
              <p className="text-zinc-400 text-sm">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  placeholder="Mohamed Ahmed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    <Mail className="w-3.5 h-3.5 inline mr-1" />Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                    placeholder="+20-100-555-0100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                  >
                    {BLOOD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />District
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                  >
                    {CAIRO_DISTRICTS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  <Lock className="w-3.5 h-3.5 inline mr-1" />Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  placeholder="••••••••"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Min 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                ) : (
                  <>Register as Donor <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-center text-sm text-zinc-500 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-brand hover:text-brand-hover font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
