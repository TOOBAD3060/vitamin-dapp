import React from "react";
import styles from "./ChainInfo.module.css";
import { MODEL_META } from "../constants";

export default function ChainInfo({ blockNumber, gasUsed, txHash }) {
  const rows = [
    ["Network",    MODEL_META.network],
    ["Chain ID",   MODEL_META.chainId],
    ["RPC",        MODEL_META.rpc.replace("https://", "")],
    ["Block",      blockNumber ? `#${blockNumber.toLocaleString()}` : "—"],
    ["Gas used",   gasUsed     ? `${gasUsed} OG`                   : MODEL_META.gasEst + " (est.)"],
    ["Model",      MODEL_META.name + ".onnx"],
    ["Operator",   MODEL_META.operator],
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.hexIcon}>⬡</span>
        Network status
      </div>

      {rows.map(([k, v]) => (
        <div key={k} className={styles.row}>
          <span className={styles.key}>{k}</span>
          <span className={styles.val}>{v}</span>
        </div>
      ))}

      {txHash && (
        <a
          href={`${MODEL_META.explorer}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.explorerBtn}
        >
          View transaction ↗
        </a>
      )}

      <div className={styles.disclaimer}>
        Results are for informational purposes only and do not constitute
        medical advice. Consult a qualified clinician for diagnosis.
      </div>
    </div>
  );
}
