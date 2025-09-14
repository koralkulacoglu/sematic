import { client, isLocal } from '../amplify-config';
import { getCurrentUser } from 'aws-amplify/auth';

// Mock data for development when Amplify isn't configured
const MOCK_USER = {
  userId: 'dev-user-123',
  signInDetails: { loginId: 'dev@example.com' }
};

class WhiteboardService {
  constructor() {
    // Use isLocal flag from amplify-config to determine behavior
    this.useLocalStorage = isLocal;
    console.log('WhiteboardService - Using local storage:', this.useLocalStorage);
  }

  // Helper method to get current user (mock or real)
  async getCurrentUserSafe() {
    if (this.useLocalStorage) {
      return MOCK_USER;
    }
    try {
      return await getCurrentUser();
    } catch (error) {
      console.log('Using mock user for development');
      return MOCK_USER;
    }
  }

  // LocalStorage helpers for development
  getLocalWhiteboards() {
    const stored = localStorage.getItem('whiteboards');
    return stored ? JSON.parse(stored) : [];
  }

  saveLocalWhiteboards(whiteboards) {
    localStorage.setItem('whiteboards', JSON.stringify(whiteboards));
  }
  // User Profile methods
  async getCurrentUserProfile() {
    if (this.useLocalStorage) {
      // Return mock profile for development
      return {
        userId: MOCK_USER.userId,
        email: MOCK_USER.signInDetails.loginId,
        name: 'Development User',
        whiteboardIds: [],
        editorWhiteboardIds: []
      };
    }

    try {
      const user = await getCurrentUser();
      const { data: profiles } = await client.models.UserProfile.list({
        filter: { userId: { eq: user.userId } }
      });
      
      return profiles[0] || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async createUserProfile(userData) {
    try {
      const user = await getCurrentUser();
      const { data: profile } = await client.models.UserProfile.create({
        userId: user.userId,
        email: user.signInDetails?.loginId || '',
        name: userData.name || '',
        profilePicture: userData.profilePicture,
        whiteboardIds: [],
        editorWhiteboardIds: [],
      });
      
      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  async updateUserProfile(updates) {
    try {
      const user = await getCurrentUser();
      const { data: profile } = await client.models.UserProfile.update({
        userId: user.userId,
        ...updates,
      });
      
      return profile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // Whiteboard methods
  async getUserWhiteboards() {
    if (this.useLocalStorage) {
      // Use localStorage for development
      return this.getLocalWhiteboards();
    }

    try {
      const user = await getCurrentUser();
      const userEmail = user.signInDetails?.loginId || '';
      
      // Get whiteboards where user is owner
      const { data: ownedWhiteboards } = await client.models.Whiteboard.list({
        filter: { ownerId: { eq: user.userId } }
      });

      // Get whiteboards where user is an editor
      const { data: allWhiteboards } = await client.models.Whiteboard.list();
      const editorWhiteboards = allWhiteboards.filter(wb => 
        wb.editors?.includes(userEmail) || wb.editors?.includes(user.userId)
      );

      // Combine and deduplicate
      const whiteboardMap = new Map();
      [...ownedWhiteboards, ...editorWhiteboards].forEach(wb => {
        whiteboardMap.set(wb.id, wb);
      });

      return Array.from(whiteboardMap.values());
    } catch (error) {
      console.error('Error getting user whiteboards:', error);
      return [];
    }
  }

  async createWhiteboard(name, initialData) {
    if (this.useLocalStorage) {
      // Use localStorage for development
      const user = await this.getCurrentUserSafe();
      const newWhiteboard = {
        id: 'wb-' + Date.now(),
        name,
        data: initialData || { nodes: [], edges: [] },
        ownerId: user.userId,
        ownerEmail: user.signInDetails.loginId,
        editors: [],
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const whiteboards = this.getLocalWhiteboards();
      whiteboards.push(newWhiteboard);
      this.saveLocalWhiteboards(whiteboards);
      
      return newWhiteboard;
    }

    try {
      const user = await getCurrentUser();
      const userEmail = user.signInDetails?.loginId || '';
      
      const { data: whiteboard } = await client.models.Whiteboard.create({
        name,
        data: initialData || { nodes: [], edges: [] },
        ownerId: user.userId,
        ownerEmail: userEmail,
        editors: [],
        isPublic: false,
      });
      
      return whiteboard;
    } catch (error) {
      console.error('Error creating whiteboard:', error);
      return null;
    }
  }

  async getWhiteboard(id) {
    if (this.useLocalStorage) {
      // Use localStorage for development
      const whiteboards = this.getLocalWhiteboards();
      return whiteboards.find(wb => wb.id === id) || null;
    }

    try {
      const { data: whiteboard } = await client.models.Whiteboard.get({ id });
      return whiteboard;
    } catch (error) {
      console.error('Error getting whiteboard:', error);
      return null;
    }
  }

  async updateWhiteboard(id, updates) {
    if (this.useLocalStorage) {
      // Use localStorage for development
      const whiteboards = this.getLocalWhiteboards();
      const index = whiteboards.findIndex(wb => wb.id === id);
      if (index !== -1) {
        const user = await this.getCurrentUserSafe();
        whiteboards[index] = {
          ...whiteboards[index],
          ...updates,
          lastModifiedBy: user.signInDetails.loginId,
          updatedAt: new Date().toISOString()
        };
        this.saveLocalWhiteboards(whiteboards);
        return whiteboards[index];
      }
      return null;
    }

    try {
      const user = await getCurrentUser();
      const userEmail = user.signInDetails?.loginId || '';
      
      const { data: whiteboard } = await client.models.Whiteboard.update({
        id,
        ...updates,
        lastModifiedBy: userEmail,
      });
      
      return whiteboard;
    } catch (error) {
      console.error('Error updating whiteboard:', error);
      return null;
    }
  }

  async deleteWhiteboard(id) {
    if (this.useLocalStorage) {
      // Use localStorage for development
      const whiteboards = this.getLocalWhiteboards();
      const filteredWhiteboards = whiteboards.filter(wb => wb.id !== id);
      this.saveLocalWhiteboards(filteredWhiteboards);
      return true;
    }

    try {
      await client.models.Whiteboard.delete({ id });
      return true;
    } catch (error) {
      console.error('Error deleting whiteboard:', error);
      return false;
    }
  }

  async addEditor(whiteboardId, editorEmail) {
    try {
      const whiteboard = await this.getWhiteboard(whiteboardId);
      if (!whiteboard) return false;

      const updatedEditors = [...(whiteboard.editors || []), editorEmail];
      const updated = await this.updateWhiteboard(whiteboardId, {
        editors: updatedEditors
      });
      
      return !!updated;
    } catch (error) {
      console.error('Error adding editor:', error);
      return false;
    }
  }

  async removeEditor(whiteboardId, editorEmail) {
    try {
      const whiteboard = await this.getWhiteboard(whiteboardId);
      if (!whiteboard) return false;

      const updatedEditors = (whiteboard.editors || []).filter(e => e !== editorEmail);
      const updated = await this.updateWhiteboard(whiteboardId, {
        editors: updatedEditors
      });
      
      return !!updated;
    } catch (error) {
      console.error('Error removing editor:', error);
      return false;
    }
  }

  // Permission checks
  async canUserEdit(whiteboardId) {
    try {
      const user = await this.getCurrentUserSafe();
      const whiteboard = await this.getWhiteboard(whiteboardId);
      
      if (!whiteboard) return false;
      
      const userEmail = user.signInDetails?.loginId || '';
      return whiteboard.ownerId === user.userId || 
             whiteboard.editors?.includes(userEmail) ||
             whiteboard.editors?.includes(user.userId);
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      return false;
    }
  }

  async canUserUseAI(whiteboardId) {
    try {
      const user = await this.getCurrentUserSafe();
      const whiteboard = await this.getWhiteboard(whiteboardId);
      
      if (!whiteboard) return false;
      
      // Only owners can use AI
      return whiteboard.ownerId === user.userId;
    } catch (error) {
      console.error('Error checking AI permissions:', error);
      return false;
    }
  }

  // Real-time collaboration methods
  async subscribeToWhiteboardChanges(whiteboardId, callback) {
    if (this.useLocalStorage) {
      // Mock subscription for development
      console.log('Mock subscription to whiteboard changes:', whiteboardId);
      return { unsubscribe: () => console.log('Mock unsubscribe') };
    }

    try {
      // Subscribe to whiteboard updates
      const subscription = client.models.Whiteboard.onUpdate({
        filter: { id: { eq: whiteboardId } }
      }).subscribe({
        next: (data) => callback(data),
        error: (error) => console.error('Subscription error:', error),
      });

      return subscription;
    } catch (error) {
      console.error('Error setting up subscription:', error);
      return null;
    }
  }

  async subscribeToWhiteboardEvents(whiteboardId, callback) {
    if (this.useLocalStorage) {
      // Mock subscription for development
      console.log('Mock subscription to whiteboard events:', whiteboardId);
      return { unsubscribe: () => console.log('Mock unsubscribe') };
    }

    try {
      // Subscribe to real-time collaboration events
      const subscription = client.models.WhiteboardEvent.onCreate({
        filter: { whiteboardId: { eq: whiteboardId } }
      }).subscribe({
        next: (data) => callback(data),
        error: (error) => console.error('Event subscription error:', error),
      });

      return subscription;
    } catch (error) {
      console.error('Error setting up event subscription:', error);
      return null;
    }
  }

  async sendWhiteboardEvent(whiteboardId, eventType, eventData) {
    if (this.useLocalStorage) {
      // Mock event sending for development
      console.log('Mock event:', { whiteboardId, eventType, eventData });
      return;
    }

    try {
      const user = await getCurrentUser();
      const userEmail = user.signInDetails?.loginId || '';
      
      await client.models.WhiteboardEvent.create({
        whiteboardId,
        userId: user.userId,
        userEmail,
        eventType: eventType,
        eventData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending whiteboard event:', error);
    }
  }
}

export const whiteboardService = new WhiteboardService();
export default whiteboardService;