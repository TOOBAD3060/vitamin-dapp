import React, { useEffect, useState } from "react";
import styles from "./TxPanel.module.css";
import { MODEL_META } from "../constants";

const TX_STEPS = [
  { id: 0, msg: "Encoding feature tensor [1×5] float32…" },
  { id: 1, msg: "Signing transaction with wallet…" },
  { id: 2, msg: "Broadcasting to OpenGradient RPC…" },
  { id: 3, msg: "Inference node received calldata…" },
  { id: 4, msg: "ONNX runtime: MatMul → Add → Sigmoid…" },
  { id: 5, msg: "Reading vit_d_risk_score output tensor…" },
  { id: 6, msg: "Writing result to chain state…" },
];

function randomHex(len) {
  return Array.from({ length: len }, () =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");
}

export default function TxPanel({ phase, txHash, score, blockNumber, onRun, walletConnected, onnxReady }) {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    if (phase !== "running") { setVisibleSteps(0); return; }
    setVisibleSteps(1);
    const interval = setInterval(() => {
      setVisibleSteps((s) => {
        if (s >= TX_STEPS.length) { clearInterval(interval); return s; }
        return s + 1;
      });
    }, 380);
    return () => clearInterval(interval);
  }, [phase]);

  const isIdle    = phase === "idle";
  const isRunning = phase === "running";
  const isDone    = phase === "done";

  return (
    <div className={styles.wrap}>
      {/* Terminal log — shown while running or done */}
      {(isRunning || isDone) && (
        <div className={styles.terminal}>
          <div className={styles.termHeader}>
            <span className={styles.termDot} style={{ background: "#ef4444" }} />
            <span className={styles.termDot} style={{ background: "#f59e0b" }} />
            <span className={styles.termDot} style={{ background: "#22c55e" }} />
            <span className={styles.termTitle}>opengradient-inference</span>
          </div>

          <div className={styles.termBody}>
            <div className={styles.termLine}>
              <span className={styles.prompt}>$</span>
              <span className={styles.cmd}>og-run --model {MODEL_META.name} --network testnet</span>
            </div>

            {TX_STEPS.slice(0, isRunning ? visibleSteps : TX_STEPS.length).map((step, i) => (
              <div key={step.id} className={styles.termLine}>
                <span
                  className={styles.stepIcon}
                  style={{ color: isRunning && i === visibleSteps - 1 ? "#facc15" : "#22c55e" }}
                >
                  {isRunning && i === visibleSteps - 1 ? "▶" : "✓"}
                </span>
                <span className={styles.stepMsg}>{step.msg}</span>
              </div>
            ))}

            {isDone && (
              <div className={styles.termResult}>
                <div className={styles.resultLine}>
                  <span style={{ color: "#86efac" }}>✓ inference complete</span>
                  <span style={{ color: "#475569", marginLeft: 12 }}>block #{blockNumber?.toLocaleString()}</span>
                </div>
                <div className={styles.resultLine} style={{ marginTop: 4 }}>
                  <span style={{ color: "#64748b" }}>tx:</span>
                  <span className={styles.hashText}>{txHash}</span>
                </div>
                <div className={styles.resultLine} style={{ marginTop: 6 }}>
                  <span style={{ color: "#7dd3fc" }}>vit_d_risk_score</span>
                  <span style={{ color: "#e2e8f0", marginLeft: 8 }}>→</span>
                  <span className={styles.scoreValue}>{score?.toFixed(8)}</span>
                </div>
                {txHash && txHash.startsWith("0x") && (
                  <a
                    href={`${MODEL_META.explorer}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.explorerLink}
                  >
                    View on explorer ↗
                  </a>
                )}
              </div>
            )}

            {isRunning && (
              <div className={styles.termLine}>
                <span className={styles.cursor} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Run button */}
      <button
        className={`${styles.runBtn} ${isRunning ? styles.running : ""}`}
        onClick={onRun}
        disabled={isRunning || !onnxReady}
      >
        {!onnxReady
          ? "Loading ONNX runtime…"
          : isRunning
          ? "Running on-chain inference…"
          : walletConnected
          ? "⬡  Submit Inference Transaction"
          : "Connect Wallet & Run Inference"}
      </button>

      {!walletConnected && (
        <p className={styles.hint}>
          Uses MetaMask to sign a transaction on OpenGradient Testnet.
          No wallet? Demo mode runs locally.
        </p>
      )}
    </div>
  );
}
