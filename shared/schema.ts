import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Wheelchairs Table
export const wheelchairs = pgTable("wheelchairs", {
  id: serial("id").primaryKey(),
  model: text("model").notNull(),
  brand: text("brand").notNull(),
  year: integer("year").notNull(),
  motor: text("motor").notNull(),
  rentalCount: integer("rental_count").default(0),
  wheelSize: text("wheel_size").notNull(),
  lastService: date("last_service"),
});

// Clients Table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dni: text("dni").notNull().unique(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  registerDate: date("register_date").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
});

// Reservations Table
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  wheelchairId: integer("wheelchair_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
});

// Insert Schemas
export const insertWheelchairSchema = createInsertSchema(wheelchairs).pick({
  model: true,
  brand: true,
  year: true,
  motor: true,
  wheelSize: true,
  lastService: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  firstName: true,
  lastName: true,
  dni: true,
  address: true,
  phone: true,
  email: true,
  registerDate: true,
  city: true,
  country: true,
});

export const insertReservationSchema = createInsertSchema(reservations).pick({
  clientId: true,
  wheelchairId: true,
  startDate: true,
  endDate: true,
  notes: true,
});

// Custom Schemas with Validation
export const wheelchairSchema = insertWheelchairSchema.extend({
  year: z.number().min(2000).max(new Date().getFullYear()),
});

export const clientSchema = insertClientSchema.extend({
  email: z.string().email(),
  phone: z.string().min(6),
  dni: z.string().min(6),
});

export const reservationSchema = insertReservationSchema.extend({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

// Types
export type Wheelchair = typeof wheelchairs.$inferSelect;
export type InsertWheelchair = z.infer<typeof insertWheelchairSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

// Extended types for frontend use
export type ReservationWithDetails = Reservation & {
  client: Client;
  wheelchair: Wheelchair;
};

export type AvailabilityCheck = {
  startDate: Date;
  endDate: Date;
};

export type AvailabilityResult = {
  available: boolean;
  availableWheelchairs: Wheelchair[];
};

export type DashboardStats = {
  availableWheelchairs: number;
  totalWheelchairs: number;
  activeReservations: number;
  totalClients: number;
};
