export type ProductCategory = "bicicleta" | "accesorio" | "repuesto" | "indumentaria";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "on_demand";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  images?: string[] | null;
  category: ProductCategory;
  stock_status: StockStatus;
  created_at: string;
}

export type ReservationStatus = 
  | "confirmed" 
  | "cancelled" 
  | "ingresada" 
  | "en_diagnostico" 
  | "en_trabajo" 
  | "lista_para_retirar" 
  | "entregada";

export interface BikeDetails {
  model_color?: string;
  serial_number?: string;
  issues?: string;
  phone_number?: string;
  extra_charges?: number;
  extra_charges_reason?: string;
  completion_note?: string;
}

export interface Reservation {
  id: string;
  user_id: string | null;
  cal_booking_id?: number | null;
  cal_booking_uid: string | null;
  client_email: string;
  client_name: string;
  phone_number?: string;
  service_type: string;
  bike_brand: string;
  bike_details: BikeDetails | null;
  reservation_date: string; // YYYY-MM-DD
  time_slot: string; // HH:MM:SS
  price: number; // UYU
  extra_charges?: number;
  extra_charges_reason?: string;
  completion_note?: string;
  status: ReservationStatus;
  mechanic_notes: string | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export type Role = "cliente" | "admin";

export const SERVICIOS = [
  { nombre: "Ajuste y Regulación", precioText: "A cotizar en taller" },
  { nombre: "Servicio Básico", precioText: "A cotizar en taller" },
  { nombre: "Engrase General", precioText: "A cotizar en taller" },
] as const;

export const MARCAS_REPRESENTADAS = ["Specialized", "Trek", "Giant", "Scott"];
