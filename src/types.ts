/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PropertyFeatures {
  city: string;
  locality: string;
  areaSqft: number;
  bhk: number;
  bathrooms: number;
  parking: number;
  propertyAge: number; // years
  propertyType: 'Apartment' | 'Independent House' | 'Villa' | 'Builder Floor';
  furnishingStatus: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  features: PropertyFeatures;
  predictedPrice: number;
  confidenceScore: number; // 0 to 100
  pricePerSqft: number;
  modelUsed: string;
  comparisons: {
    modelName: string;
    price: number;
    mae: number;
    r2: number;
  }[];
  shapExplanation: {
    feature: string;
    impact: number; // price difference in INR
    description: string;
  }[];
  similarProperties: SimilarProperty[];
  recommendations: string[];
  aiAssessment?: string;
}

export interface SimilarProperty {
  id: string;
  locality: string;
  areaSqft: number;
  bhk: number;
  price: number;
  similarityScore: number; // 0 to 100
}

export interface ModelMetrics {
  name: string;
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  trainedAt: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface DatasetUploadLog {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  rowCount: number;
  status: 'Success' | 'Processing' | 'Failed';
  removedDuplicates: number;
  nullValuesFilled: number;
  outliersDetected: number;
}

export interface MarketTrend {
  city: string;
  locality: string;
  avgPricePerSqft: number;
  annualGrowth: number; // percentage, e.g. 8.4
  hotspotScore: number; // out of 100
  demandIndex: 'High' | 'Medium' | 'Low';
  coordinates: {
    lat: number;
    lng: number;
  };
}
