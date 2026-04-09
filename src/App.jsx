import React, { useState, useCallback } from "react";
import styles from "./App.module.css";

import Header      from "./components/Header";
import FeaturePanel from "./components/FeaturePanel";
import TxPanel     from "./components/TxPanel";
import ResultPanel from "./components/ResultPanel";
import ChainInfo   from "./components/ChainInfo";

import { useWallet }        from "./hooks/useWallet";
import { useOnnxInference } from "./hooks/useOnnxInference";
import { FEATURES }         from "./constants";

const DEFAULT_VALUES = Object.fromEntries(FEATURES.map((f) => [f.id, f.default]));

function randomHex(len) {
  return Array.from({ length: len }, () =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");
}

export default function App() {
  const [values, setValues]           = useState(DEFAULT_VALUES);
  const [phase, setPhase]             = useState("idle");   // idle | running | done
  const [txHash, setTxHash]           = useState(null);
  const [resultScore, setResultScore] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [gasUsed, setGasUsed]         = useState(null);

  const wallet = useWallet();
  const { onnxReady, runInference, previewScore } = useOnnxInference();

  const liveScore   = previewScore(FEATURES.map((f) => values[f.id]));
  const displayScore = resultScore ?? liveScore;

  function handleSliderChange(id, val) {
    setValues((prev) => ({ ...prev, [id]: val }));
  }

  const handleRun = useCallback(async () => {
    // Connect wallet if not connected yet
    if (!wallet.address) {
      const ok = await wallet.connect();
      // In demo mode (no MetaMask) we still proceed
      if (!ok && wallet.hasMetaMask) return;
    }

    setPhase("running");
    setResultScore(null);
    setTxHash(null);
    setBlockNumber(null);
    setGasUsed(null);

    // Simulate blockchain latency (3–4 s for testnet feel)
    await new Promise((r) => setTimeout(r, 3200));

    const rawFeatures = FEATURES.map((f) => values[f.id]);
    const score       = await runInference(rawFeatures);

    // Generate a realistic-looking tx hash and block
    const hash  = "0x" + randomHex(64);
    const block = 4_291_000 + Math.floor(Math.random() * 2000);

    setResultScore(score);
    setTxHash(hash);
    setBlockNumber(block);
    setGasUsed("0.0039");
    setPhase("done");
  }, [wallet, values, runInference]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>

        <Header wallet={wallet} onConnect={wallet.connect} />

        <div className={styles.grid}>

          {/* ── LEFT COLUMN ── */}
          <div className={styles.leftCol}>
            <FeaturePanel values={values} onChange={handleSliderChange} />
            <TxPanel
              phase={phase}
              txHash={txHash}
              score={resultScore}
              blockNumber={blockNumber}
              onRun={handleRun}
              walletConnected={!!wallet.address}
              onnxReady={onnxReady}
            />
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className={styles.rightCol}>
            <ResultPanel
              score={displayScore}
              values={values}
              isVerified={phase === "done"}
              isLive={phase === "idle"}
            />
            <ChainInfo
              blockNumber={blockNumber}
              gasUsed={gasUsed}
              txHash={txHash}
            />
          </div>

        </div>

        <footer className={styles.footer}>
          <span>Built on <strong>OpenGradient</strong> · ONNX on-chain inference</span>
          <span>·</span>
          <span>Model: <code>vitamin_d_deficiency_screener.onnx</code></span>
          <span>·</span>
          <a
            href="https://opengradient.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            opengradient.ai ↗
          </a>
        </footer>
      </div>
    </div>
  );
}
