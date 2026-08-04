export interface DefectDetail {
  severity: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  explanation?: string;
  recommendation?: string;
}

export interface TechnicalMetrics {
  width: number;
  height: number;
  megapixels: number;
  mean_brightness: number;
  median_brightness: number;
  std_brightness: number;
  laplacian_variance: number;
  mean_edge_sharpness: number;
  highlight_clipping_percent: number;
  shadow_clipping_percent: number;
  glare_pixel_percent: number;
}

export interface IQAModelDetail {
  name: string;
  raw_score?: number | null;
  normalized_score?: number | null;
  device: string;
}

export interface ScoreBreakdownDetail {
  pretrained_weight: number;
  technical_weight: number;
  weighted_defect_severity: number;
}

export interface AnalysisResponse {
  analysis_id: string;
  filename: string;
  overall_quality_score: number;
  quality_category: 'Worst' | 'Average' | 'Good' | 'Best';
  suitability: 'Not Suitable' | 'Needs Improvement' | 'Suitable' | 'Highly Suitable';
  confidence: number;
  processing_time_ms: number;
  model_mode?: string;
  iqa_model?: IQAModelDetail;
  technical_quality_score?: number;
  final_quality_score?: number;
  score_breakdown?: ScoreBreakdownDetail;
  defects: {
    blur: DefectDetail;
    glare: DefectDetail;
    darkness: DefectDetail;
    overexposure: DefectDetail;
    motion_artifacts: DefectDetail;
    occlusion: DefectDetail;
    poor_framing: DefectDetail;
    low_resolution: DefectDetail;
  };
  technical_metrics: TechnicalMetrics;
  recommendations: string[];
  mode?: string;
  created_at?: string;
}

export interface ModelStatusResponse {
  mode: string;
  model_mode: string;
  pretrained_iqa_name: string;
  device: string;
  loaded: boolean;
  version: string;
  fallback_available: boolean;
  is_trained_weights_loaded: boolean;
  weights_path: string;
  supported_defects: string[];
  backbone_architecture: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
  email: string;
}
