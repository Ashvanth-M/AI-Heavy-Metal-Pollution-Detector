# Overview

A React-based Groundwater Heavy Metal Pollution Dashboard that provides comprehensive monitoring and analysis capabilities for water quality data. The application allows users to upload CSV data containing Heavy Metal Pollution Index (HPI) measurements, visualize contamination levels on interactive maps, generate detailed reports, and export findings in multiple formats.

The dashboard categorizes water samples into Safe (HPI < 100), Moderate (100 ≤ HPI < 180), and Critical (HPI ≥ 180) levels, providing real-time alerts for contamination threats and supporting data-driven environmental health decision-making.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React stack with TypeScript, built on Vite for fast development and optimized production builds. The UI is constructed using shadcn/ui components with Radix UI primitives, providing accessible and customizable interface elements. Tailwind CSS handles styling with CSS variables for theming support, enabling light/dark mode functionality.

State management is handled through TanStack Query (React Query) for server state, providing caching, background updates, and optimistic updates. The routing system uses Wouter as a lightweight client-side router. Component animations are powered by Framer Motion for smooth transitions and micro-interactions.

## Backend Architecture  
The backend follows a RESTful API design using Express.js with TypeScript. The server implements a lightweight architecture with in-memory data storage for development/demo purposes, though the structure supports easy migration to persistent databases through the IStorage interface abstraction.

File upload handling uses Multer for processing CSV files, with validation through Zod schemas ensuring data integrity. The API provides endpoints for sample management, CSV upload processing, and analytics generation.

## Data Layer
Database schema is defined using Drizzle ORM with PostgreSQL support configured but currently using in-memory storage. The schema includes a samples table with fields for sample ID, geographic coordinates, HPI values, categorization, and timestamps.

Data validation occurs at multiple layers: CSV parsing validates required headers and data types, Zod schemas ensure type safety, and the categorization logic automatically assigns risk levels based on HPI thresholds.

## Component Architecture
The application follows a feature-based component structure with clear separation of concerns:
- Layout components handle navigation and responsive behavior
- Page components orchestrate feature-specific functionality  
- UI components provide reusable interface elements
- Custom hooks abstract data fetching and business logic

The map functionality integrates Leaflet for interactive geographical visualization with custom markers, popups, and legend components. Chart components use Recharts for data visualization with responsive design.

## Export and Reporting System
The application supports multiple export formats through client-side generation:
- Excel exports use SheetJS (xlsx) for spreadsheet generation
- PDF reports use jsPDF with autoTable plugin for formatted documents
- The backend provides report generation endpoints for server-side processing

# External Dependencies

## UI and Styling
- **shadcn/ui with Radix UI**: Provides accessible, customizable component primitives for buttons, dialogs, forms, and complex interactions
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing and custom theme configuration
- **Framer Motion**: Animation library for page transitions, component animations, and micro-interactions
- **Lucide React**: Icon library providing consistent iconography throughout the application

## Data Visualization and Mapping
- **Leaflet with react-leaflet**: Interactive map library for geographic data visualization with marker clustering and custom overlays
- **Recharts**: Chart library built on D3 for responsive bar charts, line charts, and data visualizations

## Data Management and Validation
- **TanStack Query**: Server state management with caching, background synchronization, and optimistic updates
- **Zod**: Schema validation library for runtime type checking and data validation
- **React Hook Form**: Form state management with validation integration

## Database and ORM
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support and migration capabilities
- **Neon Database Serverless**: Serverless PostgreSQL driver for database connections

## File Processing and Export
- **Multer**: Express middleware for handling multipart/form-data and file uploads
- **SheetJS (xlsx)**: Library for reading, writing, and manipulating spreadsheet files
- **jsPDF with autoTable**: PDF generation with table formatting capabilities

## Development and Build Tools
- **Vite**: Build tool and development server with React plugin and TypeScript support
- **TypeScript**: Static type checking with strict configuration for enhanced code safety
- **ESBuild**: Fast JavaScript bundler used by Vite for production builds