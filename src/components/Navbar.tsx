import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";

const DROP_DURATION_MS = 1200; // drop-in duration
const EXPAND_DURATION_MS = 800; // expand-to-full duration

const navItems = [
  { href: "/", label: "Home" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [dropped, setDropped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const dropTimer = window.setTimeout(() => setDropped(true), 0);
    const expandTimer = window.setTimeout(() => setExpanded(true), DROP_DURATION_MS);
    return () => {
      clearTimeout(dropTimer);
      clearTimeout(expandTimer);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsivePadding = () => {
    if (windowWidth >= 1024) return "12px 24px";
    if (windowWidth >= 640) return "8px 16px";
    return "6px 12px";
  };

  return (
    <motion.nav
      className="sticky top-0 z-10 w-full flex flex-col items-center pt-6 font-mono"
      initial={{
        transform: "translateY(-80px)",
        opacity: 0,
      }}
      animate={{
        transform: dropped ? "translateY(0)" : "translateY(-80px)",
        opacity: dropped ? 1 : 0,
      }}
      transition={{
        duration: DROP_DURATION_MS / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className={`relative ${expanded ? "w-full max-w-[1000px] mx-4 sm:mx-6 lg:mx-8" : "w-fit"} flex ${
          expanded ? "justify-between" : "justify-center"
        } items-center bg-white text-gray-800 rounded-2xl shadow-2xl backdrop-blur-[60px] font-semibold tracking-wider uppercase`}
        layout
        animate={{
          padding: getResponsivePadding(),
          scaleX: 1,
        }}
        transition={{
          duration: EXPAND_DURATION_MS / 1000,
          ease: [0.22, 1, 0.36, 1],
          layout: { duration: EXPAND_DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] },
        }}
        style={{
          transformOrigin: "center",
        }}
      >
        {/* Left Navigation Section */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const isVisible = expanded || isActive;
            return (
              <motion.div
                key={item.href}
                initial={{
                  opacity: 0,
                  maxWidth: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  maxWidth: isVisible ? 260 : 0,
                  scale: isVisible ? 1 : 0.95,
                }}
                transition={{
                  duration: EXPAND_DURATION_MS / 1000,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  overflow: "hidden",
                  pointerEvents: isVisible ? "auto" : "none",
                }}
              >
                <Link
                  to={item.href}
                  className={`relative inline-flex items-center rounded-xl group text-sm sm:text-base ${
                    isActive ? "text-gray-600" : "text-gray-800"
                  } ${expanded ? "hover:animate-squiggle" : ""} px-2 py-2 sm:px-4 sm:py-2 lg:px-4 lg:py-[10px]`}
                >
                  {/* Active background */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gray-100 rounded-xl transition-all duration-300 ease-out" />
                  )}
                  {/* Hover background */}
                  <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Right Section - Wallet Connect Button */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: EXPAND_DURATION_MS / 1000,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2,
            }}
            className="shrink-0"
          >
            <ConnectButton />
          </motion.div>
        )}
      </motion.div>
    </motion.nav>
  );
}
