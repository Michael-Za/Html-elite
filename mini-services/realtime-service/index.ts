import { Server } from "socket.io";
import { Database } from "bun:sqlite";
import { join } from "path";

// Database path
const dbPath = join(import.meta.dir, "../../db/custom.db");

let db: Database;
try {
  db = new Database(dbPath);
  db.run("PRAGMA journal_mode = WAL");
  console.log("✅ Connected to SQLite database");
} catch (e) {
  console.error("❌ Failed to connect to database:", e);
  process.exit(1);
}

// Create Socket.IO server
const io = new Server(3003, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io/",
});

console.log("🚀 Real-time service running on port 3003");

// Helper functions
function getUsersOnline() {
  try {
    const users = db.query(`
      SELECT u.id, u.name, u.email, u.role, u.isOnline, u.lastLogin,
             u.tenantId, t.name as tenantName
      FROM User u
      LEFT JOIN Tenant t ON u.tenantId = t.id
      WHERE u.isOnline = 1
    `).all();
    return users;
  } catch (e) {
    console.error("Error getting online users:", e);
    return [];
  }
}

function getTenantStats() {
  try {
    const tenants = db.query(`
      SELECT t.id, t.name, t.slug, t.plan, t.active, t.maxUsers,
        (SELECT COUNT(*) FROM User WHERE tenantId = t.id) as userCount,
        (SELECT COUNT(*) FROM User WHERE tenantId = t.id AND isOnline = 1) as onlineCount,
        (SELECT COUNT(*) FROM Deal WHERE tenantId = t.id) as dealCount,
        (SELECT COUNT(*) FROM Customer WHERE tenantId = t.id) as customerCount,
        (SELECT COUNT(*) FROM Meeting WHERE tenantId = t.id) as meetingCount,
        (SELECT COUNT(*) FROM Prospect WHERE tenantId = t.id) as prospectCount
      FROM Tenant t
    `).all();
    return tenants;
  } catch (e) {
    console.error("Error getting tenant stats:", e);
    return [];
  }
}

function getTotalStats() {
  try {
    const totalUsers = db.query("SELECT COUNT(*) as count FROM User").get() as { count: number };
    const totalTenants = db.query("SELECT COUNT(*) as count FROM Tenant").get() as { count: number };
    const onlineUsers = db.query("SELECT COUNT(*) as count FROM User WHERE isOnline = 1").get() as { count: number };
    const activeTenants = db.query("SELECT COUNT(*) as count FROM Tenant WHERE active = 1").get() as { count: number };
    
    return {
      totalUsers: totalUsers?.count ?? 0,
      totalTenants: totalTenants?.count ?? 0,
      onlineUsers: onlineUsers?.count ?? 0,
      activeTenants: activeTenants?.count ?? 0,
    };
  } catch (e) {
    console.error("Error getting total stats:", e);
    return { totalUsers: 0, totalTenants: 0, onlineUsers: 0, activeTenants: 0 };
  }
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);

  // Send initial data
  socket.emit("stats", getTotalStats());
  socket.emit("online-users", getUsersOnline());
  socket.emit("tenant-stats", getTenantStats());

  // Handle user status updates
  socket.on("user-online", (data: { userId: string; tenantId?: string }) => {
    try {
      db.query("UPDATE User SET isOnline = 1 WHERE id = ?").run(data.userId);
      
      // Broadcast to all clients
      io.emit("user-status-changed", {
        userId: data.userId,
        isOnline: true,
        timestamp: new Date().toISOString(),
      });
      
      io.emit("online-users", getUsersOnline());
      io.emit("stats", getTotalStats());
    } catch (e) {
      console.error("Error updating user online status:", e);
    }
  });

  socket.on("user-offline", (data: { userId: string }) => {
    try {
      db.query("UPDATE User SET isOnline = 0 WHERE id = ?").run(data.userId);
      
      // Broadcast to all clients
      io.emit("user-status-changed", {
        userId: data.userId,
        isOnline: false,
        timestamp: new Date().toISOString(),
      });
      
      io.emit("online-users", getUsersOnline());
      io.emit("stats", getTotalStats());
    } catch (e) {
      console.error("Error updating user offline status:", e);
    }
  });

  // Handle tenant updates
  socket.on("tenant-created", () => {
    io.emit("tenant-stats", getTenantStats());
    io.emit("stats", getTotalStats());
  });

  socket.on("tenant-updated", () => {
    io.emit("tenant-stats", getTenantStats());
  });

  // Handle user management updates
  socket.on("user-created", () => {
    io.emit("online-users", getUsersOnline());
    io.emit("stats", getTotalStats());
  });

  socket.on("user-deleted", () => {
    io.emit("online-users", getUsersOnline());
    io.emit("stats", getTotalStats());
  });

  // Handle periodic updates request
  socket.on("request-update", () => {
    socket.emit("stats", getTotalStats());
    socket.emit("online-users", getUsersOnline());
    socket.emit("tenant-stats", getTenantStats());
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`📡 Client disconnected: ${socket.id}`);
  });
});

// Periodic broadcast of stats every 30 seconds
setInterval(() => {
  io.emit("stats", getTotalStats());
  io.emit("online-users", getUsersOnline());
}, 30000);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  io.close(() => {
    db.close();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down...");
  io.close(() => {
    db.close();
    process.exit(0);
  });
});
