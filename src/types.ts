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

export interface AdminInfo {
  id: number;
  name: string;
  username: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  expired_users: number;
  banned_users: number;
}

export interface MarzbanUser {
  username: string;
  status: string;
  expire: number;
  data_limit: number;
  used_traffic: number;
  created_at?: string;
  subscription_url?: string;
}

export interface MarzbanConfig {
  baseUrl: string;
  username: string;
  password?: string;
  isMock: boolean;
}
