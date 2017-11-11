import { OnInit, EventEmitter, Injectable } from '@angular/core';
import { HandshakeModel } from "./sockets/HandshakeModel";
import { PositionModel } from "./sockets/PositionModel";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';

@Injectable()
export class SocketService {

    protected socket: WebSocket;
    public socketConnectionStatus: string;
    public socketEvents: EventEmitter<any> = new EventEmitter<any>();
    private socketOpened: EventEmitter<any> = new EventEmitter<any>();
    private localName: string;

    constructor() {
        this.socketConnectionStatus = "red";
    }

    private sendHandshake(): void {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            this.socketOpened.error("socket not connected");
        }
        else {
            var data = new HandshakeModel(this.name).stringifiedModel;
            this.socket.send(data);
        }

    }

    public create(url: string) {

        this.socket = new WebSocket(url);

        this.socket.onopen = (event: any) => {
            this.onOpen(event);
            this.socketOpened.next();
        }

        this.socket.onclose = (event: any) => {

            this.socketConnectionStatus = "red";
            this.socketEvents.complete();

        }

        this.socket.onerror = (event: any) => {

            this.socketConnectionStatus = "red";
            this.socketEvents.error(event);

        }

        this.socket.onmessage = (event: any) => {

            this.socketEvents.next(JSON.parse(event.data));

        }

        return this.socketOpened;
    }

    public send(data: any) {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            this.socketConnectionStatus = "red";
            return;
        }
 
        this.socket.send(data);
    }

    public get name(): string {
        if (this.localName)
            return this.localName;
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var text = "";
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        console.log("generated name: " + text);
        this.localName = text;
        return this.localName;
    }

    private onOpen(event: any) {
        console.log("socket opened on " + `ws://${window.location.host}/ws`);
        this.socketConnectionStatus = "green";
        this.sendHandshake();
    }

}