import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertWheelchairSchema, 
  insertClientSchema, 
  insertReservationSchema, 
  wheelchairSchema, 
  clientSchema, 
  reservationSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to validate request body against a zod schema
  const validateBody = (schema: z.ZodSchema) => async (req: Request, res: Response, next: Function) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(400).json({ error: "Invalid request data" });
      }
    }
  };

  // API Routes
  const apiRouter = express.Router();
  
  // Wheelchairs Endpoints
  apiRouter.get("/wheelchairs", async (req, res) => {
    try {
      const wheelchairs = await storage.getAllWheelchairs();
      res.json(wheelchairs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wheelchairs" });
    }
  });

  apiRouter.get("/wheelchairs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const wheelchair = await storage.getWheelchair(id);
      
      if (!wheelchair) {
        return res.status(404).json({ error: "Wheelchair not found" });
      }
      
      res.json(wheelchair);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wheelchair" });
    }
  });

  apiRouter.post("/wheelchairs", validateBody(wheelchairSchema), async (req, res) => {
    try {
      const wheelchair = await storage.createWheelchair(req.body);
      res.status(201).json(wheelchair);
    } catch (error) {
      res.status(500).json({ error: "Failed to create wheelchair" });
    }
  });

  apiRouter.put("/wheelchairs/:id", validateBody(wheelchairSchema.partial()), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedWheelchair = await storage.updateWheelchair(id, req.body);
      
      if (!updatedWheelchair) {
        return res.status(404).json({ error: "Wheelchair not found" });
      }
      
      res.json(updatedWheelchair);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wheelchair" });
    }
  });

  apiRouter.delete("/wheelchairs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWheelchair(id);
      
      if (!success) {
        return res.status(404).json({ error: "Wheelchair not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wheelchair" });
    }
  });

  // Clients Endpoints
  apiRouter.get("/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  apiRouter.get("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  apiRouter.post("/clients", validateBody(clientSchema), async (req, res) => {
    try {
      const client = await storage.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  apiRouter.put("/clients/:id", validateBody(clientSchema.partial()), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedClient = await storage.updateClient(id, req.body);
      
      if (!updatedClient) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  apiRouter.delete("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Reservations Endpoints
  apiRouter.get("/reservations", async (req, res) => {
    try {
      const reservations = await storage.getAllReservations();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  apiRouter.get("/reservations/active", async (req, res) => {
    try {
      const activeReservations = await storage.getActiveReservations();
      res.json(activeReservations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active reservations" });
    }
  });

  apiRouter.get("/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservation(id);
      
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reservation" });
    }
  });

  apiRouter.post("/reservations", validateBody(reservationSchema), async (req, res) => {
    try {
      // Check if the client exists
      const client = await storage.getClient(req.body.clientId);
      if (!client) {
        return res.status(400).json({ error: "Client not found" });
      }
      
      // Check if the wheelchair exists
      const wheelchair = await storage.getWheelchair(req.body.wheelchairId);
      if (!wheelchair) {
        return res.status(400).json({ error: "Wheelchair not found" });
      }
      
      // Check if the date range is valid
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({ error: "End date must be after start date" });
      }
      
      // Check if the wheelchair is available for the requested dates
      const availability = await storage.checkAvailability(startDate, endDate);
      const isWheelchairAvailable = availability.availableWheelchairs.some(w => w.id === req.body.wheelchairId);
      
      if (!isWheelchairAvailable) {
        return res.status(400).json({ error: "Wheelchair is not available for the requested dates" });
      }
      
      const reservation = await storage.createReservation(req.body);
      res.status(201).json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create reservation" });
    }
  });

  apiRouter.put("/reservations/:id", validateBody(reservationSchema.partial()), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // If updating dates or wheelchair, check availability
      if ((req.body.startDate || req.body.endDate || req.body.wheelchairId) && !(req.body.status === "cancelled")) {
        const existingReservation = await storage.getReservation(id);
        if (!existingReservation) {
          return res.status(404).json({ error: "Reservation not found" });
        }
        
        const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date(existingReservation.startDate);
        const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(existingReservation.endDate);
        const wheelchairId = req.body.wheelchairId || existingReservation.wheelchairId;
        
        if (startDate >= endDate) {
          return res.status(400).json({ error: "End date must be after start date" });
        }
        
        // For updating, we need to exclude the current reservation from availability check
        const availability = await storage.checkAvailability(startDate, endDate);
        const allReservations = await storage.getAllReservations();
        const overlappingReservations = allReservations.filter(r => 
          r.id !== id && 
          r.wheelchairId === wheelchairId && 
          r.status === "active" &&
          new Date(r.startDate) <= endDate && 
          new Date(r.endDate) >= startDate
        );
        
        if (overlappingReservations.length > 0) {
          return res.status(400).json({ error: "Wheelchair is not available for the requested dates" });
        }
      }
      
      const updatedReservation = await storage.updateReservation(id, req.body);
      
      if (!updatedReservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      
      res.json(updatedReservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reservation" });
    }
  });

  apiRouter.delete("/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReservation(id);
      
      if (!success) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reservation" });
    }
  });

  // Availability Checking Endpoint
  apiRouter.get("/availability", async (req, res) => {
    try {
      const startDateParam = req.query.startDate as string;
      const endDateParam = req.query.endDate as string;
      
      if (!startDateParam || !endDateParam) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }
      
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      
      if (startDate >= endDate) {
        return res.status(400).json({ error: "End date must be after start date" });
      }
      
      const availability = await storage.checkAvailability(startDate, endDate);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  // Dashboard Stats Endpoint
  apiRouter.get("/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Register API routes with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
