export const FEATURES = [
  {
    id:      "sunExposure",
    label:   "Daily sun exposure",
    unit:    "min / day",
    min:     0,
    max:     120,
    default: 20,
    step:    5,
    icon:    "☀",
    detail:  "Time spent outdoors in direct sunlight",
    protective: true, // higher = lower risk
  },
  {
    id:      "fishIntake",
    label:   "Fatty fish intake",
    unit:    "meals / week",
    min:     0,
    max:     14,
    default: 1,
    step:    1,
    icon:    "◉",
    detail:  "Salmon, mackerel, sardines, herring",
    protective: true,
  },
  {
    id:      "skinTone",
    label:   "Skin melanin index",
    unit:    "scale 1 – 5",
    min:     1,
    max:     5,
    default: 3,
    step:    1,
    icon:    "◈",
    detail:  "1 = very fair · 5 = very deep",
    protective: false, // higher = higher risk (more melanin blocks UV)
  },
  {
    id:      "age",
    label:   "Age",
    unit:    "years",
    min:     18,
    max:     90,
    default: 35,
    step:    1,
    icon:    "◷",
    detail:  "Older skin synthesises less vitamin D",
    protective: false,
  },
  {
    id:      "bmi",
    label:   "Body mass index",
    unit:    "kg / m²",
    min:     16,
    max:     45,
    default: 24,
    step:    0.5,
    icon:    "◆",
    detail:  "Higher BMI sequesters vitamin D in adipose tissue",
    protective: false,
  },
];

export function getRisk(score) {
  if (score < 0.30) return {
    label:    "Low Risk",
    sublabel: "Likely sufficient",
    color:    "var(--teal-600)",
    colorHex: "#0F6E56",
    bg:       "var(--teal-50)",
    bgHex:    "#E1F5EE",
    border:   "var(--teal-100)",
    level:    0,
  };
  if (score < 0.60) return {
    label:    "Moderate Risk",
    sublabel: "Consider supplementation",
    color:    "var(--amber-600)",
    colorHex: "#854F0B",
    bg:       "var(--amber-50)",
    bgHex:    "#FAEEDA",
    border:   "var(--amber-100)",
    level:    1,
  };
  return {
    label:    "High Risk",
    sublabel: "Clinical testing advised",
    color:    "var(--coral-600)",
    colorHex: "#993C1D",
    bg:       "var(--coral-50)",
    bgHex:    "#FAECE7",
    border:   "var(--coral-100)",
    level:    2,
  };
}

export function getInterpretation(score) {
  if (score < 0.30) return {
    headline: "Adequate vitamin D status likely",
    body: "Your profile suggests sufficient vitamin D synthesis from sun exposure and dietary sources. Continue maintaining a balanced lifestyle with regular outdoor activity.",
    action: "Routine monitoring is sufficient. Annual check-up recommended.",
  };
  if (score < 0.60) return {
    headline: "Moderate deficiency risk detected",
    body: "Several factors in your profile may be limiting vitamin D production or intake. Increased sun exposure (10–30 min midday) and dietary sources are advisable.",
    action: "Consider supplementation at 1,000 – 2,000 IU/day. Consult your physician.",
  };
  return {
    headline: "High deficiency risk — clinical attention advised",
    body: "Your profile indicates a combination of factors that significantly elevate vitamin D deficiency risk. Low sun exposure, limited dietary intake, or biological factors may be contributing.",
    action: "Request a serum 25-hydroxyvitamin D test. Supplementation at 2,000 – 4,000 IU/day often indicated.",
  };
}

export const MODEL_META = {
  name:      "vitamin_d_deficiency_screener",
  cid:       "bafkreihjv8qzwt3nqjklmvitd2025abcdef1234567",
  type:      "Logistic Regression",
  inputs:    5,
  output:    "Risk score [0 – 1]",
  operator:  "MatMul → Add → Sigmoid",
  network:   "OpenGradient Testnet",
  chainId:   43266,
  rpc:       "https://rpc.opengradient.ai",
  explorer:  "https://explorer.opengradient.ai",
  gasEst:    "~0.0042 OG",
};
