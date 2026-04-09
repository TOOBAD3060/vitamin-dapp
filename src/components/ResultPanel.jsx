import React from "react";
import styles from "./ResultPanel.module.css";
import { FEATURES, getRisk, getInterpretation } from "../constants";

// Weights mirror the ONNX model
const W = [1.5, 1.3, 1.2, 1.0, 0.8];
const RANGES = [[0,120],[0,14],[1,5],[18,90],[16,45]];

function normalize(vals) {
  return FEATURES.map((f, i) => {
    const [lo, hi] = RANGES[i];
    return (vals[f.id] - lo) / (hi - lo);
  });
}

function SunGauge({ score, risk }) {
  const pct     = Math.round(score * 100);
  const angle   = score * 180 - 90;  // -90 (left) → +90 (right)
  const r       = 80;
  const cx      = 100;
  const cy      = 100;

  return (
    <div className={styles.gaugeWrap}>
      <svg width="220" height="120" viewBox="0 0 200 110" className={styles.gaugeSvg}>
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#0F6E56" />
            <stop offset="45%"  stopColor="#E49B0F" />
            <stop offset="100%" stopColor="#993C1D" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--gray-200)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Coloured arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Needle */}
        <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
          <line
            x1={cx} y1={cy}
            x2={cx} y2={cy - r + 8}
            stroke={risk.colorHex}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="6" fill={risk.colorHex} />
          <circle cx={cx} cy={cy} r="3" fill="#fff" />
        </g>
        {/* Labels */}
        <text x="14" y="114" fontSize="10" fill="#94a3b8" fontFamily="DM Sans,sans-serif">LOW</text>
        <text x="164" y="114" fontSize="10" fill="#94a3b8" fontFamily="DM Sans,sans-serif">HIGH</text>
      </svg>

      <div className={styles.gaugeScore} style={{ color: risk.colorHex }}>
        {pct}<span className={styles.gaugeUnit}>%</span>
      </div>
      <span
        className={styles.riskBadge}
        style={{
          background: risk.bgHex,
          color:      risk.colorHex,
          border:     `1.5px solid ${risk.border}`,
        }}
      >
        {risk.label}
        <span className={styles.riskSub}> · {risk.sublabel}</span>
      </span>
    </div>
  );
}

function FeatureBars({ values }) {
  const norm     = normalize(values);
  const contribs = norm.map((v, i) => Math.abs(v * W[i]));
  const total    = contribs.reduce((a, b) => a + b, 0) || 1;

  return (
    <div className={styles.bars}>
      <div className={styles.sectionLabel}>Feature contributions</div>
      {FEATURES.map((f, i) => {
        const pct = (contribs[i] / total) * 100;
        return (
          <div key={f.id} className={styles.barRow}>
            <div className={styles.barMeta}>
              <span className={styles.barLabel}>{f.label}</span>
              <span className={styles.barPct}>{pct.toFixed(1)}%</span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${pct}%`,
                  background: f.protective
                    ? "var(--teal-400)"
                    : "var(--coral-400)",
                }}
              />
            </div>
          </div>
        );
      })}
      <div className={styles.barLegend}>
        <span><span className={styles.dot} style={{ background: "var(--teal-400)" }} /> protective</span>
        <span><span className={styles.dot} style={{ background: "var(--coral-400)" }} /> risk factor</span>
      </div>
    </div>
  );
}

function Interpretation({ score, isVerified }) {
  const risk    = getRisk(score);
  const interp  = getInterpretation(score);

  return (
    <div
      className={styles.interp}
      style={{ background: risk.bgHex, borderColor: risk.border }}
    >
      {isVerified && (
        <div className={styles.verifiedBadge}>
          ✓ On-chain verified
        </div>
      )}
      <div className={styles.interpHeadline} style={{ color: risk.colorHex }}>
        {interp.headline}
      </div>
      <p className={styles.interpBody} style={{ color: risk.colorHex }}>
        {interp.body}
      </p>
      <div className={styles.interpAction} style={{ color: risk.colorHex }}>
        → {interp.action}
      </div>
    </div>
  );
}

export default function ResultPanel({ score, values, isVerified, isLive }) {
  const risk = getRisk(score);

  return (
    <div className={styles.panel}>
      <div className={styles.sectionLabel}>
        {isVerified ? "On-chain result" : "Live preview"}
      </div>

      <SunGauge score={score} risk={risk} />

      <div className={styles.divider} />

      <FeatureBars values={values} />

      <div className={styles.divider} />

      <Interpretation score={score} isVerified={isVerified} />
    </div>
  );
}
