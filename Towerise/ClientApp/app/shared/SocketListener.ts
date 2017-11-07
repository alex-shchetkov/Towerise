import { AfterViewInit } from '@angular/core';
import { HandshakeModel } from "./sockets/HandshakeModel";
import { PositionModel } from "./sockets/PositionModel";

export abstract class SocketListener implements AfterViewInit {

    protected socket: WebSocket;
    protected socketClosedMessage: Boolean = false;
    protected socketConnectionStatus: string;
    protected name: string;

    constructor() {
        this.socketConnectionStatus = "red";
    }

    public sendHandshake(): void {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            this.socketConnectionStatus = "red";
            alert("socket not connected");
        }

        this.name = this.makeid();
        var data = new HandshakeModel(this.name).stringifiedModel;
        console.log(data);
        //console.log("name: " + this.name);
        this.socket.send(data);

    }

    public ngAfterViewInit(): void {
        this.socket = new WebSocket(`ws://${window.location.host}/ws`);

        this.socket.onopen = (event: any) => {
            this.onOpen(event);
        }

        this.socket.onclose = (event: any) => {
            this.onClose(event);
        }

        this.socket.onerror = (event: any) => {
            this.onError(event);
        }

        this.socket.onmessage = (event: any) => {
            this.onMessage(event);
        }
    }

    public makeid(): string {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        console.log("generated name: " + text);
        return text;
    }

    public onOpen(event: any) {
        console.log("socket opened on " + `ws://${window.location.host}/ws`);
        this.socketConnectionStatus = "green";
        this.sendHandshake();
        //this.sendPositionData();
    }

    public onClose(event: any) {
        this.socketConnectionStatus = "red";
        //alert("connection closed for some reason");

    }

    public onError(event: any) {
        console.log("socket error");
        console.log(event);
    }

    public sendPositionData(diffX: number, diffY: number) {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            this.socketConnectionStatus = "red";
            return;
        }


        var data = new PositionModel(diffX, diffY).stringifiedModel;
        this.socket.send(data);

    }

    abstract onMessage(event: any): void;

}