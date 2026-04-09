import { useState, useEffect, useRef } from "react";

// Weights extracted from vitamin_d_deficiency_screener.onnx
// MatMul -> Add -> Sigmoid
const W_VALUES = [1.5, 1.3, 1.2, 1.0, 0.8]; // shape [5,1]
const B_VALUE  = -3.5;                         // shape [1,1]

// Input ranges for normalization [min, max]
const RANGES = [
  [0, 120],  // sunExposure
  [0, 14],   // fishIntake
  [1, 5],    // skinTone
  [18, 90],  // age
  [16, 45],  // bmi
];

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function normalize(rawFeatures) {
  return rawFeatures.map((v, i) => {
    const [lo, hi] = RANGES[i];
    return (v - lo) / (hi - lo);
  });
}

// Pure JS inference fallback (matches ONNX graph exactly)
function runFallbackModel(rawFeatures) {
  const norm = normalize(rawFeatures);
  // MatMul [1x5] @ [5x1] + [1x1] -> Sigmoid
  const dot = norm.reduce((sum, v, i) => sum + v * W_VALUES[i], 0);
  return sigmoid(dot + B_VALUE);
}

export function useOnnxInference() {
  const sessionRef = useRef(null);
  const [onnxReady, setOnnxReady] = useState(false);
  const [onnxError, setOnnxError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadModel() {
      try {
        const ort = await import("onnxruntime-web");
        ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/";
        const session = await ort.InferenceSession.create(
          "/vitamin_d_deficiency_screener.onnx",
          { executionProviders: ["wasm"] }
        );
        if (!cancelled) {
          sessionRef.current = session;
          setOnnxReady(true);
        }
      } catch (err) {
        console.warn("ONNX session failed, using fallback model:", err.message);
        if (!cancelled) setOnnxError(err.message);
        // Fallback still works — runInference uses pure JS model
        if (!cancelled) setOnnxReady(true);
      }
    }
    loadModel();
    return () => { cancelled = true; };
  }, []);

  async function runInference(rawFeatures) {
    // Try ONNX runtime first
    if (sessionRef.current) {
      try {
        const ort = await import("onnxruntime-web");
        const norm = normalize(rawFeatures);

        const featTensor = new ort.Tensor("float32", new Float32Array(norm), [1, 5]);
        const wTensor    = new ort.Tensor("float32", new Float32Array(W_VALUES), [5, 1]);
        const bTensor    = new ort.Tensor("float32", new Float32Array([B_VALUE]), [1, 1]);

        const results = await sessionRef.current.run({
          features: featTensor,
          W: wTensor,
          B: bTensor,
        });

        return results["vit_d_risk_score"].data[0];
      } catch (err) {
        console.warn("ONNX run failed, using fallback:", err.message);
      }
    }
    // Fallback: pure JS model
    return runFallbackModel(rawFeatures);
  }

  // Synchronous preview (no async overhead — used for live slider updates)
  function previewScore(rawFeatures) {
    return runFallbackModel(rawFeatures);
  }

  return { onnxReady, onnxError, runInference, previewScore };
}
