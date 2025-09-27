import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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


  useEffect(() => {
    const dropTimer = window.setTimeout(() => setDropped(true), 0);
    const expandTimer = window.setTimeout(() => setExpanded(true), DROP_DURATION_MS);
    return () => {
      clearTimeout(dropTimer);
      clearTimeout(expandTimer);
    };
  }, []);

  return (
    <nav
      className="sticky top-0 z-10 w-full flex flex-col pt-3 pb-2 font-mono"
      style={{
        transform: dropped ? "translateY(0)" : "translateY(-80px)",
        opacity: dropped ? 1 : 0,
        transition: `transform ${DROP_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${DROP_DURATION_MS}ms ease-out`,
        willChange: "transform, opacity",
      }}
    >
      <div
        className="relative w-full flex justify-between items-center bg-white text-gray-800 rounded-2xl shadow-2xl backdrop-blur-[60px] font-semibold tracking-wider uppercase"
        style={{
          padding: expanded ? "12px 24px" : "8px 24px",
          transform: expanded ? "scaleX(1)" : "scaleX(0.94)",
          transformOrigin: "center",
          transition: `transform ${EXPAND_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), padding ${EXPAND_DURATION_MS}ms ease`
        }}
      >
        {/* Left Navigation Section */}
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const isVisible = expanded || isActive;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative inline-flex items-center rounded-xl transition-all ease-out group ${
                  isActive ? "text-icterine" : "text-gray-800"
                } ${expanded ? "hover:animate-squiggle" : ""}`}
                style={{
                  padding: isVisible ? "10px 16px" : "0px",
                  opacity: isVisible ? 1 : 0,
                  maxWidth: isVisible ? 260 : 0,
                  transform: isVisible ? "scale(1)" : "scale(0.95)",
                  overflow: "hidden",
                  pointerEvents: isVisible ? "auto" : "none",
                  transitionDuration: `${EXPAND_DURATION_MS}ms`
                }}
              >
                {/* Active background */}
                {isActive && (
                  <div 
                    className="absolute inset-0 bg-gray-100 rounded-xl transition-all duration-300 ease-out"
                  />
                )}
                {/* Hover background */}
                <div 
                  className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"
                />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Right Section - Wallet Connect Button */}
        {expanded && (
          <div 
            className="transition-all ease-out"
            style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? "scale(1)" : "scale(0.95)",
              transitionDuration: `${EXPAND_DURATION_MS}ms`,
              transitionDelay: "200ms"
            }}
          >
            <ConnectButton />
          </div>
        )}
      </div>
    </nav>
  );
}