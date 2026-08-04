import React from 'react';
import { Info, ShieldCheck, Cpu, Code, BookOpen } from 'lucide-react';

export const AboutLimitationsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-grid-pattern">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">About & System Design</h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          Technical specifications, multi-task architecture details, and responsible AI disclosures for Image Quality Assessment AI.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <span>Multi-Task Deep Vision Architecture</span>
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          The core model employs a shared visual feature backbone (ConvNeXt-Tiny / EfficientNet-B0) coupled with multiple parallel task heads:
        </p>
        <ul className="list-disc list-inside text-xs text-gray-300 space-y-2 pl-2">
          <li><strong>Defect Presence Head:</strong> Multi-label binary classification logits for 8 defect categories.</li>
          <li><strong>Defect Severity Head:</strong> Continuous severity regression normalized [0, 1].</li>
          <li><strong>Overall Quality Score Head:</strong> Continuous overall quality regression.</li>
          <li><strong>Suitability Head:</strong> 4-class categorization (Not Suitable, Needs Improvement, Suitable, Highly Suitable).</li>
          <li><strong>Uncertainty Head:</strong> Output confidence estimation.</li>
        </ul>
      </div>

      <div className="glass-panel rounded-3xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <span>Explainable Classical OpenCV Layer</span>
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          To prevent black-box failures, AI predictions are fused with deterministic computer vision statistics:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
          <div className="bg-dark-900/60 p-4 rounded-xl border border-purple-900/30">
            <strong className="text-purple-300 font-bold block mb-1">Blur & Sharpness</strong>
            Laplacian variance and Sobel gradient magnitude histogram analysis.
          </div>
          <div className="bg-dark-900/60 p-4 rounded-xl border border-purple-900/30">
            <strong className="text-purple-300 font-bold block mb-1">Glare & Highlights</strong>
            HSV value channel saturation thresholds and specular reflection ratio.
          </div>
          <div className="bg-dark-900/60 p-4 rounded-xl border border-purple-900/30">
            <strong className="text-purple-300 font-bold block mb-1">Darkness & Shadow</strong>
            Luminance histogram distribution and shadow pixel clipping percentage.
          </div>
          <div className="bg-dark-900/60 p-4 rounded-xl border border-purple-900/30">
            <strong className="text-purple-300 font-bold block mb-1">Framing & Geometry</strong>
            Boundary touch ratio and edge density near image borders.
          </div>
        </div>
      </div>
    </div>
  );
};
