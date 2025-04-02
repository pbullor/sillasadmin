import { 
  wheelchairs, clients, reservations, 
  type Wheelchair, type Client, type Reservation,
  type InsertWheelchair, type InsertClient, type InsertReservation,
  type DashboardStats, type AvailabilityResult
} from "@shared/schema";

export interface IStorage {
  // Wheelchair operations
  getAllWheelchairs(): Promise<Wheelchair[]>;
  getWheelchair(id: number): Promise<Wheelchair | undefined>;
  createWheelchair(wheelchair: InsertWheelchair): Promise<Wheelchair>;
  updateWheelchair(id: number, wheelchair: Partial<InsertWheelchair>): Promise<Wheelchair | undefined>;
  deleteWheelchair(id: number): Promise<boolean>;
  
  // Client operations
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Reservation operations
  getAllReservations(): Promise<Reservation[]>;
  getReservation(id: number): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined>;
  deleteReservation(id: number): Promise<boolean>;
  
  // Business logic operations
  getActiveReservations(): Promise<Reservation[]>;
  checkAvailability(startDate: Date, endDate: Date): Promise<AvailabilityResult>;
  getDashboardStats(): Promise<DashboardStats>;
  incrementWheelchairRentalCount(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private wheelchairsData: Map<number, Wheelchair>;
  private clientsData: Map<number, Client>;
  private reservationsData: Map<number, Reservation>;
  private wheelchairCurrentId: number;
  private clientCurrentId: number;
  private reservationCurrentId: number;

  constructor() {
    this.wheelchairsData = new Map();
    this.clientsData = new Map();
    this.reservationsData = new Map();
    this.wheelchairCurrentId = 1;
    this.clientCurrentId = 1;
    this.reservationCurrentId = 1;

    // Initialize with some sample wheelchairs
    this.initializeData();
  }

  private initializeData() {
    // Add initial wheelchairs (15 as mentioned in requirements)
    const initialWheelchairs: InsertWheelchair[] = [
      { model: "XR-500", brand: "MobilityPlus", year: 2022, motor: "350W", wheelSize: "12\"", lastService: new Date("2023-01-15") },
      { model: "CT-200", brand: "EasyRide", year: 2021, motor: "280W", wheelSize: "10\"", lastService: new Date("2023-02-10") },
      { model: "ZT-800", brand: "PowerMove", year: 2023, motor: "450W", wheelSize: "14\"", lastService: new Date("2023-03-05") },
      { model: "EV-100", brand: "MobilityPlus", year: 2022, motor: "300W", wheelSize: "12\"", lastService: new Date("2023-01-20") },
      { model: "LX-400", brand: "ComfortGlide", year: 2021, motor: "320W", wheelSize: "11\"", lastService: new Date("2023-02-15") },
      { model: "RT-600", brand: "PowerMove", year: 2023, motor: "400W", wheelSize: "13\"", lastService: new Date("2023-03-10") },
      { model: "JN-300", brand: "MobilityPlus", year: 2022, motor: "280W", wheelSize: "10\"", lastService: new Date("2023-01-25") },
      { model: "FT-700", brand: "EasyRide", year: 2021, motor: "420W", wheelSize: "14\"", lastService: new Date("2023-02-20") },
      { model: "GX-250", brand: "ComfortGlide", year: 2023, motor: "270W", wheelSize: "11\"", lastService: new Date("2023-03-15") },
      { model: "VZ-150", brand: "PowerMove", year: 2022, motor: "250W", wheelSize: "10\"", lastService: new Date("2023-01-30") },
      { model: "KS-550", brand: "MobilityPlus", year: 2021, motor: "380W", wheelSize: "12\"", lastService: new Date("2023-02-25") },
      { model: "PT-900", brand: "EasyRide", year: 2023, motor: "470W", wheelSize: "15\"", lastService: new Date("2023-03-20") },
      { model: "DL-350", brand: "ComfortGlide", year: 2022, motor: "310W", wheelSize: "11\"", lastService: new Date("2023-01-05") },
      { model: "QR-450", brand: "PowerMove", year: 2021, motor: "340W", wheelSize: "12\"", lastService: new Date("2023-02-05") },
      { model: "BZ-650", brand: "MobilityPlus", year: 2023, motor: "410W", wheelSize: "13\"", lastService: new Date("2023-03-25") }
    ];

    for (const wheelchair of initialWheelchairs) {
      this.createWheelchair(wheelchair);
    }
  }

  // Wheelchair operations
  async getAllWheelchairs(): Promise<Wheelchair[]> {
    return Array.from(this.wheelchairsData.values());
  }

  async getWheelchair(id: number): Promise<Wheelchair | undefined> {
    return this.wheelchairsData.get(id);
  }

  async createWheelchair(wheelchair: InsertWheelchair): Promise<Wheelchair> {
    const id = this.wheelchairCurrentId++;
    const newWheelchair: Wheelchair = { 
      ...wheelchair, 
      id, 
      rentalCount: 0 
    };
    this.wheelchairsData.set(id, newWheelchair);
    return newWheelchair;
  }

  async updateWheelchair(id: number, wheelchair: Partial<InsertWheelchair>): Promise<Wheelchair | undefined> {
    const existingWheelchair = this.wheelchairsData.get(id);
    if (!existingWheelchair) return undefined;

    const updatedWheelchair: Wheelchair = { ...existingWheelchair, ...wheelchair };
    this.wheelchairsData.set(id, updatedWheelchair);
    return updatedWheelchair;
  }

  async deleteWheelchair(id: number): Promise<boolean> {
    return this.wheelchairsData.delete(id);
  }

  // Client operations
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clientsData.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clientsData.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientCurrentId++;
    const newClient: Client = { ...client, id };
    this.clientsData.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clientsData.get(id);
    if (!existingClient) return undefined;

    const updatedClient: Client = { ...existingClient, ...client };
    this.clientsData.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clientsData.delete(id);
  }

  // Reservation operations
  async getAllReservations(): Promise<Reservation[]> {
    return Array.from(this.reservationsData.values());
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservationsData.get(id);
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const id = this.reservationCurrentId++;
    const newReservation: Reservation = { 
      ...reservation, 
      id, 
      status: "active" 
    };
    this.reservationsData.set(id, newReservation);
    
    // Increment the rental count for the wheelchair
    await this.incrementWheelchairRentalCount(reservation.wheelchairId);
    
    return newReservation;
  }

  async updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const existingReservation = this.reservationsData.get(id);
    if (!existingReservation) return undefined;

    const updatedReservation: Reservation = { ...existingReservation, ...reservation };
    this.reservationsData.set(id, updatedReservation);
    return updatedReservation;
  }

  async deleteReservation(id: number): Promise<boolean> {
    return this.reservationsData.delete(id);
  }

  // Business logic operations
  async getActiveReservations(): Promise<Reservation[]> {
    const today = new Date();
    return Array.from(this.reservationsData.values()).filter(
      reservation => reservation.status === "active" && new Date(reservation.endDate) >= today
    );
  }

  async checkAvailability(startDate: Date, endDate: Date): Promise<AvailabilityResult> {
    // Get all active reservations that overlap with the requested date range
    const overlappingReservations = Array.from(this.reservationsData.values()).filter(reservation => {
      const reservationStart = new Date(reservation.startDate);
      const reservationEnd = new Date(reservation.endDate);
      
      return (
        (startDate <= reservationEnd && endDate >= reservationStart) && 
        reservation.status === "active"
      );
    });
    
    // Get IDs of wheelchairs that are already reserved in the requested period
    const reservedWheelchairIds = new Set(overlappingReservations.map(r => r.wheelchairId));
    
    // Get available wheelchairs (those not in reservedWheelchairIds)
    const availableWheelchairs = Array.from(this.wheelchairsData.values())
      .filter(wheelchair => !reservedWheelchairIds.has(wheelchair.id));
    
    return {
      available: availableWheelchairs.length > 0,
      availableWheelchairs
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    
    const activeReservations = Array.from(this.reservationsData.values()).filter(
      reservation => reservation.status === "active" && new Date(reservation.endDate) >= today
    );
    
    const reservedWheelchairIds = new Set(activeReservations.map(r => r.wheelchairId));
    const totalWheelchairs = this.wheelchairsData.size;
    
    return {
      availableWheelchairs: totalWheelchairs - reservedWheelchairIds.size,
      totalWheelchairs,
      activeReservations: activeReservations.length,
      totalClients: this.clientsData.size
    };
  }

  async incrementWheelchairRentalCount(id: number): Promise<boolean> {
    const wheelchair = this.wheelchairsData.get(id);
    if (!wheelchair) return false;
    
    wheelchair.rentalCount = (wheelchair.rentalCount || 0) + 1;
    this.wheelchairsData.set(id, wheelchair);
    return true;
  }
}

export const storage = new MemStorage();
