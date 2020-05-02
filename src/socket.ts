import { Socket } from "socket.io";

export interface UserSocket {
    userId: string;
    socket: Socket;
}

export class SocketManager {
    private static _sockets: UserSocket[] = [];

    static push(socket: Socket, userId: string) {
        this._sockets.push({
            socket,
            userId
        });
    }

    static remove(id: string) {
        this._sockets = this._sockets.filter(s => s.socket.id !== id);
    }

    static sendNoti(noti: any, userId: string) {
        const userSocket = this._sockets.find(s => s.userId === userId);
        if (!userSocket) return;
        userSocket.socket.emit('noti', noti);
    }
}