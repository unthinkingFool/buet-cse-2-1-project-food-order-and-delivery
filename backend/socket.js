import pool from "./config/db.js";

export const socketHandler = async (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("identity", async ({ userID }) => {
      try {
        if (!userID) return;

        await pool.query(
          `
          UPDATE CUSTOMER
          SET 
            socket_id = $1,
            isonline = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [socket.id, userID]
        );

        socket.join(`user:${userID}`);

        console.log(
          `User ${userID} is online with socket ${socket.id}`
        );
      } catch (error) {
        console.error("SOCKET IDENTITY ERROR:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        const result = await pool.query(
          `
          UPDATE CUSTOMER
          SET
            socket_id = NULL,
            isonline = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE socket_id = $1
          RETURNING id
          `,
          [socket.id]
        );

        if (result.rows.length > 0) {
          console.log(
            `User ${result.rows[0].id} is now offline`
          );
        }

        console.log("Socket disconnected:", socket.id);
      } catch (error) {
        console.error("SOCKET DISCONNECT ERROR:", error);
      }
    });
  });
};