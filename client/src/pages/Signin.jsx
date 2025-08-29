import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import myImage from "../../image/image.jpg";
import image from "../../image/logo.png";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const navigate = useNavigate();

  // ✅ Auto-login if token exists and keep me logged in was checked
  useEffect(() => {
    const token = localStorage.getItem("token");
    const keep = localStorage.getItem("keepLoggedIn") === "true";

    if (token && keep) {
      navigate("/app");
    }
  }, [navigate]);

  const handleGetOtp = async () => {
    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/signin-request-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        setShowOtp(true);
        setMessage("OTP sent to your email");
      } else {
        setMessage(data.message || "User is not registered, please create an account first");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/signin-verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        setMessage("Login successful");
        localStorage.setItem("token", data.token);
        localStorage.setItem("keepLoggedIn", keepLoggedIn); // ✅ store preference

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        setTimeout(() => navigate("/app"), 1000);
      } else {
        setMessage(data.message || "Invalid OTP");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full h-auto md:w-[1440px] md:h-[800px] bg-white rounded-[32px] border border-black shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Left Section */}
        <div className="p-6 sm:p-10 md:p-14 w-full">
          {/* Logo */}
          <div className=" gap-12 mb-6">
            <img 
            src={image}
            alt="Logo" 
            className="h-[79] w-[32] object-cover rounded-full" 
            />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Sign in</h2>
          <p className="text-gray-500 mb-6 text-base sm:text-lg">
            Please login to continue to your account.
          </p>

          {/* Email */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={showOtp}
              />
            </div>

            {/* OTP */}
            {showOtp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleGetOtp}
                  className="text-blue-600 text-sm hover:underline"
                  disabled={loading}
                >
                  {loading ? "Resending..." : "Resend OTP"}
                </button>
              </>
            )}

            {/* Keep me logged in */}
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
              />
              <span className="text-gray-700 text-sm">Keep me logged in</span>
            </div>

            {/* Buttons */}
            {!showOtp && (
              <button
                onClick={handleGetOtp}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Sending..." : "Get OTP"}
              </button>
            )}

            {showOtp && (
              <button
                onClick={handleSignIn}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            )}

            {/* Error / Message */}
            {message && <p className="text-center text-red-500 text-sm">{message}</p>}
          </div>

          {/* Footer */}
          <div className="mt-8 text-sm text-gray-600 text-center">
            Need an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:underline"
            >
              Create one
            </button>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="hidden md:block bg-gray-100">
          <img src={myImage} alt="Art" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
