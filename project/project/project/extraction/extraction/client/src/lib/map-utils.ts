import { type Sample } from "@shared/schema";
import { type MockLocation } from "@/data/mock-locations";

export function getMarkerColor(category: string): string {
  switch (category?.toLowerCase()) {
    case 'safe':
    case 'low risk':
      return '#22c55e'; // green-500
    case 'moderate':
    case 'medium risk':
      return '#f59e0b'; // amber-500
    case 'critical':
    case 'high risk':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

export function getRecommendation(category: string): string {
  switch (category) {
    case "Safe":
      return "Safe for drinking";
    case "Moderate":
      return "Needs monitoring";
    case "Critical":
      return "Unsafe - avoid usage";
    default:
      return "Unknown status";
  }
}

export function createMarkerIcon(category: string) {
  const color = getMarkerColor(category);
  
  // Enhanced SVG marker with better visibility
  const svg = `
    <svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
      <!-- Drop shadow -->
      <path d="M15 2C8.4 2 3 7.4 3 14c0 8.5 12 29 12 29s12-20.5 12-29c0-6.6-5.4-12-12-12z" 
            fill="rgba(0,0,0,0.2)" transform="translate(1,1)"/>
      <!-- Main marker -->
      <path d="M15 0C8.4 0 3 5.4 3 12c0 7 12 31 12 31s12-24 12-31c0-6.6-5.4-12-12-12z" 
            fill="${color}" stroke="white" stroke-width="2"/>
      <!-- Inner circle -->
      <circle cx="15" cy="12" r="6" fill="white" stroke="${color}" stroke-width="2"/>
      <!-- Center dot -->
      <circle cx="15" cy="12" r="3" fill="${color}"/>
    </svg>
  `;
  
  return {
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [30, 45] as [number, number],
    iconAnchor: [15, 45] as [number, number],
    popupAnchor: [0, -45] as [number, number],
  };
}

export const INDIA_BOUNDS = {
  center: [20.5937, 78.9629] as [number, number],
  zoom: 5,
};
