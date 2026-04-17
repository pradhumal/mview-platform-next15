// Mock user profile data
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    defaultAlertRadius: number;
    contextMode: "simple" | "detailed";
  };
  stats: {
    totalMinerals: number;
    totalAcreage: number;
    statesActive: string[];
    lastChecked: string;
    unreadAlerts: number;
  };
}

export const mockUserProfile: UserProfile = {
  id: "user-1",
  email: "owner@example.com",
  displayName: "Johnson Family Trust",
  createdAt: "2024-06-15",
  lastLoginAt: "2025-02-09T08:30:00Z",
  preferences: {
    emailNotifications: true,
    pushNotifications: false,
    defaultAlertRadius: 5,
    contextMode: "simple",
  },
  stats: {
    totalMinerals: 3,
    totalAcreage: 560,
    statesActive: ["Texas"],
    lastChecked: "2025-02-09T09:15:00Z",
    unreadAlerts: 2,
  },
};
