export type ProductCategory = "bicicleta" | "accesorio" | "repuesto" | "indumentaria";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "on_demand";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
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
}

export interface Reservation {
  id: string;
  user_id: string | null;
  cal_booking_id: number;
  cal_booking_uid: string | null;
  client_email: string;
  client_name: string;
  service_type: string;
  bike_brand: string;
  bike_details: BikeDetails | null;
  reservation_date: string; // YYYY-MM-DD
  time_slot: string; // HH:MM:SS
  price: number; // UYU
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
  { nombre: "Ajuste y Regulación", precio: 900 },
  { nombre: "Servicio Básico", precio: 2000 },
  { nombre: "Engrase General", precio: 2600 },
] as const;

export const MARCAS_REPRESENTADAS = ["Specialized", "Trek", "Giant", "Scott"];
