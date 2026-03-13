import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import PollutionData model type
export interface IPollutionData {
  _id?: string;
  latitude: number;
  longitude: number;
  value: number;
  location?: string;
  hpi?: number;
  hei?: number;
  mi?: number;
  riskLevel?: 'Low Risk' | 'Medium Risk' | 'High Risk';
  category?: 'Safe' | 'Moderate' | 'Critical';
  uploadedBy?: string;
  source?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Dataset interface for permanent CSV storage
export interface IDataset {
  _id?: string;
  fileName: string;
  uploadedAt: Date;
  uploadedBy: string;
  data: {
    latitude: number;
    longitude: number;
    location?: string;
    value?: number;
    hpi?: number;
    hei?: number;
    mi?: number;
    riskLevel?: 'Low Risk' | 'Medium Risk' | 'High Risk';
    category?: 'Safe' | 'Moderate' | 'Critical';
    originalData?: any;
  }[];
  stats: {
    totalRows: number;
    processedEntries: number;
    errorCount: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/groundwater_monitoring';

export async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in log
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('Database:', mongoose.connection.db?.databaseName);
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error?.message || String(error));
    console.warn('Continuing without database for development...');
    // Don't exit the process, continue without MongoDB for development
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  location: { type: String },
  isApproved: { type: Boolean, default: true }, // Auto-approve for better testing
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

// Create a compound index for email and role to ensure uniqueness per role
userSchema.index({ email: 1, role: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Sample Schema with detailed heavy metal data
const sampleSchema = new mongoose.Schema({
  sampleId: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  dateCollected: { type: Date, required: true },
  
  // Water quality parameters
  ph: { type: Number },
  
  // Heavy metals (in mg/L)
  metal: { type: String, required: true },
  concentration: { type: Number, required: true },
  
  // Legacy fields for backward compatibility
  lead: { type: Number },
  cadmium: { type: Number },
  arsenic: { type: Number },
  mercury: { type: Number },
  chromium: { type: Number },
  nickel: { type: Number },
  zinc: { type: Number },
  copper: { type: Number },
  
  // Calculated values
  hpi: { type: Number, required: true },
  category: { type: String, enum: ['Safe', 'Moderate', 'Critical'], required: true },
  exceedsWhoLimits: { type: Boolean, default: false },
  
  // Metadata
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

// Community Feedback Schema
const communityFeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  description: { type: String, required: true },
  suspectedPollutants: { type: String },
  contactInfo: { type: String },
  status: { type: String, enum: ['pending', 'investigating', 'resolved'], default: 'pending' },
}, { timestamps: true });

// SDG Badge Schema
const sdgBadgeSchema = new mongoose.Schema({
  badgeNumber: { type: Number, required: true, unique: true, min: 1, max: 17 },
  name: { type: String, required: true },
  description: { type: String, required: true },
  iconUrl: { type: String, required: true },
  color: { type: String, required: true },
  relevantToWaterPollution: { type: Boolean, default: false },
}, { timestamps: true });

// Sample-SDG Badge Assignment Schema
const sampleSdgAssignmentSchema = new mongoose.Schema({
  sampleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SdgBadge', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
}, { timestamps: true });

// Create compound index to prevent duplicate assignments
sampleSdgAssignmentSchema.index({ sampleId: 1, badgeId: 1 }, { unique: true });

// Dataset Schema for persistent CSV file storage
const datasetSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true }, // e.g., "admin"
  data: [{
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: { type: String },
    value: { type: Number },
    hpi: { type: Number },
    hei: { type: Number },
    mi: { type: Number },
    riskLevel: { type: String, enum: ['Low Risk', 'Medium Risk', 'High Risk'] },
    category: { type: String, enum: ['Safe', 'Moderate', 'Critical'] },
    // Store original CSV fields as well
    originalData: { type: mongoose.Schema.Types.Mixed }
  }],
  stats: {
    totalRows: { type: Number, default: 0 },
    processedEntries: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Create index for efficient queries
datasetSchema.index({ uploadedAt: -1 });
datasetSchema.index({ uploadedBy: 1 });

// Pollution Data Schema for persistent CSV uploads
const pollutionDataSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  value: { type: Number, required: true },
  location: { type: String },
  hpi: { type: Number },
  hei: { type: Number },
  mi: { type: Number },
  riskLevel: { type: String, enum: ['Low Risk', 'Medium Risk', 'High Risk'] },
  category: { type: String, enum: ['Safe', 'Moderate', 'Critical'] },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, default: 'CSV Upload' },
}, { timestamps: true });

// Create index for geospatial queries
pollutionDataSchema.index({ latitude: 1, longitude: 1 });

// Export models
export const User = mongoose.model('User', userSchema);
export const Sample = mongoose.model('Sample', sampleSchema);
export const CommunityFeedback = mongoose.model('CommunityFeedback', communityFeedbackSchema);
export const SdgBadge = mongoose.model('SdgBadge', sdgBadgeSchema);
export const SampleSdgAssignment = mongoose.model('SampleSdgAssignment', sampleSdgAssignmentSchema);
export const PollutionData = mongoose.model('PollutionData', pollutionDataSchema);
export const Dataset = mongoose.model('Dataset', datasetSchema);

// Database operations
export class DatabaseService {
  // User operations
  async createUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  }

  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async findUserById(id: string) {
    return await User.findById(id);
  }

  async getAllUsers() {
    return await User.find({}).select('-password');
  }

  async updateUser(id: string, updates: any) {
    return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  }

  // Sample operations
  async createSample(sampleData: any) {
    const sample = new Sample(sampleData);
    return await sample.save();
  }

  async createSamples(samplesData: any[]) {
    // Process samples in batches to avoid overwhelming the database
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < samplesData.length; i += batchSize) {
      const batch = samplesData.slice(i, i + batchSize);
      const batchResults = await Sample.insertMany(batch, { ordered: false });
      results.push(...batchResults);
    }
    
    return results;
  }

  async clearAllSamples() {
    return await Sample.deleteMany({});
  }

  async getAllSamples() {
    return await Sample.find({}).populate('uploadedBy', 'name email');
  }

  async getSamplesByLocation(location?: string) {
    const query = location ? { location: new RegExp(location, 'i') } : {};
    return await Sample.find(query).populate('uploadedBy', 'name email');
  }
  
  async getSamplesByProximity(latitude: number, longitude: number, radiusKm: number = 50) {
    // If using MongoDB with geospatial indexing
    if (mongoose.connection.readyState === 1) {
      try {
        // Convert km to radians (Earth radius is approximately 6371 km)
        const radiusInRadians = radiusKm / 6371;
        
        return await Sample.find({
          location: {
            $geoWithin: {
              $centerSphere: [[longitude, latitude], radiusInRadians]
            }
          }
        }).populate('uploadedBy', 'name email');
      } catch (error) {
        console.error("Geospatial query error:", error);
        // Fallback to simple proximity calculation if geospatial query fails
        return this.getSamplesBySimpleProximity(latitude, longitude, radiusKm);
      }
    } else {
      // Fallback for when MongoDB is not connected
      return this.getSamplesBySimpleProximity(latitude, longitude, radiusKm);
    }
  }
  
  private async getSamplesBySimpleProximity(latitude: number, longitude: number, radiusKm: number = 50) {
    // Simple proximity calculation (not accurate for large distances)
    // Approximate 1 degree of latitude/longitude as 111km
    const degreeRadius = radiusKm / 111;
    
    const samples = await Sample.find({
      latitude: { $gte: latitude - degreeRadius, $lte: latitude + degreeRadius },
      longitude: { $gte: longitude - degreeRadius, $lte: longitude + degreeRadius }
    }).populate('uploadedBy', 'name email');
    
    // Further filter results by calculating actual distance
    return samples.filter(sample => {
      const latDiff = sample.latitude - latitude;
      const lngDiff = sample.longitude - longitude;
      // Simple Euclidean distance (not accurate for large distances)
      const distanceSquared = latDiff * latDiff + lngDiff * lngDiff;
      // Convert to approximate km and compare with radius
      const distanceKm = Math.sqrt(distanceSquared) * 111;
      return distanceKm <= radiusKm;
    });
  }

  async updateSample(id: string, updates: any) {
    return await Sample.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteSample(id: string) {
    return await Sample.findByIdAndDelete(id);
  }

  // Community feedback operations
  async createFeedback(feedbackData: any) {
    const feedback = new CommunityFeedback(feedbackData);
    return await feedback.save();
  }

  async getAllFeedback() {
    return await CommunityFeedback.find({}).populate('userId', 'name email');
  }

  async updateFeedbackStatus(id: string, status: string) {
    return await CommunityFeedback.findByIdAndUpdate(id, { status }, { new: true });
  }

  // SDG Badge operations
  async createSdgBadge(badgeData: any) {
    const badge = new SdgBadge(badgeData);
    return await badge.save();
  }

  async getAllSdgBadges() {
    return await SdgBadge.find({}).sort({ badgeNumber: 1 });
  }

  async getSdgBadgeById(id: string) {
    return await SdgBadge.findById(id);
  }

  async getSdgBadgeByNumber(badgeNumber: number) {
    return await SdgBadge.findOne({ badgeNumber });
  }

  // Sample-SDG Badge assignment operations
  async assignSdgBadgesToSample(sampleId: string, badgeIds: string[], assignedBy: string, notes?: string) {
    const assignments = badgeIds.map(badgeId => ({
      sampleId,
      badgeId,
      assignedBy,
      notes,
    }));
    
    // Use insertMany with ordered: false to continue even if some assignments fail (duplicates)
    try {
      return await SampleSdgAssignment.insertMany(assignments, { ordered: false });
    } catch (error: any) {
      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        // Extract successfully inserted documents
        return error.insertedDocs || [];
      }
      throw error;
    }
  }

  async removeSdgBadgeFromSample(sampleId: string, badgeId: string) {
    return await SampleSdgAssignment.findOneAndDelete({ sampleId, badgeId });
  }

  async getSdgBadgesForSample(sampleId: string) {
    return await SampleSdgAssignment.find({ sampleId })
      .populate('badgeId')
      .populate('assignedBy', 'name email');
  }

  async getSamplesWithSdgBadges() {
    const assignments = await SampleSdgAssignment.find({})
      .populate('sampleId')
      .populate('badgeId')
      .populate('assignedBy', 'name email');
    
    return assignments;
  }

  async getSamplesBySDGBadge(badgeId: string) {
    return await SampleSdgAssignment.find({ badgeId })
      .populate('sampleId')
      .populate('assignedBy', 'name email');
  }

  // Pollution Data operations for persistent CSV uploads
  async createPollutionData(pollutionData: any[]) {
    // Clear existing pollution data first (replace mode)
    await PollutionData.deleteMany({});
    
    // Process data in batches to avoid overwhelming the database
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < pollutionData.length; i += batchSize) {
      const batch = pollutionData.slice(i, i + batchSize);
      const batchResults = await PollutionData.insertMany(batch, { ordered: false });
      results.push(...batchResults);
    }
    
    return results;
  }

  async getAllPollutionData() {
    return await PollutionData.find({}).populate('uploadedBy', 'name email').sort({ createdAt: -1 });
  }

  async clearAllPollutionData() {
    return await PollutionData.deleteMany({});
  }

  async getPollutionDataCount() {
    return await PollutionData.countDocuments();
  }

  async getPollutionDataByLocation(location?: string) {
    const query = location ? { location: new RegExp(location, 'i') } : {};
    return await PollutionData.find(query).populate('uploadedBy', 'name email').sort({ createdAt: -1 });
  }

  // Dataset operations for permanent CSV storage
  async createDataset(datasetData: {
    fileName: string;
    uploadedBy: string;
    data: any[];
    stats: {
      totalRows: number;
      processedEntries: number;
      errorCount: number;
    };
  }) {
    const dataset = new Dataset(datasetData);
    return await dataset.save();
  }

  async getAllDatasets() {
    return await Dataset.find({}).sort({ uploadedAt: -1 });
  }

  async getDatasetById(id: string) {
    return await Dataset.findById(id);
  }

  async deleteDataset(id: string) {
    return await Dataset.findByIdAndDelete(id);
  }

  async getDatasetsByUploader(uploadedBy: string) {
    return await Dataset.find({ uploadedBy }).sort({ uploadedAt: -1 });
  }

  async getDatasetCount() {
    return await Dataset.countDocuments();
  }
}

export const dbService = new DatabaseService();