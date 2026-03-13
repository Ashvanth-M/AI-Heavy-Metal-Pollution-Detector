import fs from 'fs';
import path from 'path';
import { IDataset } from './database';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(STORAGE_DIR, 'upload-history.json');

// Ensure storage directory exists
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

// File-based storage for upload history
export class FileStorage {
  
  // Save dataset to file storage
  async saveDataset(datasetData: Omit<IDataset, '_id'> & { _id?: string }): Promise<IDataset> {
    ensureStorageDir();
    
    const dataset: IDataset = {
      ...datasetData,
      _id: datasetData._id || `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let history: IDataset[] = [];
    
    // Read existing history
    if (fs.existsSync(HISTORY_FILE)) {
      try {
        const data = fs.readFileSync(HISTORY_FILE, 'utf8');
        history = JSON.parse(data);
      } catch (error) {
        console.warn('Error reading history file, starting fresh:', error);
        history = [];
      }
    }
    
    // Add new dataset
    history.push(dataset);
    
    // Write back to file
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    
    return dataset;
  }
  
  // Get all datasets from file storage
  async getAllDatasets(): Promise<IDataset[]> {
    ensureStorageDir();
    
    if (!fs.existsSync(HISTORY_FILE)) {
      return [];
    }
    
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      const history = JSON.parse(data);
      
      // Sort by uploadedAt descending
      return history.sort((a: IDataset, b: IDataset) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    } catch (error) {
      console.error('Error reading history file:', error);
      return [];
    }
  }
  
  // Get datasets by uploader
  async getDatasetsByUploader(uploadedBy: string): Promise<IDataset[]> {
    const allDatasets = await this.getAllDatasets();
    return allDatasets.filter(dataset => dataset.uploadedBy === uploadedBy);
  }
  
  // Get dataset by ID
  async getDatasetById(id: string): Promise<IDataset | null> {
    const allDatasets = await this.getAllDatasets();
    return allDatasets.find(dataset => dataset._id === id) || null;
  }
  
  // Delete dataset
  async deleteDataset(id: string): Promise<IDataset | null> {
    ensureStorageDir();
    
    if (!fs.existsSync(HISTORY_FILE)) {
      return null;
    }
    
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      let history = JSON.parse(data);
      
      const datasetIndex = history.findIndex((dataset: IDataset) => dataset._id === id);
      if (datasetIndex === -1) {
        return null;
      }
      
      const deletedDataset = history[datasetIndex];
      history.splice(datasetIndex, 1);
      
      // Write back to file
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
      
      return deletedDataset;
    } catch (error) {
      console.error('Error deleting from history file:', error);
      return null;
    }
  }
  
  // Get dataset count
  async getDatasetCount(): Promise<number> {
    const allDatasets = await this.getAllDatasets();
    return allDatasets.length;
  }
}

export const fileStorage = new FileStorage();