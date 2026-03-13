import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // "admin", "user", or "researcher"
  location: text("location"),
  isApproved: boolean("is_approved").default(false),
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced samples table with detailed heavy metal data
export const samples = pgTable("samples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sampleId: text("sample_id").notNull().unique(),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  dateCollected: timestamp("date_collected").notNull(),
  
  // Water quality parameters
  ph: real("ph"),
  
  // Heavy metals (in mg/L or µg/L)
  lead: real("lead"),
  cadmium: real("cadmium"),
  arsenic: real("arsenic"),
  mercury: real("mercury"),
  chromium: real("chromium"),
  nickel: real("nickel"),
  zinc: real("zinc"),
  copper: real("copper"),
  
  // Calculated values
  hpi: real("hpi").notNull(),
  pli: real("pli"), // Pollution Load Index
  category: text("category").notNull(),
  exceedsWhoLimits: boolean("exceeds_who_limits").default(false),
  
  // Metadata
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  notes: text("notes"),
});

// Feedback/reports from community
export const communityFeedback = pgTable("community_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  description: text("description").notNull(),
  suspectedPollutants: text("suspected_pollutants"),
  contactInfo: text("contact_info"),
  status: text("status").default("pending"), // pending, investigating, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  location: z.string().optional(),
  role: z.enum(["admin", "user", "researcher"]).default("user"),
});

// Sample schemas
export const insertSampleSchema = createInsertSchema(samples).omit({
  id: true,
  uploadedAt: true,
  uploadedBy: true,
  hpi: true,
  category: true,
  exceedsWhoLimits: true,
});

export const manualSampleSchema = z.object({
  sampleId: z.string().min(1, "Sample ID is required"),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  dateCollected: z.string().transform((str) => new Date(str)),
  ph: z.number().min(0).max(14).optional(),
  lead: z.number().min(0).optional(),
  cadmium: z.number().min(0).optional(),
  arsenic: z.number().min(0).optional(),
  mercury: z.number().min(0).optional(),
  chromium: z.number().min(0).optional(),
  nickel: z.number().min(0).optional(),
  zinc: z.number().min(0).optional(),
  copper: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Community feedback schema
export const communityFeedbackSchema = createInsertSchema(communityFeedback).omit({
  id: true,
  createdAt: true,
  userId: true,
});

// SDG Badges table
export const sdgBadges = pgTable("sdg_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  badgeNumber: integer("badge_number").notNull().unique(), // 1-17
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  color: text("color").notNull(), // hex color for the badge
  createdAt: timestamp("created_at").defaultNow(),
});

// Sample-SDG Badge associations (many-to-many)
export const sampleSdgBadges = pgTable("sample_sdg_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id").references(() => samples.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id").references(() => sdgBadges.id, { onDelete: "cascade" }),
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"), // Admin notes for why this SDG is relevant
});

export const csvSampleSchema = z.object({
  sample_id: z.string().min(1, "Sample ID is required"),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  date_collected: z.string().transform((str) => new Date(str)),
  ph: z.number().min(0).max(14).optional(),
  lead: z.number().min(0).optional(),
  cadmium: z.number().min(0).optional(),
  arsenic: z.number().min(0).optional(),
  mercury: z.number().min(0).optional(),
  chromium: z.number().min(0).optional(),
  nickel: z.number().min(0).optional(),
  zinc: z.number().min(0).optional(),
  copper: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type SignupRequest = z.infer<typeof signupSchema>;

export type Sample = typeof samples.$inferSelect;
export type InsertSample = z.infer<typeof insertSampleSchema>;
export type ManualSample = z.infer<typeof manualSampleSchema>;
export type CSVSample = z.infer<typeof csvSampleSchema>;

export type CommunityFeedback = typeof communityFeedback.$inferSelect;
export type InsertCommunityFeedback = z.infer<typeof communityFeedbackSchema>;

export type SdgBadge = typeof sdgBadges.$inferSelect;
export type InsertSdgBadge = typeof sdgBadges.$inferInsert;

export type SampleSdgBadge = typeof sampleSdgBadges.$inferSelect;
export type InsertSampleSdgBadge = typeof sampleSdgBadges.$inferInsert;

// SDG Badge schemas
export const insertSdgBadgeSchema = createInsertSchema(sdgBadges).omit({
  id: true,
  createdAt: true,
});

export const assignSdgBadgeSchema = z.object({
  sampleId: z.string().min(1, "Sample ID is required"),
  badgeIds: z.array(z.string()).min(1, "At least one SDG badge must be selected"),
  notes: z.string().optional(),
});

// Analytics interface for reports
export interface Analytics {
  totalSamples: number;
  safePercentage: number;
  moderatePercentage: number;
  criticalPercentage: number;
  categoryCounts: {
    Safe: number;
    Moderate: number;
    Critical: number;
  };
  hasCriticalSamples: boolean;
  criticalSamplesCount: number;
}

// WHO limits for heavy metals (in mg/L)
export const WHO_LIMITS = {
  lead: 0.01,
  cadmium: 0.003,
  arsenic: 0.01,
  mercury: 0.006,
  chromium: 0.05,
  nickel: 0.07,
  zinc: 3.0,
  copper: 2.0,
  ph: { min: 6.5, max: 8.5 },
};

// Helper function to calculate HPI (Heavy Metal Pollution Index)
export function calculateHPI(metals: {
  lead?: number;
  cadmium?: number;
  arsenic?: number;
  mercury?: number;
  chromium?: number;
  nickel?: number;
  zinc?: number;
  copper?: number;
}): number {
  let totalWeightedIndex = 0;
  let totalWeight = 0;
  
  const metalWeights = {
    lead: 5,
    cadmium: 5,
    arsenic: 5,
    mercury: 5,
    chromium: 3,
    nickel: 3,
    zinc: 1,
    copper: 2,
  };
  
  Object.entries(metals).forEach(([metal, concentration]) => {
    if (concentration !== undefined && concentration > 0) {
      const limit = WHO_LIMITS[metal as keyof typeof WHO_LIMITS] as number;
      const weight = metalWeights[metal as keyof typeof metalWeights];
      
      if (limit && weight) {
        const subIndex = (concentration / limit) * 100;
        totalWeightedIndex += weight * subIndex;
        totalWeight += weight;
      }
    }
  });
  
  return totalWeight > 0 ? totalWeightedIndex / totalWeight : 0;
}

// Helper function to categorize HPI values
export function categorizeHPI(hpi: number): string {
  if (hpi < 100) return "Safe";
  if (hpi < 180) return "Moderate";
  return "Critical";
}

// Helper function to check if sample exceeds WHO limits
export function checkWHOLimits(sample: {
  ph?: number;
  lead?: number;
  cadmium?: number;
  arsenic?: number;
  mercury?: number;
  chromium?: number;
  nickel?: number;
  zinc?: number;
  copper?: number;
}): boolean {
  // Check pH range
  if (sample.ph && (sample.ph < WHO_LIMITS.ph.min || sample.ph > WHO_LIMITS.ph.max)) {
    return true;
  }
  
  // Check metal concentrations
  const metalChecks = [
    { value: sample.lead, limit: WHO_LIMITS.lead },
    { value: sample.cadmium, limit: WHO_LIMITS.cadmium },
    { value: sample.arsenic, limit: WHO_LIMITS.arsenic },
    { value: sample.mercury, limit: WHO_LIMITS.mercury },
    { value: sample.chromium, limit: WHO_LIMITS.chromium },
    { value: sample.nickel, limit: WHO_LIMITS.nickel },
    { value: sample.zinc, limit: WHO_LIMITS.zinc },
    { value: sample.copper, limit: WHO_LIMITS.copper },
  ];
  
  return metalChecks.some(({ value, limit }) => value && value > limit);
}
