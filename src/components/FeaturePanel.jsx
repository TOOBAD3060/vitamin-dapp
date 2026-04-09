import React from "react";
import styles from "./FeaturePanel.module.css";
import { FEATURES } from "../constants";

function SliderRow({ feature, value, onChange }) {
  const pct = ((value - feature.min) / (feature.max - feature.min)) * 100;

  return (
    <div className={styles.row}>
      <div className={styles.rowHeader}>
        <span className={styles.icon}>{feature.icon}</span>
        <div className={styles.labelWrap}>
          <label className={styles.label}>{feature.label}</label>
          <span className={styles.detail}>{feature.detail}</span>
        </div>
        <span className={styles.value}>
          {typeof value === "number" && value % 1 !== 0
            ? value.toFixed(1)
            : value}
          <span className={styles.unit}>{feature.unit}</span>
        </span>
      </div>

      <div className={styles.sliderWrap}>
        <input
          type="range"
          min={feature.min}
          max={feature.max}
          step={feature.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--blue-400) ${pct}%, var(--gray-200) ${pct}%)`,
          }}
        />
        <div className={styles.sliderLabels}>
          <span>{feature.min}</span>
          <span>{feature.max}</span>
        </div>
      </div>
    </div>
  );
}

export default function FeaturePanel({ values, onChange }) {
  return (
    <div className={styles.panel}>
      <div className={styles.sectionLabel}>Clinical Inputs</div>
      {FEATURES.map((f) => (
        <SliderRow
          key={f.id}
          feature={f}
          value={values[f.id]}
          onChange={(v) => onChange(f.id, v)}
        />
      ))}
    </div>
  );
}
