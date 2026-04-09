# VitD Screener dApp — OpenGradient Blockchain

> On-chain ONNX inference · Vitamin D Deficiency Risk Screener  
> Powered by [OpenGradient](https://opengradient.ai)

---

## What it does

Enter 5 clinical inputs (sun exposure, fish intake, skin tone, age, BMI), submit an inference transaction to the **OpenGradient Testnet**, and get a verifiable vitamin D deficiency risk score computed fully on-chain using your uploaded `vitamin_d_deficiency_screener.onnx` model.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| On-chain inference | OpenGradient Testnet (Chain ID 43266) |
| ONNX runtime | `onnxruntime-web` (WASM, in-browser) |
| Wallet | MetaMask / EIP-1193 (`ethers` v6) |
| Hosting | Vercel |

---

## Deploy to Vercel (3 steps)

### 1. Push to GitHub

```bash
cd vitd-screener-dapp
git init
git add .
git commit -m "init: VitD screener dApp on OpenGradient"
gh repo create vitd-screener-dapp --public --push --source=.
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your `vitd-screener-dapp` repo
3. Leave all build settings as defaults — Vercel auto-detects Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**

> ✅ The `vercel.json` in this repo already sets the required  
> `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers  
> needed for ONNX WASM multi-threading.

### 3. Done

Your dApp is live at `https://vitd-screener-dapp.vercel.app` (or your custom domain).

---

## Run locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Wallet setup (optional)

The app works in **demo mode** without a wallet — inference runs locally in the browser using the extracted ONNX weights.

For **real on-chain inference**:
1. Install [MetaMask](https://metamask.io)
2. Click **Connect Wallet** — the app will prompt you to add the OpenGradient Testnet automatically:
   - **RPC**: `https://rpc.opengradient.ai`
   - **Chain ID**: `43266`
   - **Symbol**: `OG`
3. Get testnet OG from the [OpenGradient faucet](https://faucet.opengradient.ai)
4. Submit inference transactions — each costs ~0.004 OG

---

## Model details

```
File:      vitamin_d_deficiency_screener.onnx
IR:        ONNX v7
Graph:     MatMul [1×5] @ [5×1]  →  Add [1×1]  →  Sigmoid  →  vit_d_risk_score
Weights:   W = [1.5, 1.3, 1.2, 1.0, 0.8]   B = −3.5
Inputs:    features [1×5] float32  (sun exposure, fish intake, skin tone, age, BMI)
Output:    vit_d_risk_score [1×1] float32  ∈ [0, 1]
```

Risk thresholds:

| Score | Risk level |
|---|---|
| < 0.30 | Low — likely sufficient |
| 0.30 – 0.60 | Moderate — consider supplementation |
| > 0.60 | High — clinical testing advised |

---

## Project structure

```
vitd-screener-dapp/
├── public/
│   ├── vitamin_d_deficiency_screener.onnx   ← model served statically
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx / .module.css
│   │   ├── FeaturePanel.jsx / .module.css
│   │   ├── TxPanel.jsx / .module.css
│   │   ├── ResultPanel.jsx / .module.css
│   │   └── ChainInfo.jsx / .module.css
│   ├── hooks/
│   │   ├── useOnnxInference.js   ← loads ONNX model, runs inference
│   │   └── useWallet.js          ← MetaMask + OG network switching
│   ├── App.jsx / App.module.css
│   ├── main.jsx
│   ├── index.css
│   └── constants.js              ← features, risk levels, model meta
├── index.html
├── vite.config.js
├── vercel.json                   ← COEP/COOP headers for WASM
└── package.json
```

---

## Disclaimer

This application is for informational and demonstration purposes only.  
It does not constitute medical advice. Always consult a qualified healthcare professional.
