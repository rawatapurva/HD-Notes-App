import { useState } from "react";
import axios from "axios";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import GoogleBtn from "../components/GoogleBtn.jsx";
import { useNavigate } from "react-router-dom";
import myImage from "../../image/image.jpg";
import image from "../../image/logo.png";

export default function Signup() {
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({ name: "", dob: "", email: "", otp: "" });
  const [stage, setStage] = useState("collect"); // collect -> otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function requestOtp() {
    setError("");
    setLoading(true);
    try {
      // ✅ Validate Name (only letters & spaces, min 2 chars)
      const nameRegex = /^[A-Za-z\s]{2,}$/;
      if (!nameRegex.test(form.name)) {
        throw new Error("Enter a valid name (only letters & spaces, min 2 chars)");
      }

      // ✅ Validate DOB (required)
      if (!form.dob) {
        throw new Error("Date of Birth is required");
      }

      // ✅ Validate Email (standard pattern)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        throw new Error("Enter a valid email address");
      }

      // ✅ API call for OTP
      await axios.post(`${api}/auth/request-otp`, {
        name: form.name,
        email: form.email,
        dob: form.dob
      });

      setStage("otp");
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError("");
    setLoading(true);
    try {
      if (form.otp.length !== 6) throw new Error("Enter 6-digit OTP");

      const res = await axios.post(`${api}/auth/verify-otp`, {
        email: form.email,
        otp: form.otp,
        name: form.name,
        dob: form.dob
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/app");
    } catch (e) {
      setError(e.response?.data?.error || e.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  function onGoogleSuccess(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/app");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full h-auto md:w-[1440px] md:h-[800px] opacity-100 rounded-[32px] border border-black bg-white shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Left Section */}
        <div className="p-6 sm:p-10 md:p-14 w-full">
          {/* Logo */}
          <div className="gap-12 mb-6">
            <img 
              src={image}
              alt="Logo" 
              className="h-[79] w-[32] object-cover rounded-full" 
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Sign up</h1>
          <p className="text-gray-500 mb-6 text-base sm:text-lg">
            Sign up to enjoy the feature of HD
          </p>

          <div className="space-y-4">
            <Input label="Your Name" name="name" value={form.name} onChange={onChange} placeholder="Enter your name" />
            <Input label="Date of Birth" type="date" name="dob" value={form.dob} onChange={onChange} />
            <Input label="Email" type="email" name="email" value={form.email} onChange={onChange} placeholder="Enter your email" />

            {stage === "collect" ? (
              <Button onClick={requestOtp} disabled={loading}>
                {loading ? "Sending..." : "Get OTP"}
              </Button>
            ) : (
              <>
                <Input label="Enter OTP" name="otp" value={form.otp} onChange={onChange} placeholder="6-digit code" />
                <Button onClick={verifyOtp} disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Footer */}
          <div className="mt-8 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <button onClick={() => navigate("/signin")} className="text-blue-600 hover:underline">
              Sign-in
            </button>
          </div>

          <div className="mt-6">
            <GoogleBtn onSuccess={onGoogleSuccess} onError={setError} />
          </div>
        </div>

        {/* Right Section (Hidden on Mobile) */}
        <div className="hidden md:block bg-gray-100">
          <img src={myImage} alt="Art" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
