import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, AlertTriangle, CheckCircle, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadDropzoneProps {
  onAnalyze: (file: File) => Promise<void>;
  isLoading: boolean;
}

const ANALYSIS_STAGES = [
  'Validating image format & integrity...',
  'Reading EXIF metadata & orientation...',
  'Preprocessing pixel matrices...',
  'Running multi-task neural vision model...',
  'Calculating classical edge & luminance metrics...',
  'Generating improvement recommendations...',
  'Finalizing assessment results...'
];

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onAnalyze, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  const handleFileDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setErrorMsg(null);
    if (fileRejections && fileRejections.length > 0) {
      const rej = fileRejections[0];
      if (rej.errors[0]?.code === 'file-too-large') {
        setErrorMsg('File is too large! Maximum allowed size is 15 MB.');
      } else {
        setErrorMsg('Invalid file type! Supported: PNG, JPG, JPEG, WEBP, BMP, TIFF');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff', '.tif'],
    },
    maxSize: 15 * 1024 * 1024,
    multiple: false,
  });

  const handleStartAnalysis = async () => {
    if (!selectedFile || isLoading) return;
    setErrorMsg(null);

    // Stage progress interval loop
    let idx = 0;
    setCurrentStageIdx(0);
    const interval = setInterval(() => {
      idx = (idx + 1) % ANALYSIS_STAGES.length;
      setCurrentStageIdx(idx);
    }, 400);

    try {
      await onAnalyze(selectedFile);
    } catch (err: any) {
      if (err.code === 'ECONNABORTED') {
        setErrorMsg('Analysis timed out. Please check network connectivity or try again.');
      } else if (err.response?.status === 413) {
        setErrorMsg('Image size exceeds maximum limit of 15 MB.');
      } else if (err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else if (err.message && err.message.includes('Network Error')) {
        setErrorMsg('Backend server is unreachable. Please verify backend is running on port 8000.');
      } else {
        setErrorMsg(err.message || 'Analysis failed. Please check backend server connection.');
      }
    } finally {
      clearInterval(interval);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`glass-panel rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
            isDragActive
              ? 'border-purple-500 bg-purple-950/30 scale-[1.01]'
              : 'border-purple-900/50 hover:border-purple-500/50 hover:bg-dark-900/60'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/30 shadow-purple-glow">
              <UploadCloud className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {isDragActive ? 'Drop your image here' : 'Drag & drop your image to analyze'}
              </h3>
              <p className="text-sm text-gray-400">
                Supports <span className="text-purple-300 font-semibold">PNG, JPG, WEBP, BMP, TIFF</span> up to 15 MB
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl btn-3d-purple text-white text-sm font-semibold flex items-center space-x-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Browse File</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Image Preview */}
            <div className="relative w-full md:w-64 h-48 rounded-xl overflow-hidden border border-purple-900/50 bg-black/40 flex items-center justify-center group">
              <img
                src={previewUrl!}
                alt="Selected preview"
                className="w-full h-full object-contain"
              />
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-gray-300 hover:text-white hover:bg-red-950/80 border border-red-500/30 transition-all"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Info & Actions */}
            <div className="flex-1 w-full flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Image Ready for Analysis</span>
                </div>
                <h4 className="text-lg font-bold text-white truncate">{selectedFile.name}</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB | Type: {selectedFile.type || 'Image'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleStartAnalysis}
                  disabled={isLoading}
                  className="flex-1 py-3 px-6 rounded-xl btn-3d-purple text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-purple-glow disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-purple-200" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-5 h-5 text-purple-200" />
                      <span>Run AI Quality Assessment</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-300 text-sm font-semibold border border-purple-900/40 hover:border-purple-500/40 transition-all"
                  title="Replace image"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Stages Loader */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 pt-4 border-t border-purple-900/30 flex items-center justify-between text-xs text-purple-300"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>{ANALYSIS_STAGES[currentStageIdx]}</span>
                </div>
                <span className="font-mono text-gray-400">Processing</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Validation Error Banner */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm flex items-center space-x-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}
    </div>
  );
};
