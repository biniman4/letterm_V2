import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PublicNavbar } from "../layout/PublicNavbar";
import { PublicFooter } from "../layout/PublicFooter";
import { Modal } from "react-responsive-modal";
import axios from "axios";
import {
  MailIcon,
  ClockIcon,
  ShieldCheckIcon,
  SearchIcon,
  CheckCircleIcon,
  BarChartIcon,
  FileTextIcon,
  LayersIcon,
  SendIcon,
  UserIcon,
  LockIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../components/pages/LanguageContext";

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
    },
  }),
};

const wordVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const features = [
  {
    name: "",
    description: "",
    icon: MailIcon,
  },
  {
    name: "",
    description: "",
    icon: ClockIcon,
  },
  {
    name: "",
    description: "",
    icon: ShieldCheckIcon,
  },
  {
    name: "",
    description: "",
    icon: SearchIcon,
  },
  {
    name: "",
    description: "",
    icon: CheckCircleIcon,
  },
  {
    name: "",
    description: "",
    icon: BarChartIcon,
  },
];

const services = [
  {
    name: "",
    description: "",
    icon: FileTextIcon,
  },
  {
    name: "",
    description: "",
    icon: LayersIcon,
  },
  {
    name: "",
    description: "",
    icon: SendIcon,
  },
];

const Home = ({ onLogin }: { onLogin: () => void }): JSX.Element => {
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError("");
    try {
      // Example login request (replace with your backend endpoint)
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        credentials
      );
      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      onLogin();
      // Redirect based on user role
      if (user.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (error: any) {
      setLoginError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFF]">
      <PublicNavbar lang={lang} onLanguageChange={setLang} />
      <main className="flex-grow">
        <div className="relative h-screen bg-gradient-to-b from-[#F5F8FF] via-[#FAFBFF] to-white">
          {/* Left side water drops */}
          <div className="absolute left-0 w-[15%] top-0 bottom-0 overflow-hidden">
            <div className="water-drops-left absolute inset-0"></div>
            <div className="water-drops-left-2 absolute inset-0"></div>
          </div>

          {/* Right side water drops */}
          <div className="absolute right-0 w-[15%] top-0 bottom-0 overflow-hidden">
            <div className="water-drops-right absolute inset-0"></div>
            <div className="water-drops-right-2 absolute inset-0"></div>
          </div>

          {/* Main content water drops */}
          <div className="absolute left-[15%] right-[15%] top-0 bottom-0 overflow-hidden">
            <div className="water-drops absolute inset-0"></div>
            <div className="water-drops-2 absolute inset-0"></div>
            <div className="water-drops-3 absolute inset-0"></div>
            <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-[10%] right-[10%] w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[10%] left-[20%] w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center">
            <div className="text-center">
              <motion.div
                key={lang + "-title"}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className="relative"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight font-extrabold text-main-text">
                  <span className="block">
                    {t.home.title.split("").map((char, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        variants={letterVariants}
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </span>
                  <span className="block mt-2 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-main-text">
                    {t.home.subtitle.split("").map((char, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        variants={letterVariants}
                        className="inline-block"
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </span>
                </h1>
                <motion.p
                  key={lang + "-description"}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
                >
                  {t.home.description.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      className="inline-block"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.p>
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-12 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition duration-300 transform hover:scale-105"
                  >
                    {t.home.login}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="py-24 bg-white relative" id="features">
          <div className="absolute inset-0">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-50 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(#E4E9FF_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-extrabold text-main-text sm:text-5xl hover:text-hover-gold transition-colors duration-200"
              >
                {t.home.featuresHeading}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-3 sm:mt-4 text-lg sm:text-xl text-gray-500 px-4 sm:px-0"
              >
                {t.home.featuresSub}
              </motion.p>
            </div>
            <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100"
                >
                  <div>
                    <span className="p-2 sm:p-3 bg-blue-50 rounded-xl inline-block group-hover:bg-blue-100 transition-colors duration-200">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-main-text group-hover:text-hover-gold" />
                    </span>
                  </div>
                  <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-main-text group-hover:text-hover-gold transition-colors duration-200">
                    {t.features[index].name}
                  </h3>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-main-text leading-relaxed">
                    {t.features[index].description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-24 relative" id="services">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFF] to-white"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#8B5CF6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.02]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-extrabold text-main-text sm:text-5xl hover:text-hover-gold transition-colors duration-200"
              >
                {lang === "am"
                  ? "የሙያተኛ አገልግሎቶቻችን"
                  : "Our Professional Services"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-3 sm:mt-4 text-lg sm:text-xl text-gray-500 px-4 sm:px-0"
              >
                {lang === "am"
                  ? "ለSSGI የግንኙነት ፍላጎቶች የተለዩ መፍትሄዎች"
                  : "Specialized solutions for SSGI's communication needs"}
              </motion.p>
            </div>
            <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-gradient-to-br from-white to-blue-50/50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/20 hover:border-blue-200"
                >
                  <div>
                    <span className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl inline-block shadow-md group-hover:shadow-lg transition-all duration-200">
                      <service.icon className="h-6 w-6 sm:h-7 sm:w-7 text-main-text group-hover:text-hover-gold" />
                    </span>
                  </div>
                  <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold text-main-text group-hover:text-hover-gold transition-colors duration-200">
                    {t.services[index].name}
                  </h3>
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg text-main-text leading-relaxed">
                    {t.services[index].description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative py-24" id="cta">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(255,255,255,0.1),transparent)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_300px,rgba(255,255,255,0.08),transparent)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.02]"></div>
          </div>

          <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">{t.home.ctaTitle}</span>
                <span className="block mt-2 text-blue-200">
                  {t.home.ctaSubtitle}
                </span>
              </h2>
            </motion.div>
          </div>
        </div>
      </main>

      <PublicFooter />

      <Modal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        center
        styles={{
          modal: {
            borderRadius: "1.5rem",
            padding: "2.5rem",
            maxWidth: "40rem",
          },
        }}
      >
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          Log In to Your Account
        </h2>
        {loginError && (
          <p className="text-red-600 bg-red-100 p-3 rounded text-center mb-4">
            {loginError}
          </p>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:ring-teal-400 focus:border-teal-400"
              placeholder="john@example.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:ring-teal-400 focus:border-teal-400"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition shadow-md"
          >
            Log In
          </button>
          <p className="text-center text-gray-600 text-sm mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="underline text-teal-600 hover:text-teal-800 transition"
            >
              Sign up
            </Link>
          </p>
          <p className="text-center text-gray-600 text-sm mt-2">
            <Link
              to="/forgot-password"
              className="underline text-blue-600 hover:text-blue-800 transition"
            >
              Forgot Password?
            </Link>
          </p>
        </form>
      </Modal>

      <style>
        {`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }

          @keyframes droplet {
            0% {
              transform: translateY(0) scale(1);
              opacity: 0;
            }
            50% {
              transform: translateY(15px) scale(1.1);
              opacity: 0.7;
            }
            100% {
              transform: translateY(30px) scale(1);
              opacity: 0;
            }
          }

          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }

          .water-drops,
          .water-drops-2,
          .water-drops-3 {
            pointer-events: none;
            background-size: 200px 200px;
            animation: droplet 3s linear infinite;
            opacity: 0.6;
          }

          .water-drops {
            background-image: 
              radial-gradient(2px 2px at 40px 40px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 80px 60px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 120px 90px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 160px 120px, rgba(99, 102, 241, 0.6) 50%, transparent);
          }

          .water-drops-2 {
            animation-delay: -1s;
            background-image: 
              radial-gradient(2px 2px at 20px 50px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 60px 70px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 100px 100px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 140px 130px, rgba(99, 102, 241, 0.6) 50%, transparent);
          }

          .water-drops-3 {
            animation-delay: -2s;
            background-image: 
              radial-gradient(2px 2px at 30px 30px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 70px 80px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 110px 110px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 150px 140px, rgba(99, 102, 241, 0.6) 50%, transparent);
          }

          .water-drops-left,
          .water-drops-left-2,
          .water-drops-right,
          .water-drops-right-2 {
            pointer-events: none;
            background-size: 100px 100px;
            animation: droplet 4s linear infinite;
            opacity: 0.4;
          }

          .water-drops-left {
            background-image: 
              radial-gradient(2px 2px at 20px 20px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 40px 40px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 60px 60px, rgba(99, 102, 241, 0.6) 50%, transparent);
          }

          .water-drops-left-2 {
            animation-delay: -2s;
            background-image: 
              radial-gradient(2px 2px at 30px 30px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 50px 50px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 70px 70px, rgba(99, 102, 241, 0.6) 50%, transparent);
          }

          .water-drops-right {
            background-image: 
              radial-gradient(2px 2px at 25px 25px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 45px 45px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 65px 65px, rgba(99, 102, 241, 0.6) 50%, transparent);
          }

          .water-drops-right-2 {
            animation-delay: -2s;
            background-image: 
              radial-gradient(2px 2px at 35px 35px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 55px 55px, rgba(99, 102, 241, 0.6) 50%, transparent),
              radial-gradient(2px 2px at 75px 75px, rgba(99, 102, 241, 0.6) 50%, transparent);
          }
        `}
      </style>
    </div>
  );
};

export default Home;
