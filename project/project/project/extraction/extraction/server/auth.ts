import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
import { dbService } from './database';
import type { Request, Response, NextFunction } from 'express';

// Define user roles type for type safety
type UserRole = 'admin' | 'user' | 'moderator' | 'editor';

// Mock users for development when MongoDB is not available
export const mockUsers = [
  {
    _id: 'admin-mock-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    isApproved: true,
    isBlocked: false,
    comparePassword: async (password: string) => password === 'admin123'
  },
  {
    _id: 'user-mock-id',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    isApproved: true,
    isBlocked: false,
    comparePassword: async (password: string) => password === 'user123'
  },
  {
    _id: 'researcher-mock-id',
    email: 'researcher@example.com',
    name: 'Researcher User',
    role: 'researcher',
    isApproved: true,
    isBlocked: false,
    comparePassword: async (password: string) => password === 'researcher123'
  }
];

// Legacy reference for backward compatibility
const mockAdminUser = mockUsers[0];

// Helper function to check if MongoDB is connected
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Configure Passport Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      let user;
      
      if (isMongoConnected()) {
        user = await dbService.findUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isPasswordValid = await (user as any).comparePassword(password);
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }
      } else {
        // Use mock users for development
        user = mockUsers.find(mockUser => mockUser.email === email);
        
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }
      }

      if (user.isBlocked) {
        return done(null, false, { message: 'Your account has been blocked' });
      }

      if (!user.isApproved && user.role === 'user') {
        return done(null, false, { message: 'Your account is pending approval' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    if (isMongoConnected()) {
      const user = await dbService.findUserById(id);
      done(null, user);
    } else {
      // Use mock users for development
      const user = mockUsers.find(mockUser => mockUser._id === id);
      done(null, user || null);
    }
  } catch (error) {
    done(error);
  }
});

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}

// Middleware to check if user is admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && (req.user as any).role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
}

// Middleware to check if user is approved
export function requireApproved(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    const user = req.user as any;
    if (user.role === 'admin' || user.isApproved) {
      return next();
    }
    return res.status(403).json({ message: 'Account approval required' });
  }
  res.status(401).json({ message: 'Authentication required' });
}

// Middleware to check if user has a specific role
export function requireRole(roles: string | string[]) {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      req.isAuthenticated() &&
      req.user &&
      requiredRoles.includes((req.user as any).role)
    ) {
      return next();
    }
    res.status(403).json({ message: `${requiredRoles.join(',')} access required` });
  };
}

// Middleware to check if user has any of the specified roles
export function requireAnyRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user && roles.includes((req.user as any).role)) {
      return next();
    }
    res.status(403).json({ message: 'Insufficient permissions' });
  };
}

// Middleware to check if user is a regular user
export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && (req.user as any).role === 'user') {
    return next();
  }
  res.status(403).json({ message: 'User access required' });
}

export default passport;