import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import { useLanguage } from "./LanguageContext";

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError(t.login.requiredFields);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        formData
      );
      console.log("Login successful:", response.data);
      setError("");
      // Save userId and user object to localStorage
      localStorage.setItem("userId", response.data.user._id);
      localStorage.setItem("user", JSON.stringify(response.data.user)); // <-- Add this line
      onLogin();
      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t.login.errorOccurred);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goHome = () => navigate("/");

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center">
      <div
        className="w-full max-w-4xl bg-white p-10 rounded-3xl shadow-2xl border border-gray-200"
        style={{ height: "90%" }}
      >
        <h2 className="text-4xl font-bold text-center text-teal-700 mb-8">
          {t.login.title}
        </h2>

        {error && (
          <p className="text-red-600 bg-red-100 p-3 rounded text-center mb-6">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <InputField
            label={t.login.emailLabel}
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t.login.emailPlaceholder}
          />

          <InputField
            label={t.login.passwordLabel}
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder={t.login.passwordPlaceholder}
            isPassword
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          {/* Buttons & Redirect */}
          <div className="mt-6 space-y-5">
            <button
              type="submit"
              className={`w-full py-3 ${isSubmitting ? 'bg-[#a06d2a]' : 'bg-[#C88B3D]'} text-white font-semibold rounded-xl ${isSubmitting ? '' : 'hover:bg-[#a06d2a]'} transition shadow-md flex items-center justify-center`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                t.login.loginButton
              )}
            </button>

            <button
              type="button"
              onClick={goHome}
              className="w-full py-2 bg-gray-100 text-teal-700 rounded-xl hover:bg-gray-200 transition border border-gray-300"
            >
              {t.login.backToHome}
            </button>

            <p className="text-center text-gray-600 text-sm mt-4">
              <button
                type="button"
                className="underline text-blue-600 hover:text-blue-800 transition"
                onClick={() => navigate('/forgot-password')}
              >
                {t.login.forgotPassword}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  isPassword = false,
  showPassword = false,
  setShowPassword = undefined,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <div className="relative">
    <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition pr-12"
      placeholder={placeholder}
      required
    />
    {isPassword && setShowPassword && (
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500 focus:outline-none"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          // Eye-off SVG
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-2.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938M3 3l18 18" /></svg>
        ) : (
          // Eye SVG
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" /></svg>
        )}
      </button>
    )}
  </div>
);

export default Login;
