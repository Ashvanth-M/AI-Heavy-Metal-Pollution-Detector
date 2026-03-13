// Mock data for groundwater metal pollution across India
export interface MockLocation {
  id: string;
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  metals: {
    cd: number; // Cadmium (mg/L)
    pb: number; // Lead (mg/L)
    as: number; // Arsenic (mg/L)
    cr: number; // Chromium (mg/L)
    ni: number; // Nickel (mg/L)
    zn: number; // Zinc (mg/L)
    cu?: number; // Copper (mg/L)
    hg?: number; // Mercury (mg/L)
  };
  indices: {
    hpi: number; // Heavy Metal Pollution Index
    hei: number; // Heavy Metal Evaluation Index
    mi: number;  // Metal Index
  };
  // Water quality parameters
  water_params?: {
    pH?: number;
    DO?: number; // Dissolved Oxygen (mg/L)
    TDS?: number; // Total Dissolved Solids (mg/L)
  };
  category: 'Safe' | 'Moderate' | 'Critical';
  value?: number; // Optional value field for uploaded CSV data
  date?: string; // Sample collection date
}

export const mockLocations: MockLocation[] = [
  // Kerala
  {
    id: 'KL001',
    location: 'Kochi',
    state: 'Kerala',
    district: 'Ernakulam',
    latitude: 9.9312,
    longitude: 76.2673,
    metals: { cd: 0.004, pb: 0.030, as: 0.020, cr: 0.050, ni: 0.070, zn: 0.300 },
    indices: { hpi: 120.45, hei: 6.20, mi: 0.474 },
    water_params: { pH: 7.2, DO: 5.8, TDS: 285 },
    category: 'Moderate',
    date: '2025-09-20'
  },
  {
    id: 'KL002',
    location: 'Thiruvananthapuram',
    state: 'Kerala',
    district: 'Thiruvananthapuram',
    latitude: 8.5241,
    longitude: 76.9366,
    metals: { cd: 0.002, pb: 0.015, as: 0.010, cr: 0.030, ni: 0.040, zn: 0.250 },
    indices: { hpi: 85.20, hei: 3.50, mi: 0.347 },
    water_params: { pH: 6.9, DO: 6.2, TDS: 215 },
    category: 'Safe',
    date: '2025-09-19'
  },
  
  // Tamil Nadu
  {
    id: 'TN001',
    location: 'Chennai',
    state: 'Tamil Nadu',
    district: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    metals: { cd: 0.008, pb: 0.045, as: 0.035, cr: 0.070, ni: 0.090, zn: 0.450 },
    indices: { hpi: 142.30, hei: 8.20, mi: 0.596 },
    water_params: { pH: 6.8, DO: 4.3, TDS: 380 },
    category: 'Moderate',
    date: '2025-09-20'
  },
  {
    id: 'TN002',
    location: 'Coimbatore',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    metals: { cd: 0.012, pb: 0.060, as: 0.045, cr: 0.085, ni: 0.120, zn: 0.580 },
    indices: { hpi: 210.45, hei: 12.70, mi: 0.902 },
    water_params: { pH: 6.5, DO: 3.8, TDS: 450 },
    category: 'Critical',
    date: '2025-09-18'
  },
  // Additional Chennai area points with varied risk levels
  {
    id: 'TN003',
    location: 'Chennai North',
    state: 'Tamil Nadu',
    district: 'Chennai',
    latitude: 13.2113,
    longitude: 80.3023,
    metals: { cd: 0.016, pb: 0.078, as: 0.058, cr: 0.098, ni: 0.145, zn: 0.670 },
    indices: { hpi: 255.40, hei: 16.20, mi: 1.065 },
    category: 'Critical',
    water_params: { pH: 6.2, DO: 3.1, TDS: 520 },
    date: '2025-09-20'
  },
  {
    id: 'TN004',
    location: 'Chennai South',
    state: 'Tamil Nadu',
    district: 'Chennai',
    latitude: 12.9516,
    longitude: 80.2462,
    metals: { cd: 0.003, pb: 0.022, as: 0.014, cr: 0.038, ni: 0.048, zn: 0.275 },
    indices: { hpi: 88.70, hei: 4.10, mi: 0.370 },
    category: 'Safe',
    water_params: { pH: 7.4, DO: 6.1, TDS: 245 },
    date: '2025-09-20'
  },
  {
    id: 'TN005',
    location: 'Chennai West',
    state: 'Tamil Nadu',
    district: 'Chennai',
    latitude: 13.0390,
    longitude: 80.1856,
    metals: { cd: 0.010, pb: 0.053, as: 0.042, cr: 0.079, ni: 0.108, zn: 0.510 },
    indices: { hpi: 192.60, hei: 11.50, mi: 0.802 },
    category: 'Critical',
    water_params: { pH: 6.7, DO: 3.9, TDS: 465 },
    date: '2025-09-20'
  },
  {
    id: 'TN006',
    location: 'Chennai East',
    state: 'Tamil Nadu',
    district: 'Chennai',
    latitude: 13.1231,
    longitude: 80.3219,
    metals: { cd: 0.006, pb: 0.038, as: 0.025, cr: 0.059, ni: 0.079, zn: 0.395 },
    indices: { hpi: 142.80, hei: 8.30, mi: 0.602 },
    category: 'Moderate',
    water_params: { pH: 7.0, DO: 4.8, TDS: 335 },
    date: '2025-09-20'
  },
  {
    id: 'TN007',
    location: 'Mahabalipuram',
    state: 'Tamil Nadu',
    district: 'Chengalpattu',
    latitude: 12.6269,
    longitude: 80.1928,
    metals: { cd: 0.002, pb: 0.017, as: 0.011, cr: 0.032, ni: 0.042, zn: 0.260 },
    indices: { hpi: 82.40, hei: 3.70, mi: 0.354 },
    category: 'Safe',
    water_params: { pH: 7.6, DO: 6.5, TDS: 198 },
    date: '2025-09-20'
  },
  
  // Karnataka
  {
    id: 'KA001',
    location: 'Bangalore',
    state: 'Karnataka',
    district: 'Bangalore Urban',
    latitude: 12.9716,
    longitude: 77.5946,
    metals: { cd: 0.006, pb: 0.040, as: 0.025, cr: 0.060, ni: 0.080, zn: 0.400 },
    indices: { hpi: 145.60, hei: 8.40, mi: 0.611 },
    category: 'Moderate'
  },
  {
    id: 'KA002',
    location: 'Mysore',
    state: 'Karnataka',
    district: 'Mysore',
    latitude: 12.2958,
    longitude: 76.6394,
    metals: { cd: 0.003, pb: 0.020, as: 0.015, cr: 0.040, ni: 0.050, zn: 0.280 },
    indices: { hpi: 92.30, hei: 5.10, mi: 0.408 },
    category: 'Safe'
  },
  
  // Maharashtra
  {
    id: 'MH001',
    location: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    metals: { cd: 0.015, pb: 0.075, as: 0.055, cr: 0.095, ni: 0.140, zn: 0.650 },
    indices: { hpi: 245.80, hei: 15.20, mi: 1.030 },
    category: 'Critical'
  },
  {
    id: 'MH002',
    location: 'Pune',
    state: 'Maharashtra',
    district: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    metals: { cd: 0.007, pb: 0.042, as: 0.028, cr: 0.065, ni: 0.085, zn: 0.420 },
    indices: { hpi: 155.40, hei: 9.10, mi: 0.647 },
    category: 'Moderate'
  },
  
  // Gujarat
  {
    id: 'GJ001',
    location: 'Ahmedabad',
    state: 'Gujarat',
    district: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    metals: { cd: 0.010, pb: 0.055, as: 0.040, cr: 0.080, ni: 0.110, zn: 0.520 },
    indices: { hpi: 195.20, hei: 11.80, mi: 0.815 },
    category: 'Critical'
  },
  {
    id: 'GJ002',
    location: 'Vadodara',
    state: 'Gujarat',
    district: 'Vadodara',
    latitude: 22.3072,
    longitude: 73.1812,
    metals: { cd: 0.005, pb: 0.035, as: 0.022, cr: 0.055, ni: 0.075, zn: 0.380 },
    indices: { hpi: 132.70, hei: 7.60, mi: 0.567 },
    category: 'Moderate'
  },
  
  // Rajasthan
  {
    id: 'RJ001',
    location: 'Jaipur',
    state: 'Rajasthan',
    district: 'Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    metals: { cd: 0.009, pb: 0.050, as: 0.038, cr: 0.075, ni: 0.100, zn: 0.480 },
    indices: { hpi: 185.60, hei: 10.90, mi: 0.752 },
    category: 'Critical'
  },
  {
    id: 'RJ002',
    location: 'Jodhpur',
    state: 'Rajasthan',
    district: 'Jodhpur',
    latitude: 26.2389,
    longitude: 73.0243,
    metals: { cd: 0.004, pb: 0.032, as: 0.021, cr: 0.052, ni: 0.072, zn: 0.310 },
    indices: { hpi: 125.80, hei: 7.20, mi: 0.491 },
    category: 'Moderate'
  },
  
  // Delhi
  {
    id: 'DL001',
    location: 'New Delhi',
    state: 'Delhi',
    district: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    metals: { cd: 0.018, pb: 0.085, as: 0.065, cr: 0.110, ni: 0.160, zn: 0.720 },
    indices: { hpi: 280.40, hei: 17.60, mi: 1.158 },
    category: 'Critical'
  },
  
  // Uttar Pradesh
  {
    id: 'UP001',
    location: 'Lucknow',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    latitude: 26.8467,
    longitude: 80.9462,
    metals: { cd: 0.011, pb: 0.058, as: 0.042, cr: 0.082, ni: 0.115, zn: 0.540 },
    indices: { hpi: 205.30, hei: 12.30, mi: 0.848 },
    category: 'Critical'
  },
  {
    id: 'UP002',
    location: 'Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    latitude: 25.3176,
    longitude: 82.9739,
    metals: { cd: 0.014, pb: 0.070, as: 0.050, cr: 0.090, ni: 0.130, zn: 0.620 },
    indices: { hpi: 230.10, hei: 14.20, mi: 0.974 },
    category: 'Critical'
  },
  
  // Bihar
  {
    id: 'BR001',
    location: 'Patna',
    state: 'Bihar',
    district: 'Patna',
    latitude: 25.5941,
    longitude: 85.1376,
    metals: { cd: 0.008, pb: 0.048, as: 0.036, cr: 0.072, ni: 0.095, zn: 0.460 },
    indices: { hpi: 175.20, hei: 10.40, mi: 0.719 },
    category: 'Moderate'
  },
  
  // West Bengal
  {
    id: 'WB001',
    location: 'Kolkata',
    state: 'West Bengal',
    district: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    metals: { cd: 0.013, pb: 0.065, as: 0.048, cr: 0.088, ni: 0.125, zn: 0.600 },
    indices: { hpi: 225.70, hei: 13.80, mi: 0.939 },
    category: 'Critical'
  },
  {
    id: 'WB002',
    location: 'Siliguri',
    state: 'West Bengal',
    district: 'Darjeeling',
    latitude: 26.7271,
    longitude: 88.3953,
    metals: { cd: 0.003, pb: 0.025, as: 0.018, cr: 0.045, ni: 0.060, zn: 0.290 },
    indices: { hpi: 98.40, hei: 5.80, mi: 0.441 },
    category: 'Safe'
  },
  
  // Odisha
  {
    id: 'OD001',
    location: 'Bhubaneswar',
    state: 'Odisha',
    district: 'Khordha',
    latitude: 20.2961,
    longitude: 85.8245,
    metals: { cd: 0.005, pb: 0.038, as: 0.024, cr: 0.058, ni: 0.078, zn: 0.390 },
    indices: { hpi: 138.60, hei: 8.10, mi: 0.593 },
    category: 'Moderate'
  },
  
  // Assam
  {
    id: 'AS001',
    location: 'Guwahati',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    latitude: 26.1445,
    longitude: 91.7362,
    metals: { cd: 0.004, pb: 0.030, as: 0.022, cr: 0.054, ni: 0.074, zn: 0.320 },
    indices: { hpi: 115.30, hei: 6.70, mi: 0.504 },
    category: 'Moderate'
  },
  
  // Telangana
  {
    id: 'TG001',
    location: 'Hyderabad',
    state: 'Telangana',
    district: 'Hyderabad',
    latitude: 17.3850,
    longitude: 78.4867,
    metals: { cd: 0.009, pb: 0.052, as: 0.039, cr: 0.076, ni: 0.105, zn: 0.490 },
    indices: { hpi: 190.80, hei: 11.30, mi: 0.771 },
    category: 'Critical'
  },
  
  // Andhra Pradesh
  {
    id: 'AP001',
    location: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    latitude: 17.6868,
    longitude: 83.2185,
    metals: { cd: 0.007, pb: 0.044, as: 0.030, cr: 0.068, ni: 0.088, zn: 0.430 },
    indices: { hpi: 160.20, hei: 9.50, mi: 0.667 },
    category: 'Moderate'
  },
  
  // Punjab
  {
    id: 'PB001',
    location: 'Amritsar',
    state: 'Punjab',
    district: 'Amritsar',
    latitude: 31.6340,
    longitude: 74.8723,
    metals: { cd: 0.006, pb: 0.040, as: 0.026, cr: 0.062, ni: 0.082, zn: 0.410 },
    indices: { hpi: 150.40, hei: 8.80, mi: 0.626 },
    category: 'Moderate'
  },
  {
    id: 'PB002',
    location: 'Ludhiana',
    state: 'Punjab',
    district: 'Ludhiana',
    latitude: 30.9010,
    longitude: 75.8573,
    metals: { cd: 0.016, pb: 0.080, as: 0.060, cr: 0.100, ni: 0.150, zn: 0.680 },
    indices: { hpi: 260.30, hei: 16.40, mi: 1.086 },
    category: 'Critical'
  },
  
  // Haryana
  {
    id: 'HR001',
    location: 'Gurugram',
    state: 'Haryana',
    district: 'Gurugram',
    latitude: 28.4595,
    longitude: 77.0266,
    metals: { cd: 0.012, pb: 0.062, as: 0.046, cr: 0.086, ni: 0.122, zn: 0.590 },
    indices: { hpi: 215.60, hei: 13.10, mi: 0.918 },
    category: 'Critical'
  },
  {
    id: 'HR002',
    location: 'Faridabad',
    state: 'Haryana',
    district: 'Faridabad',
    latitude: 28.4089,
    longitude: 77.3178,
    metals: { cd: 0.002, pb: 0.018, as: 0.012, cr: 0.035, ni: 0.045, zn: 0.270 },
    indices: { hpi: 90.10, hei: 4.30, mi: 0.382 },
    category: 'Safe'
  },
  
  // Madhya Pradesh
  {
    id: 'MP001',
    location: 'Bhopal',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    latitude: 23.2599,
    longitude: 77.4126,
    metals: { cd: 0.005, pb: 0.036, as: 0.023, cr: 0.056, ni: 0.076, zn: 0.370 },
    indices: { hpi: 135.20, hei: 7.90, mi: 0.566 },
    category: 'Moderate'
  },
  
  // Jharkhand
  {
    id: 'JH001',
    location: 'Ranchi',
    state: 'Jharkhand',
    district: 'Ranchi',
    latitude: 23.3441,
    longitude: 85.3096,
    metals: { cd: 0.003, pb: 0.022, as: 0.016, cr: 0.042, ni: 0.055, zn: 0.285 },
    indices: { hpi: 95.70, hei: 5.40, mi: 0.423 },
    category: 'Safe'
  },
  
  // Chhattisgarh
  {
    id: 'CG001',
    location: 'Raipur',
    state: 'Chhattisgarh',
    district: 'Raipur',
    latitude: 21.2514,
    longitude: 81.6296,
    metals: { cd: 0.008, pb: 0.046, as: 0.034, cr: 0.070, ni: 0.092, zn: 0.450 },
    indices: { hpi: 170.40, hei: 10.10, mi: 0.700 },
    category: 'Moderate'
  }
];