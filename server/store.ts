export interface Device {
  id: number;
  username: string;
  device_id: string | null;
  device_name: string | null;
  expire_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  password: string; // Plain/hashed for simplicity
}

export interface MarzbanConfig {
  baseUrl: string;
  username: string;
  password: string;
  isMock: boolean;
}

// In-Memory Database Store with Pre-seeded Sample Data
let nextDeviceId = 4;

const devicesStore: Device[] = [
  {
    id: 1,
    username: "alex_vpn",
    device_id: "android_9921_a",
    device_name: "Samsung Galaxy S23",
    expire_at: new Date(Date.now() + 25 * 86400 * 1000).toISOString(),
    active: true,
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
  },
  {
    id: 2,
    username: "sarah_m",
    device_id: "ios_8812_b",
    device_name: "iPhone 15 Pro Max",
    expire_at: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    active: true,
    created_at: new Date(Date.now() - 27 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
  {
    id: 3,
    username: "john_doe",
    device_id: "android_3310_c",
    device_name: "Google Pixel 8",
    expire_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    active: false,
    created_at: new Date(Date.now() - 32 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  }
];

const adminsStore: AdminUser[] = [
  {
    id: 1,
    name: "System Administrator",
    username: "admin",
    password: "password123", // default credential
  }
];

let marzbanConfigStore: MarzbanConfig = {
  baseUrl: process.env.MARZBAN_URL || "https://marzban.example.com",
  username: process.env.MARZBAN_USERNAME || "admin",
  password: process.env.MARZBAN_PASSWORD || "password",
  isMock: true
};

export const store = {
  getDevices: () => [...devicesStore],
  getDeviceByUsername: (username: string) => devicesStore.find(d => d.username.toLowerCase() === username.toLowerCase()),
  createDevice: (data: Partial<Device> & { username: string }) => {
    const newDevice: Device = {
      id: nextDeviceId++,
      username: data.username,
      device_id: data.device_id || null,
      device_name: data.device_name || null,
      expire_at: data.expire_at || new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
      active: data.active !== undefined ? data.active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    devicesStore.push(newDevice);
    return newDevice;
  },
  updateDevice: (username: string, updates: Partial<Device>) => {
    const idx = devicesStore.findIndex(d => d.username.toLowerCase() === username.toLowerCase());
    if (idx === -1) return null;
    devicesStore[idx] = {
      ...devicesStore[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return devicesStore[idx];
  },
  deleteDevice: (username: string) => {
    const idx = devicesStore.findIndex(d => d.username.toLowerCase() === username.toLowerCase());
    if (idx === -1) return false;
    devicesStore.splice(idx, 1);
    return true;
  },
  getAdmins: () => [...adminsStore],
  getAdminByUsername: (username: string) => adminsStore.find(a => a.username.toLowerCase() === username.toLowerCase()),
  getConfig: () => ({ ...marzbanConfigStore }),
  updateConfig: (config: Partial<MarzbanConfig>) => {
    marzbanConfigStore = { ...marzbanConfigStore, ...config };
    return marzbanConfigStore;
  }
};
