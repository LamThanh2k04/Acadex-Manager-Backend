import { Server } from "socket.io"

let io

export const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        }
    })

    io.on("connection", (socket) => {

        const userId = socket.handshake.query.userId

        if (userId) {
            socket.join(`user_${userId}`)
        }

        console.log("connected:", userId)

        socket.on("join-attendance", (sessionId) => {
            socket.join(`attendance_${sessionId}`)
            console.log(`user ${userId} joined attendance_${sessionId}`)
        })
    })
}

export const getIO = () => io