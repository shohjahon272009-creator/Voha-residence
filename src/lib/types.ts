 
 
 
 
 
export type ProjectStatus = 'Jarayonda' | 'Topshirilgan' | 'Tez kunda' | 'Sanoqli kunlar qoldi';
export type ApartmentStatus = 'Bo\'sh' | 'Band' | 'Bronlangan';
export type BookingStatus = 'Yangi' | 'Ko\'rib chiqilmoqda' | 'Tasdiqlangan' | 'Bekor qilingan';
export type UserRole = 'superadmin' | 'menejer' | 'operator';

export interface Project {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  address: string;
  city: string;
  district: string;
  status: ProjectStatus;
  min_price: number;
  total_floors: number;
  main_image: string;
  gallery: string[]; // Parsed from JSON string
  lat: number;
  lng: number;
  amenities: string[]; // Parsed from JSON string
  apts_per_floor: number;
  days_left: number;
  virtual_tour_url?: string; // 360° virtual tour embed/share URL (single panorama or external)
  tour_scenes?: string;      // JSON string of TourScene[] — multi-scene tour with hotspots
}

// One hotspot inside a panorama that teleports the viewer to another scene.
export interface TourHotspot {
  pitch: number;   // vertical angle (deg)
  yaw: number;     // horizontal angle (deg)
  target: string;  // id of the scene to jump to
  label?: string;  // tooltip text
}

// One 360° scene in a multi-scene virtual tour.
export interface TourScene {
  id: string;
  name: string;
  image: string;            // panorama image URL
  hotspots?: TourHotspot[];
}

export interface Apartment {
  id: number;
  project_id: number;
  floor: number;
  number: string;
  rooms: number;
  area: number;
  price_cash: number;
  price_installment: number;
  status: ApartmentStatus;
  plan_image: string;
  image: string;
  orientation: string;
  note: string;
}

export interface Booking {
  id: number;
  apartment_id: number;
  client_name: string;
  client_phone: string;
  payment_type: string;
  status: BookingStatus;
  created_at: string;
  manager_id: number;
  note: string;
}

export interface News {
  id: number;
  title_uz: string;
  title_ru: string;
  title_en: string;
  content_uz: string;
  content_ru: string;
  content_en: string;
  image: string;
  category: string;
  date: string;
  visible: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
