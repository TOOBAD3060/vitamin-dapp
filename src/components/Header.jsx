import React from "react";
import styles from "./Header.module.css";
import { MODEL_META } from "../constants";

export default function Header({ wallet, onConnect }) {
  const { address, shortAddress, isConnecting, isOnOGChain, hasMetaMask } = wallet;

  return (
    <header className={styles.header}>
      {/* Decorative circles */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} />
            OpenGradient Blockchain · ONNX On-Chain Inference
          </div>
          <h1 className={styles.title}>
            Vitamin D Deficiency<br />
            <em>Risk Screener</em>
          </h1>
          <p className={styles.subtitle}>
            Clinical features → on-chain sigmoid model → verifiable risk score
          </p>
        </div>

        <div className={styles.right}>
          {address ? (
            <div className={styles.walletConnected}>
              <div className={styles.walletDot} />
              <div>
                <div className={styles.walletAddr}>{shortAddress}</div>
                <div className={styles.walletNet}>
                  {isOnOGChain ? "OpenGradient Testnet" : "⚠ Switch network"}
                </div>
              </div>
            </div>
          ) : (
            <button
              className={styles.connectBtn}
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting…" : hasMetaMask ? "Connect Wallet" : "Use Demo Mode"}
            </button>
          )}
        </div>
      </div>

      {/* Model pills */}
      <div className={styles.pills}>
        {[
          ["Model",   MODEL_META.type],
          ["Inputs",  `${MODEL_META.inputs} features`],
          ["Output",  MODEL_META.output],
          ["Network", MODEL_META.network],
          ["CID",     MODEL_META.cid.slice(0, 18) + "…"],
        ].map(([k, v]) => (
          <span key={k} className={styles.pill}>
            <span className={styles.pillKey}>{k}:</span> {v}
          </span>
        ))}
      </div>
    </header>
  );
}
