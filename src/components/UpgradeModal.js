import React, { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom"


const tiers = [
  {
    name: "Free",
    price: "$0 / forever",
    description: [
      "Single-path simulations",
      "7-day free access to multi-path simulations",
      "Analytics Overview dashboard",
      "Basic recommendations",
      "Save up to 3 scenarios",
      "Standard UI & branding",
    ],
    isFree: true,
  },
  {
    name: "Pro",
    price: "Starting at $49 / month",
    description: [
      "Unlimited multi-path simulations",
      "Industry scenario templates + branch versioning",
      "Full analytics dashboard + custom report export",
      "Real-time KPI alerts & trend monitoring",
      "AI scenario builder (limited use)",
      "Smart strategy & decision impact simulations",
      "External integrations (Google Sheets, CRM, Notion)",
      "Collaborate with up to 3 users",
      "Standard email support",
    ],
    discount: 20, // percent
  },
  {
    name: "Enterprise",
    price: "Custom pricing — contact us",
    description: [
      "Everything in Pro, plus:",
      "Unlimited AI scenario builder usage",
      "Extended historical data playback & retention",
      "Full API access & auto data sync",
      "Advanced anomaly detection & custom KPI alerts",
      "Unlimited users with role-based permissions",
      "Audit logs & activity tracking",
      "Custom workspaces & white-label branding",
      "Dedicated onboarding & priority support",
      "Custom feature development & SLAs",
    ],
  },
];

// Helper to format ms to countdown string
function formatTime(ms) {
  if (ms <= 0) return "00d 00h 00m 00s";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(
    2,
    "0"
  )}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export default function UpgradeModal() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
   // New state for button animation
  const [isClicked, setIsClicked] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Free");
  const [timeLeft, setTimeLeft] = useState(7 * 24 * 3600 * 1000); // 7 days in ms
  


  // Simulate splash delay then show modal
  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setShowModal(true);
    }, 3000); // 3 seconds splash screen delay
    return () => clearTimeout(splashTimeout);
  }, []);

  // Countdown timer for discount
  useEffect(() => {
    if (!showModal) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showModal]);

  
  const handleUpgrade = () => {
    if (selectedTier === "Free") return;

    setIsClicked(true);

    setTimeout(() => {
      navigate("/payments");
    }, 200);
  };

  const handleClose = () => {
    setIsClosing(true);
  };

  const onAnimationEnd = (e) => {
    if (isClosing && e.animationName === "modalClose") {
      setShowModal(false);
      setIsClosing(false);
    }
  };

  if (!showModal) return null;

  return (
    <>
      <style jsx>{`
        .backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 999;
        }
        
        .backdrop-open {
          animation: backdropOpen 0.3s ease-out;
        }
        
        .backdrop-close {
          animation: backdropClose 0.3s ease-out;
        }
        
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #111;
          border-radius: 20px;
          padding: 40px;
          max-width: 1600px;
          width: 95vw;
          max-height: 95vh;
          overflow-y: auto;
          z-index: 1000;
          color: #fff;
        }
        
        .modal-open {
          animation: modalOpen 0.5s ease-out;
        }
        
        .modal-close {
          animation: modalClose 0.3s ease-out;
        }
        
        .tier-card {
          border: 2px solid transparent;
        }
        
        .tier-card.selected {
          border-color: #2a9d8f;
        }
        
        .tier-open {
          animation: tierOpen 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(50px);
        }
        
        .tier-close {
          animation: tierClose 0.3s ease-out;
        }
        
        @keyframes backdropOpen {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes backdropClose {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes modalOpen {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes modalClose {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }
        
        @keyframes tierOpen {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes tierClose {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
        
        @media (max-width: 768px) {
          .tier-container {
            flex-direction: column !important;
            gap: 20px !important;
          }
          
          .modal {
            padding: 20px;
            width: 95vw;
            max-height: 95vh;
          }
          
          .tier-card {
            min-height: auto !important;
            height: auto !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          .tier-card ul {
            flex-grow: 1 !important;
            margin-bottom: 16px !important;
          }
          
          .tier-card button {
            margin-top: auto !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>

      {/* Backdrop with blur effect */}
      <div className={`backdrop ${isClosing ? "backdrop-close" : "backdrop-open"}`} />

      {/* Modal container */}
      <div
        className={`modal ${isClosing ? "modal-close" : "modal-open"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        onAnimationEnd={onAnimationEnd}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 id="upgrade-modal-title" style={{ margin: 0, color: "#f4a261" }}>
            Choose Your Omnis Plan
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 32,
              cursor: "pointer",
              color: "#fff",
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 17, color: "#bbb" }}>
          Upgrade anytime to unlock unlimited simulations, full analytics, AI-powered features, and more.
        </p>

        {/* Discount info */}
        {selectedTier !== "Free" && (
          <>
            <p
              style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#2a9d8f",
                marginTop: 8,
              }}
            >
              Get <span style={{ color: "#e76f51" }}>20% off</span> if you upgrade within the next 7 days!
            </p>
            <p
              aria-live="polite"
              style={{
                fontWeight: "bold",
                fontSize: 19,
                color: "#264653",
                marginTop: -6,
                marginBottom: 28,
                letterSpacing: 1.2,
              }}
            >
              Offer expires in: {formatTime(timeLeft)}
            </p>
          </>
        )}

        {/* Tier containers */}
        <div
          className="tier-container"
          style={{
            display: "flex",
            gap: 40,
            marginTop: 12,
            justifyContent: "center",
            flexWrap: "nowrap",
          }}
        >
          {tiers.map((tier, index) => {
            const isSelected = selectedTier === tier.name;
            const isFree = tier.isFree;

            return (
              <div
                key={tier.name}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedTier(tier.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedTier(tier.name);
                }}
                className={`tier-card ${isSelected ? "selected" : ""} ${
                  isClosing ? "tier-close" : "tier-open"
                }`}
                style={{
                  animationDelay: `${index * 0.25 + 0.5}s`,
                  flex: "1 1 0",
                  maxWidth: 400,
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#2a9d8f" : "#222",
                  borderRadius: 16,
                  padding: 32,
                  boxShadow: isSelected ? "0 0 25px #2a9d8f" : "none",
                  color: isSelected ? "#fff" : "#ccc",
                  display: "flex",
                  flexDirection: "column",
                  userSelect: "none",
                  minHeight: 520,
                  transition: "background-color 0.3s ease",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>{tier.name}</h3>
                <p
                  className="price"
                  style={{
                    fontWeight: "bold",
                    fontSize: 22,
                    marginTop: 0,
                    marginBottom: 18,
                    color: isSelected ? "#ffd166" : "#fff",
                  }}
                >
                  {tier.price}
                </p>
                <ul style={{ flexGrow: 1, paddingLeft: 20, fontSize: 16, lineHeight: 1.6 }}>
                  {tier.description.map((desc, i) => (
                    <li key={i} style={{ marginBottom: 10 }}>
                      {desc}
                    </li>
                  ))}
                </ul>
                {isFree ? (
                  <button
                    disabled
                    style={{
                      marginTop: 22,
                      padding: "14px 0",
                      fontWeight: "bold",
                      borderRadius: 8,
                      border: "2px solid #555",
                      backgroundColor: "transparent",
                      color: "#555",
                      cursor: "not-allowed",
                      fontSize: 16,
                    }}
                    aria-disabled="true"
                    title="You are currently on the Free plan"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                  className={isClicked ? "btn-clicked" : ""}
                    onClick={handleUpgrade}
                    style={{
                      marginTop: 22,
                      padding: "16px 0",
                      fontWeight: "bold",
                      borderRadius: 8,
                      border: "none",
                      backgroundColor: "#e76f51",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 17,
                      transition: "all 0.3s ease",
                      transform: isClicked ? "scale(1.1)" : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f4a261";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#e76f51";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    aria-label={`Upgrade to ${tier.name} plan`}
    
    
                  >
                    Upgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}