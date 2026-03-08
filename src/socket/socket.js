import { Server } from "socket.io"

let io

export const initSocket = (server) => {

    io = new Server(server, {
        cors: { origin: "*" }
    })

    io.on("connection", (socket) => {

        const userId = socket.handshake.query.userId

        if (userId) {
            socket.join(`user_${userId}`)
        }

        console.log("connected:", userId)

    })
}

export const getIO = () => io