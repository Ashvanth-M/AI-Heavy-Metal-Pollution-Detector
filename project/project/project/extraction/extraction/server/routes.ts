import type { Express } from "express";
import { createServer, type Server } from "http";
import mongoose from "mongoose";
import { dbService } from "./database";
import passport, { requireAuth, requireAdmin, requireApproved, requireRole, requireAnyRole, requireUser, mockUsers } from "./auth";
import { 
  signupSchema, 
  loginSchema, 
  manualSampleSchema, 
  csvSampleSchema, 
  communityFeedbackSchema,
  calculateHPI,
  categorizeHPI,
  checkWHOLimits,
  WHO_LIMITS,
  type Sample,
  type User,
  type CommunityFeedback
} from "@shared/schema";
import { calculatePLI } from "../client/src/lib/pollution-calculations";
import { z } from "zod";
import multer from "multer";
import * as XLSX from 'xlsx';
import csvParser from 'csv-parser';
import fetch from 'node-fetch';
import { generateAIResponse } from "./gemini-service";
import { generateMultilingualAIResponse } from "./translation-service";
import { fileStorage } from "./file-storage";
import { adafruitIOService } from "./adafruit-io-service";

const upload = multer({ storage: multer.memoryStorage() });

// Helper function to check if MongoDB is connected
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Mock data for development when MongoDB is not available
const mockFeedback: any[] = [];

// Mock samples data with Indian locations
const mockSamples: any[] = [
  // Empty array - data will only be populated after admin uploads
];

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      mongodb: isMongoConnected() ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  });
  
  // Geocode API endpoint (proxy for OpenStreetMap Nominatim)
  app.get("/api/geocode", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Missing latitude or longitude parameters" });
      }
      
      // Validate coordinates
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      
      // Call OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AquaMetriX App'
          }
        }
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Geocoding service error" });
      }
      
      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("Error in geocode API:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get samples near a location
  app.get("/api/samples/nearby", async (req, res) => {
    try {
      const { lat, lng, location } = req.query;
      
      // If we have coordinates, search by proximity
      if (lat && lng) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        
        if (isNaN(latitude) || isNaN(longitude)) {
          return res.status(400).json({ message: "Invalid coordinates" });
        }
        
        // Get samples from database or mock data
        let samples = [];
        if (isMongoConnected()) {
          // Use MongoDB geospatial query (if implemented)
          samples = await dbService.getSamplesByProximity(latitude, longitude, 50); // 50km radius
        } else {
          // For development, use mock data with distance calculation
          samples = mockSamples.filter(sample => {
            // Simple distance calculation (not accurate for large distances)
            const latDiff = sample.latitude - latitude;
            const lngDiff = sample.longitude - longitude;
            const distanceSquared = latDiff * latDiff + lngDiff * lngDiff;
            // Approximate 50km in coordinate units (very rough approximation)
            return distanceSquared < 0.5;
          });
        }
        
        return res.json({ samples });
      }
      
      // If we have a location name, search by location
      if (location) {
        let samples = [];
        if (isMongoConnected()) {
          samples = await dbService.getSamplesByLocation(location as string);
        } else {
          // For development, use mock data with simple text matching
          samples = mockSamples.filter(sample => 
            sample.location && sample.location.toLowerCase().includes((location as string).toLowerCase())
          );
        }
        
        return res.json({ samples });
      }
      
      return res.status(400).json({ message: "Missing location parameters" });
    } catch (error) {
      console.error("Error fetching nearby samples:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // ============= AUTHENTICATION ROUTES =============
  
  // Register new user (working without MongoDB for now)
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      if (!isMongoConnected()) {
        // For development without MongoDB, check if email exists with different role
        const existingUserWithDifferentRole = mockUsers.find(
          user => user.email === userData.email && user.role !== userData.role
        );
        
        if (existingUserWithDifferentRole) {
          return res.status(400).json({ 
            message: `This email is already registered as a ${existingUserWithDifferentRole.role}. Please use a different email.` 
          });
        }
        
        // For development without MongoDB, create a simple mock user
        const mockUser = {
          _id: `user-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          location: userData.location,
          isApproved: true, // Auto-approve all users for testing
          isBlocked: false,
          comparePassword: async (password: string) => password === userData.password
        };
        
        // Store in mock array for session
        mockUsers.push(mockUser);
        
        return res.status(201).json({ 
          message: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} account created successfully (Development Mode)`,
          user: {
            id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            isApproved: mockUser.isApproved,
          },
          redirectTo: userData.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
        });
      }
      
      // Check if user already exists with a different role
      const existingUser = await dbService.findUserByEmail(userData.email);
      if (existingUser && existingUser.role !== userData.role) {
        return res.status(400).json({ 
          message: `This email is already registered as a ${existingUser.role}. Please use a different email.` 
        });
      }
      
      // Auto-approve all users for testing
      const isApproved = true;
      
      const user = await dbService.createUser({
        ...userData,
        isApproved,
      });
      
      res.status(201).json({ 
        message: userData.role === 'admin' 
          ? "Admin account created successfully" 
          : "Account created successfully. Please wait for admin approval.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  
  // Login user
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Authentication error" });
        }
        
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login error" });
          }
          
          // Set redirect URL based on user role
          const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
          
          res.json({
            message: "Login successful",
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              location: user.location,
              isApproved: user.isApproved,
            },
            redirectTo
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Logout user
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  // Get current user
  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      isApproved: user.isApproved,
    });
  });
  
  // ============= ADMIN ROUTES =============
  
  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await dbService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Update user status (admin only)
  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isApproved, isBlocked } = req.body;
      
      const user = await dbService.updateUser(id, { isApproved, isBlocked });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // ============= POLLUTION DATA ROUTES (PERSISTENT STORAGE) =============
  
  // Get all pollution data - accessible without authentication for testing
  app.get("/api/pollution-data", async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!isMongoConnected()) {
        // Use mock data as fallback
        console.log("MongoDB not connected, using mock data for pollution data API");
        
        let filteredSamples = mockSamples;
        if (location) {
          filteredSamples = mockSamples.filter(sample => 
            sample.location && sample.location.toLowerCase().includes(String(location).toLowerCase())
          );
        }
        
        // Convert mock samples to pollution data format
        const pollutionData = filteredSamples.map(sample => ({
          _id: sample.id || `mock-${Date.now()}`,
          latitude: sample.latitude,
          longitude: sample.longitude,
          value: sample.value || sample.hpi || 0,
          location: sample.location,
          hpi: sample.hpi,
          hei: sample.hei,
          mi: sample.mi,
          riskLevel: sample.riskLevel || (sample.hpi < 100 ? 'Low Risk' : sample.hpi < 180 ? 'Medium Risk' : 'High Risk'),
          category: sample.category,
          uploadedBy: sample.uploadedBy,
          source: sample.source || 'Mock Data',
          createdAt: sample.uploadedAt || new Date(),
          updatedAt: sample.uploadedAt || new Date()
        }));
        
        return res.json(pollutionData);
      }
      
      let pollutionData;
      if (location) {
        pollutionData = await dbService.getPollutionDataByLocation(location as string);
      } else {
        pollutionData = await dbService.getAllPollutionData();
      }
      
      res.json(pollutionData);
    } catch (error) {
      console.error("Error fetching pollution data:", error);
      res.status(500).json({ message: "Failed to fetch pollution data" });
    }
  });
  
  // Get pollution data count - accessible without authentication for testing
  app.get("/api/pollution-data/count", async (req, res) => {
    try {
      if (!isMongoConnected()) {
        // Use mock data count as fallback
        return res.json({ count: mockSamples.length });
      }
      
      const count = await dbService.getPollutionDataCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching pollution data count:", error);
      res.status(500).json({ message: "Failed to fetch pollution data count" });
    }
  });
  
  // Clear all pollution data (admin only)
  app.delete("/api/pollution-data", requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!isMongoConnected()) {
        // Clear mock data as fallback
        mockSamples.length = 0;
        return res.json({ message: "All pollution data cleared successfully (fallback storage)" });
      }
      
      await dbService.clearAllPollutionData();
      res.json({ message: "All pollution data cleared successfully" });
    } catch (error) {
      console.error("Error clearing pollution data:", error);
      res.status(500).json({ message: "Failed to clear pollution data" });
    }
  });
  
  // ============= SAMPLE DATA ROUTES =============
  
  // Get all samples - accessible to both admin and approved users
  app.get("/api/samples", requireAuth, requireApproved, async (req, res) => {
    try {
      const { location, lat, lng } = req.query;
      
      if (!isMongoConnected()) {
        // Filter mock data if needed
        let results = mockSamples;
        
        if (location) {
          results = mockSamples.filter(sample => 
            sample.location.toLowerCase().includes(String(location).toLowerCase())
          );
        } else if (lat && lng) {
          // Filter by proximity (simplified for mock data)
          const userLat = parseFloat(String(lat));
          const userLng = parseFloat(String(lng));
          
          results = mockSamples.filter(sample => {
            const distance = calculateDistance(
              userLat, userLng, 
              sample.latitude, sample.longitude
            );
            return distance <= 50; // 50km radius
          });
        }
        
        return res.json(results);
      }
      
      // MongoDB query
      let samples;
      if (location) {
        samples = await dbService.getSamplesByLocation(location as string);
      } else if (lat && lng) {
        // Get all samples and filter by distance
        const allSamples = await dbService.getAllSamples();
        const userLat = parseFloat(String(lat));
        const userLng = parseFloat(String(lng));
        
        samples = allSamples.filter(sample => {
          const distance = calculateDistance(
            userLat, userLng, 
            sample.latitude, sample.longitude
          );
          return distance <= 50; // 50km radius
        });
      } else {
        samples = await dbService.getAllSamples();
      }
      
      res.json(samples);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch samples" });
    }
  });
  
  // Helper function to calculate distance between two points in km
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Add manual sample (admin or researcher only)
  app.post("/api/samples/manual", requireAuth, requireAnyRole(["admin", "researcher"]), async (req, res) => {
    try {
      const sampleData = manualSampleSchema.parse(req.body);
      const user = req.user as any;
      
      // Calculate HPI and other derived values
      const metals = {
        lead: sampleData.lead,
        cadmium: sampleData.cadmium,
        arsenic: sampleData.arsenic,
        mercury: sampleData.mercury,
        chromium: sampleData.chromium,
        nickel: sampleData.nickel,
        zinc: sampleData.zinc,
        copper: sampleData.copper,
      };
      
      const hpi = calculateHPI(metals);
      const category = categorizeHPI(hpi);
      const exceedsWhoLimits = checkWHOLimits({ ...metals, ph: sampleData.ph });
      
      if (!isMongoConnected()) {
        const mockSample = {
          id: `mock-sample-${Date.now()}`,
          ...sampleData,
          hpi,
          category,
          exceedsWhoLimits,
          uploadedBy: user._id,
          uploadedAt: new Date(),
        } as any;
        mockSamples.push(mockSample);
        return res.status(201).json({ message: "Sample added successfully (Development Mode)", sample: mockSample });
      } else {
        const sample = await dbService.createSample({
          ...sampleData,
          hpi,
          category,
          exceedsWhoLimits,
          uploadedBy: user._id,
        });
        
        return res.status(201).json({ 
          message: "Sample added successfully", 
          sample 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Manual sample creation error:", error);
      res.status(500).json({ message: "Failed to add sample" });
    }
  });
  
  // Enhanced CSV upload with persistent MongoDB storage for pollution_data collection
  app.post("/api/samples/upload", upload.single("file"), async (req, res) => {
    console.log("=== CSV UPLOAD ENDPOINT REACHED (PERSISTENT MODE) ===");
    try {
      if (!req.file) {
        console.log("No file provided in request");
        return res.status(400).json({ 
          success: false,
          message: "No file provided",
          data: [],
          errors: ["No file uploaded"],
          stats: { totalRows: 0, processedEntries: 0, errorCount: 1, savedToDatabase: false, usingFallback: false }
        });
      }
      
      // Validate file type
      if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
        return res.status(400).json({ 
          success: false,
          message: "Only CSV files are supported",
          data: [],
          errors: ["Invalid file type - only CSV files are supported"],
          stats: { totalRows: 0, processedEntries: 0, errorCount: 1, savedToDatabase: false, usingFallback: false }
        });
      }
      
      console.log("File received:", req.file.originalname, "Size:", req.file.size);
      
      // Get authenticated user
      const user = req.user || { _id: "admin-mock-id" };
      
      // Parse CSV content with enhanced parsing
      const csvContent = req.file.buffer.toString('utf-8');
      const rows: any[] = [];
      const errors: string[] = [];
      
      // Enhanced CSV parsing - handle different delimiters, quotes, and formats
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        return res.status(400).json({ 
          success: false,
          message: "CSV file must contain header and at least one data row",
          data: [],
          errors: ["CSV file must contain header and at least one data row"],
          stats: { totalRows: 0, processedEntries: 0, errorCount: 1, savedToDatabase: false, usingFallback: false }
        });
      }
      
      // Enhanced header parsing - handle quoted headers and different separators
      const detectSeparator = (line: string): string => {
        const separators = [',', ';', '\t', '|'];
        const separatorNames = ['comma', 'semicolon', 'tab', 'pipe'];
        
        // Count actual separators, ignoring those inside quotes
        const counts = separators.map(sep => {
          let count = 0;
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === sep && !inQuotes) {
              count++;
            }
          }
          return count;
        });
        
        console.log('Separator detection:', separatorNames.map((name, i) => `${name}: ${counts[i]}`).join(', '));
        
        // Choose separator with highest count
        const maxCount = Math.max(...counts);
        if (maxCount === 0) return ',';
        
        const maxIndex = counts.indexOf(maxCount);
        return separators[maxIndex];
      };
      
      const separator = detectSeparator(lines[0]);
      console.log("Detected CSV separator:", separator === '\t' ? 'TAB' : separator);
      
      // Parse CSV with proper quote handling
      const parseCSVLine = (line: string, separator: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++; // Skip next quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === separator && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        result.push(current.trim());
        return result;
      };
      
      const headers = parseCSVLine(lines[0], separator).map(h => h.replace(/^"|"$/g, '').trim());
      console.log("CSV Headers:", headers);
      
      // Validate required headers with flexible matching
      const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      const latitudePatterns = ['latitude', 'lat', 'y', 'coord_lat', 'coordlat', 'latitud'];
      const longitudePatterns = ['longitude', 'long', 'lng', 'x', 'coord_lng', 'coord_lon', 'coordlng', 'coordlon', 'longitud'];
      
      const hasLatitude = normalizedHeaders.some(h => 
        latitudePatterns.some(pattern => h.includes(pattern))
      );
      const hasLongitude = normalizedHeaders.some(h => 
        longitudePatterns.some(pattern => h.includes(pattern))
      );
      
      if (!hasLatitude || !hasLongitude) {
        return res.status(400).json({ 
          success: false,
          message: "Missing required columns. CSV must contain latitude and longitude columns.",
          data: [],
          errors: [`Missing required columns. Found columns: ${headers.join(', ')}`],
          stats: { totalRows: lines.length - 1, processedEntries: 0, errorCount: 1, savedToDatabase: false, usingFallback: false },
          availableColumns: headers
        });
      }
      
      // Parse data rows with enhanced parsing
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i], separator);
          if (values.length !== headers.length && values.filter(v => v.trim()).length > 0) {
            errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
            continue;
          }
          
          const row: any = {};
          headers.forEach((header, index) => {
            const value = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
            // Enhanced number parsing
            if (value && !isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
              row[header] = parseFloat(value);
            } else {
              row[header] = value || null;
            }
          });
          
          if (Object.values(row).some(v => v !== null && v !== '')) {
            rows.push(row);
          }
        } catch (parseError) {
          errors.push(`Row ${i + 1}: Parse error - ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      }
      
      console.log(`Parsed ${rows.length} data rows`);
      
      if (rows.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "No valid data rows found in CSV",
          data: [],
          errors: errors.length > 0 ? errors.slice(0, 5) : ["No valid data rows found in CSV"],
          stats: { totalRows: lines.length - 1, processedEntries: 0, errorCount: errors.length || 1, savedToDatabase: false, usingFallback: false }
        });
      }
      
      // Enhanced helper function to find column value with fuzzy matching
      const findColumnValue = (row: any, possibleNames: string[], defaultValue: any = null) => {
        // First try exact matches
        for (const name of possibleNames) {
          if (row.hasOwnProperty(name)) {
            const value = row[name];
            return value !== null && value !== undefined && value !== '' ? value : defaultValue;
          }
        }
        
        // Then try case-insensitive matches
        for (const name of possibleNames) {
          for (const [key, value] of Object.entries(row)) {
            if (key.toLowerCase() === name.toLowerCase()) {
              return value !== null && value !== undefined && value !== '' ? value : defaultValue;
            }
          }
        }
        
        // Finally try partial matches
        for (const name of possibleNames) {
          for (const [key, value] of Object.entries(row)) {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedKey.includes(normalizedName) || normalizedName.includes(normalizedKey)) {
              return value !== null && value !== undefined && value !== '' ? value : defaultValue;
            }
          }
        }
        
        return defaultValue;
      };
      
      // Process and validate rows for pollution_data collection
      const pollutionDataEntries: any[] = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        try {
          // Enhanced field extraction with comprehensive column matching
          const latitudePatterns = ['latitude', 'lat', 'y', 'coord_lat', 'coordlat', 'latitud', 'lat_deg', 'lat_decimal'];
          const longitudePatterns = ['longitude', 'long', 'lng', 'x', 'coord_lng', 'coord_lon', 'coordlng', 'coordlon', 'longitud', 'lon', 'lng_deg', 'lon_decimal'];
          const valuePatterns = ['value', 'concentration', 'hpi', 'reading', 'amount', 'level', 'measurement', 'val', 'conc'];
          const locationPatterns = ['location', 'place', 'site', 'area', 'name', 'station', 'point', 'address', 'locality'];
          
          const latitude = parseFloat(findColumnValue(row, latitudePatterns, 0));
          const longitude = parseFloat(findColumnValue(row, longitudePatterns, 0));
          
          // Enhanced coordinate validation
          if (isNaN(latitude) || isNaN(longitude) || 
              latitude < -90 || latitude > 90 || 
              longitude < -180 || longitude > 180 ||
              (latitude === 0 && longitude === 0)) {
            errors.push(`Row ${i + 1}: Invalid coordinates (lat: ${latitude}, lng: ${longitude})`);
            continue;
          }
          
          // Extract other fields with enhanced patterns
          const location = findColumnValue(row, locationPatterns, `Location ${i + 1}`);
          const value = parseFloat(findColumnValue(row, valuePatterns, 0));
          
          // Enhanced metal concentration extraction with more patterns
          const metals = {
            lead: parseFloat(findColumnValue(row, ['lead', 'pb', 'lead_conc', 'pb_conc', 'plumbum'], 0)),
            cadmium: parseFloat(findColumnValue(row, ['cadmium', 'cd', 'cadmium_conc', 'cd_conc'], 0)),
            arsenic: parseFloat(findColumnValue(row, ['arsenic', 'as', 'arsenic_conc', 'as_conc'], 0)),
            mercury: parseFloat(findColumnValue(row, ['mercury', 'hg', 'mercury_conc', 'hg_conc'], 0)),
            chromium: parseFloat(findColumnValue(row, ['chromium', 'cr', 'chromium_conc', 'cr_conc'], 0)),
            nickel: parseFloat(findColumnValue(row, ['nickel', 'ni', 'nickel_conc', 'ni_conc'], 0)),
            zinc: parseFloat(findColumnValue(row, ['zinc', 'zn', 'zinc_conc', 'zn_conc'], 0)),
            copper: parseFloat(findColumnValue(row, ['copper', 'cu', 'copper_conc', 'cu_conc'], 0))
          };
          
          // Calculate indices
          const hpi = calculateHPI(metals);
          const hei = Object.values(metals).reduce((sum, val) => sum + (val * 50), 0) / Object.values(metals).length;
          const mi = Object.values(metals).reduce((sum, val) => sum + (val * 25), 0) / Object.values(metals).length;
          const category = categorizeHPI(hpi); // "Safe", "Moderate", or "Critical"
          
          // Debug logging for HPI calculation
          console.log(`Row ${i + 1} (${location}):`, {
            metals,
            calculatedHPI: hpi,
            category,
            expectedFromName: location.includes('Low Risk') ? 'Low' : location.includes('Medium Risk') ? 'Medium' : location.includes('High Risk') ? 'High' : 'Unknown'
          });
          
          // Determine risk level for frontend compatibility
          let riskLevel: string;
          if (hpi < 100) riskLevel = "Low Risk";
          else if (hpi < 180) riskLevel = "Medium Risk";
          else riskLevel = "High Risk";
          
          const pollutionEntry = {
            latitude,
            longitude,
            value: !isNaN(value) ? value : hpi, // Use HPI as value if no specific value provided
            location,
            hpi,
            hei,
            mi,
            riskLevel,
            category,
            uploadedBy: (user as any)._id || (user as any).id || "admin-mock-id",
            source: "CSV Upload"
          };
          
          pollutionDataEntries.push(pollutionEntry);
          
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
        }
      }
      
      console.log(`Processed ${pollutionDataEntries.length} valid pollution data entries`);
      console.log(`Encountered ${errors.length} errors`);
      
      if (pollutionDataEntries.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "No valid pollution data could be processed",
          data: [],
          errors: errors.length > 0 ? errors.slice(0, 10) : ["No valid pollution data could be processed"],
          stats: { totalRows: rows.length, processedEntries: 0, errorCount: errors.length, savedToDatabase: false, usingFallback: false }
        });
      }
      
      // Save to persistent MongoDB collection
      let savedPollutionData: any[] = [];
      
      if (isMongoConnected()) {
        try {
          // Save to pollution_data collection (clears existing data first)
          savedPollutionData = await dbService.createPollutionData(pollutionDataEntries);
          console.log(`Saved ${savedPollutionData.length} entries to pollution_data collection`);
          
          // Also save as a permanent dataset for history
          const fileName = req.file?.originalname || 'unknown.csv';
          const uploadedBy = (user as any).name || (user as any).email || 'admin';
          
          await dbService.createDataset({
            fileName,
            uploadedBy,
            data: pollutionDataEntries.map(entry => ({
              ...entry,
              originalData: entry // Store the full processed data
            })),
            stats: {
              totalRows: rows.length,
              processedEntries: pollutionDataEntries.length,
              errorCount: errors.length
            }
          });
          
          console.log(`Saved dataset "${fileName}" to datasets collection`);
          
          // Also save to file storage as backup
          await fileStorage.saveDataset({
            fileName,
            uploadedBy,
            data: pollutionDataEntries.map(entry => ({
              ...entry,
              originalData: entry
            })),
            stats: {
              totalRows: rows.length,
              processedEntries: pollutionDataEntries.length,
              errorCount: errors.length
            }
          });
          
          console.log(`Also saved dataset "${fileName}" to file storage as backup`);
          
        } catch (dbError) {
          console.error("Database error:", dbError);
          return res.status(500).json({ 
            success: false,
            message: "Failed to save data to database",
            data: [],
            errors: [dbError instanceof Error ? dbError.message : "Database error"],
            stats: { totalRows: rows.length, processedEntries: 0, errorCount: 1, savedToDatabase: false, usingFallback: false }
          });
        }
      } else {
        // Fallback: Use mock storage when MongoDB is not available
        console.log("MongoDB not connected, using mock storage as fallback");
        
        // Clear existing mock samples and add new pollution data
        mockSamples.length = 0;
        const convertedSamples = pollutionDataEntries.map((entry, index) => ({
          id: `mock-pollution-${Date.now()}-${index}`,
          sampleId: `POLL-${Date.now()}-${index}`,
          location: entry.location,
          latitude: entry.latitude,
          longitude: entry.longitude,
          dateCollected: new Date(),
          ph: 7.0,
          lead: 0,
          cadmium: 0,
          arsenic: 0,
          mercury: 0,
          chromium: 0,
          nickel: 0,
          zinc: 0,
          copper: 0,
          hpi: entry.hpi,
          hei: entry.hei,
          mi: entry.mi,
          pli: 0,
          category: entry.category,
          riskLevel: entry.riskLevel,
          exceedsWhoLimits: false,
          uploadedBy: entry.uploadedBy,
          uploadedAt: new Date(),
          notes: "",
          value: entry.value,
          source: entry.source
        }));
        
        mockSamples.push(...convertedSamples);
        
        // Convert back to pollution data format for response
        savedPollutionData = pollutionDataEntries.map((entry, index) => ({
          _id: `mock-${Date.now()}-${index}`,
          ...entry,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        console.log(`Stored ${savedPollutionData.length} entries in mock storage`);
        
        // Also save to file storage for persistent history
        const fileName = req.file?.originalname || 'unknown.csv';
        const uploadedBy = (user as any).name || (user as any).email || 'admin';
        
        await fileStorage.saveDataset({
          fileName,
          uploadedBy,
          data: pollutionDataEntries.map(entry => ({
            ...entry,
            originalData: entry
          })),
          stats: {
            totalRows: rows.length,
            processedEntries: pollutionDataEntries.length,
            errorCount: errors.length
          }
        });
        
        console.log(`Saved dataset "${fileName}" to file storage`);
      }
      
      // Return success response with processed data
      return res.json({
        success: true,
        message: `Successfully uploaded and saved ${savedPollutionData.length} pollution data entries${!isMongoConnected() ? ' (using fallback storage)' : ''}`,
        data: savedPollutionData,
        errors: errors.length > 0 ? errors.slice(0, 5) : [], // Include first 5 errors
        stats: {
          totalRows: rows.length,
          processedEntries: savedPollutionData.length,
          errorCount: errors.length,
          savedToDatabase: isMongoConnected(),
          usingFallback: !isMongoConnected()
        }
      });
      
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process CSV file",
        data: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
        stats: { totalRows: 0, processedEntries: 0, errorCount: 1, savedToDatabase: false, usingFallback: false }
      });
    }
  });
  
  // ============= DATASET HISTORY ROUTES =============
  
  // Get all uploaded datasets history with optional admin filtering
  app.get("/api/history", async (req, res) => {
    try {
      const { uploadedBy } = req.query;
      let datasets;
      
      if (isMongoConnected()) {
        // Use MongoDB when available
        if (uploadedBy && typeof uploadedBy === 'string') {
          datasets = await dbService.getDatasetsByUploader(uploadedBy);
        } else {
          datasets = await dbService.getAllDatasets();
        }
      } else {
        // Use file storage when MongoDB is not connected
        console.log("MongoDB not connected, using file storage for history");
        if (uploadedBy && typeof uploadedBy === 'string') {
          datasets = await fileStorage.getDatasetsByUploader(uploadedBy);
        } else {
          datasets = await fileStorage.getAllDatasets();
        }
      }
      
      // Return detailed dataset info for history listing with calculation summaries
      const historyData = datasets.map(dataset => {
        // Calculate risk distribution from the dataset
        const riskDistribution = {
          'Low Risk': 0,
          'Medium Risk': 0,
          'High Risk': 0
        };
        
        dataset.data.forEach(entry => {
          if (entry.riskLevel) {
            riskDistribution[entry.riskLevel]++;
          }
        });
        
        // Calculate average HPI
        const hpiValues = dataset.data.filter(entry => entry.hpi).map(entry => entry.hpi);
        const avgHPI = hpiValues.length > 0 ? 
          (hpiValues.reduce((sum, hpi) => sum + hpi, 0) / hpiValues.length).toFixed(2) : null;
        
        return {
          id: dataset._id,
          fileName: dataset.fileName,
          uploadedAt: dataset.uploadedAt,
          uploadedBy: dataset.uploadedBy,
          stats: dataset.stats,
          calculations: {
            riskDistribution,
            avgHPI: avgHPI ? parseFloat(avgHPI) : null,
            totalLocations: dataset.data.length,
            locationsWithHPI: hpiValues.length
          }
        };
      });
      
      res.json({
        success: true,
        data: historyData
      });
    } catch (error) {
      console.error("Error fetching dataset history:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch dataset history",
        data: []
      });
    }
  });
  
  // Get specific dataset by ID
  app.get("/api/datasets/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!isMongoConnected()) {
        return res.status(503).json({ 
          success: false,
          message: "Database not connected"
        });
      }
      
      const dataset = await dbService.getDatasetById(id);
      
      if (!dataset) {
        return res.status(404).json({ 
          success: false,
          message: "Dataset not found"
        });
      }
      
      res.json({
        success: true,
        data: dataset
      });
    } catch (error) {
      console.error("Error fetching dataset:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch dataset"
      });
    }
  });
  
  // Delete dataset by ID (admin only)
  app.delete("/api/datasets/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!isMongoConnected()) {
        return res.status(503).json({ 
          success: false,
          message: "Database not connected"
        });
      }
      
      const deletedDataset = await dbService.deleteDataset(id);
      
      if (!deletedDataset) {
        return res.status(404).json({ 
          success: false,
          message: "Dataset not found"
        });
      }
      
      res.json({
        success: true,
        message: "Dataset deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting dataset:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to delete dataset"
      });
    }
  });
  
  // Delete sample (admin or researcher only)
  app.delete("/api/samples/:id", requireAuth, requireRole(["admin", "researcher"]), async (req, res) => {
    try {
      const { id } = req.params;
      const sample = await dbService.deleteSample(id);
      
      if (!sample) {
        return res.status(404).json({ message: "Sample not found" });
      }
      
      res.json({ message: "Sample deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sample" });
    }
  });
  
  // ============= ANALYTICS ROUTES =============
  
  // Get analytics data - accessible to all approved users
  app.get("/api/analytics", requireAuth, requireApproved, async (req, res) => {
    try {
      let samples;
      
      if (!isMongoConnected()) {
        samples = mockSamples;
      } else {
        samples = await dbService.getAllSamples();
      }
      
      const totalSamples = samples.length;
      const safeSamples = samples.filter(s => s.category === "Safe").length;
      const moderateSamples = samples.filter(s => s.category === "Moderate").length;
      const criticalSamples = samples.filter(s => s.category === "Critical").length;
      const whoExceedingSamples = samples.filter(s => s.exceedsWhoLimits).length;
      
      const analytics = {
        totalSamples,
        safePercentage: totalSamples > 0 ? Math.round((safeSamples / totalSamples) * 100) : 0,
        moderatePercentage: totalSamples > 0 ? Math.round((moderateSamples / totalSamples) * 100) : 0,
        criticalPercentage: totalSamples > 0 ? Math.round((criticalSamples / totalSamples) * 100) : 0,
        whoExceedingPercentage: totalSamples > 0 ? Math.round((whoExceedingSamples / totalSamples) * 100) : 0,
        categoryCounts: {
          Safe: safeSamples,
          Moderate: moderateSamples,
          Critical: criticalSamples,
        },
        whoLimits: WHO_LIMITS,
        hasCriticalSamples: criticalSamples > 0,
        criticalSamplesCount: criticalSamples,
        whoExceedingSamplesCount: whoExceedingSamples,
      };
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  
  // ============= COMMUNITY FEEDBACK ROUTES =============
  
  // Submit community feedback - any authenticated user can submit
  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const feedbackData = communityFeedbackSchema.parse(req.body);
      
      const feedback = await dbService.createFeedback({
        ...feedbackData,
        userId: (user as any).id || (user as any)._id || "user-mock-id",
      });
      
      res.status(201).json({ 
        message: "Feedback submitted successfully", 
        feedback 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });
  
  // Get all feedback (admin only)
  app.get("/api/admin/feedback", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const feedback = await dbService.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });
  
  // Update feedback status (admin only)
  app.put("/api/admin/feedback/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const feedback = await dbService.updateFeedbackStatus(id, status);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      
      res.json({ message: "Feedback status updated successfully", feedback });
    } catch (error) {
      res.status(500).json({ message: "Failed to update feedback status" });
    }
  });
  
  // ============= PDF REPORT ROUTES =============
  
  // Generate PDF report (placeholder - would integrate with PDF generation library)
  app.post("/api/reports/generate", requireAuth, requireApproved, async (req, res) => {
    try {
      const samples = await dbService.getAllSamples();
      
      // This would generate an actual PDF using libraries like puppeteer or jsPDF
      // For now, return success message
      res.json({
        message: "PDF report generated successfully",
        downloadUrl: "/api/reports/download/latest.pdf",
        sampleCount: samples.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF report" });
    }
  });
  
  // ============= SDG BADGES ROUTES =============
  
  // Get all SDG badges - accessible to all authenticated users
  app.get("/api/sdg-badges", requireAuth, async (req, res) => {
    try {
      if (!isMongoConnected()) {
        // Import mock data and return it
        const { mockSdgBadges } = await import('../client/src/data/sdg-badges');
        return res.json(mockSdgBadges);
      }
      
      const badges = await dbService.getAllSdgBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching SDG badges:", error);
      res.status(500).json({ message: "Failed to fetch SDG badges" });
    }
  });
  
  // Create SDG badge (admin only)
  app.post("/api/admin/sdg-badges", requireAuth, requireAdmin, async (req, res) => {
    try {
      const badgeData = req.body;
      
      if (!isMongoConnected()) {
        return res.status(503).json({ message: "Database not available for badge creation" });
      }
      
      const badge = await dbService.createSdgBadge(badgeData);
      res.status(201).json({ message: "SDG badge created successfully", badge });
    } catch (error: unknown) {
      console.error("Error creating SDG badge:", error);
      res.status(500).json({ message: "Failed to create SDG badge" });
    }
  });
  
  // Assign SDG badges to sample (admin only)
  app.post("/api/admin/samples/:sampleId/sdg-badges", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { sampleId } = req.params;
      const { badgeIds, notes } = req.body;
      const user = req.user as any;
      
      if (!Array.isArray(badgeIds) || badgeIds.length === 0) {
        return res.status(400).json({ message: "At least one badge ID must be provided" });
      }
      
      if (!isMongoConnected()) {
        // For development mode, update mock assignments
        const { mockSampleSDGAssignments } = await import('../client/src/data/sdg-badges');
        
        // Remove existing assignments for this sample
        const filteredAssignments = mockSampleSDGAssignments.filter(a => a.sampleId !== sampleId);
        
        // Add new assignments
        const newAssignments = badgeIds.map((badgeId: string, index: number) => ({
          id: `assignment-${Date.now()}-${index}`,
          sampleId,
          badgeId,
          assignedBy: user._id,
          assignedAt: new Date(),
          notes: notes || `Assigned via admin interface`,
        }));
        
        mockSampleSDGAssignments.length = 0;
        mockSampleSDGAssignments.push(...filteredAssignments, ...newAssignments);
        
        return res.json({ 
          message: "SDG badges assigned successfully (Development Mode)", 
          assignments: newAssignments 
        });
      }
      
      const assignments = await dbService.assignSdgBadgesToSample(sampleId, badgeIds, user._id, notes);
      res.json({ message: "SDG badges assigned successfully", assignments });
    } catch (error) {
      console.error("Error assigning SDG badges:", error);
      res.status(500).json({ message: "Failed to assign SDG badges" });
    }
  });
  
  // Remove SDG badge from sample (admin only)
  app.delete("/api/admin/samples/:sampleId/sdg-badges/:badgeId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { sampleId, badgeId } = req.params;
      
      if (!isMongoConnected()) {
        // For development mode, update mock assignments
        const { mockSampleSDGAssignments } = await import('../client/src/data/sdg-badges');
        
        const assignmentIndex = mockSampleSDGAssignments.findIndex(
          a => a.sampleId === sampleId && a.badgeId === badgeId
        );
        
        if (assignmentIndex === -1) {
          return res.status(404).json({ message: "Assignment not found" });
        }
        
        mockSampleSDGAssignments.splice(assignmentIndex, 1);
        
        return res.json({ message: "SDG badge removed successfully (Development Mode)" });
      }
      
      const result = await dbService.removeSdgBadgeFromSample(sampleId, badgeId);
      if (!result) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      res.json({ message: "SDG badge removed successfully" });
    } catch (error) {
      console.error("Error removing SDG badge:", error);
      res.status(500).json({ message: "Failed to remove SDG badge" });
    }
  });
  
  // Get SDG badges for a specific sample
  app.get("/api/samples/:sampleId/sdg-badges", requireAuth, async (req, res) => {
    try {
      const { sampleId } = req.params;
      
      if (!isMongoConnected()) {
        // For development mode, get from mock data
        const { mockSampleSDGAssignments, mockSdgBadges } = await import('../client/src/data/sdg-badges');
        
        const sampleAssignments = mockSampleSDGAssignments.filter(a => a.sampleId === sampleId);
        const assignedBadges = sampleAssignments.map(assignment => {
          const badge = mockSdgBadges.find(b => b.id === assignment.badgeId);
          return {
            ...assignment,
            badge,
          };
        }).filter(item => item.badge); // Filter out any not found badges
        
        return res.json(assignedBadges);
      }
      
      const assignments = await dbService.getSdgBadgesForSample(sampleId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching sample SDG badges:", error);
      res.status(500).json({ message: "Failed to fetch sample SDG badges" });
    }
  });
  
  // Get all samples with their SDG badges (admin only)
  app.get("/api/admin/samples-with-sdg-badges", requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!isMongoConnected()) {
        // For development mode, combine mock data
        const { mockSampleSDGAssignments, mockSdgBadges } = await import('../client/src/data/sdg-badges');
        
        const samplesWithBadges = mockSamples.map(sample => {
          const sampleAssignments = mockSampleSDGAssignments.filter(a => a.sampleId === sample.id);
          const badges = sampleAssignments.map(assignment => {
            const badge = mockSdgBadges.find(b => b.id === assignment.badgeId);
            return {
              ...assignment,
              badge,
            };
          }).filter(item => item.badge);
          
          return {
            ...sample,
            sdgBadges: badges,
          };
        });
        
        return res.json(samplesWithBadges);
      }
      
      const assignments = await dbService.getSamplesWithSdgBadges();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching samples with SDG badges:", error);
      res.status(500).json({ message: "Failed to fetch samples with SDG badges" });
    }
  });
  
  // Filter samples by SDG badge
  app.get("/api/admin/samples/filter-by-sdg/:badgeId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { badgeId } = req.params;
      
      if (!isMongoConnected()) {
        // For development mode, filter mock data
        const { mockSampleSDGAssignments, mockSdgBadges } = await import('../client/src/data/sdg-badges');
        
        const badge = mockSdgBadges.find(b => b.id === badgeId);
        if (!badge) {
          return res.status(404).json({ message: "SDG badge not found" });
        }
        
        const sampleAssignments = mockSampleSDGAssignments.filter(a => a.badgeId === badgeId);
        const sampleIds = sampleAssignments.map(a => a.sampleId);
        const filteredSamples = mockSamples.filter(sample => sampleIds.includes(sample.id));
        
        return res.json({
          badge,
          samples: filteredSamples,
          count: filteredSamples.length,
        });
      }
      
      const result = await dbService.getSamplesBySDGBadge(badgeId);
      res.json(result);
    } catch (error) {
      console.error("Error filtering samples by SDG badge:", error);
      res.status(500).json({ message: "Failed to filter samples by SDG badge" });
    }
  });
  
  // AI Chat Assistant Route
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    // Generate multilingual response using translation service
    const response = await generateMultilingualAIResponse(message, language);
    
    return res.json({ response });
  } catch (error) {
    console.error("Error in AI chat API:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

  // ============= HARDWARE SENSOR DATA ROUTES =============
  
  // Get real-time hardware sensor data from Adafruit IO
  app.get("/api/hardware-sensor-data", async (req, res) => {
    try {
      const sensorData = await adafruitIOService.getSensorReadings();
      
      if (!sensorData) {
        return res.status(503).json({
          success: false,
          message: "Hardware sensor data unavailable",
          connected: false,
          data: null
        });
      }
      
      return res.json({
        success: true,
        message: "Hardware sensor data retrieved successfully",
        connected: true,
        data: sensorData
      });
    } catch (error) {
      console.error("Error fetching hardware sensor data:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch hardware sensor data",
        connected: false,
        data: null
      });
    }
  });
  
  // Check hardware sensor connection status
  app.get("/api/hardware-sensor-status", async (req, res) => {
    try {
      const isConnected = await adafruitIOService.checkConnection();
      
      return res.json({
        success: true,
        connected: isConnected,
        message: isConnected 
          ? "Hardware Microcontroller Connected. Showing results..." 
          : "Waiting for hardware data...",
        thresholds: adafruitIOService.getThresholds()
      });
    } catch (error) {
      console.error("Error checking hardware sensor status:", error);
      return res.status(500).json({
        success: false,
        connected: false,
        message: "Failed to check hardware sensor status"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
