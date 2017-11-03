import { Component, AfterViewInit, HostListener } from '@angular/core';
import { getBaseUrl } from "../../app.module.browser";

class Position {
    public x: number;
    public y: number;
}

class Directions {
    public static readonly UP = 'W';
    public static readonly DOWN = 'S';
    public static readonly LEFT = 'A';
    public static readonly RIGHT = 'D';
};

@Component({
    selector: 'player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements AfterViewInit {

    public playerX: number;
    public playerY: number;
    private mouseX: number;
    private mouseY: number;
    public playerPosition: Position;
    private readonly velocity = 0.075;
    private loopStarted = false;
    public opponentPositions = new Array<Position>();

    public opponentCount = 4;

    public opponentColors = [
        'blue',
        'red',
        'black',
        'purple'
    ];

    public tX: number;
    public tY: number;
    private socket: WebSocket;

    constructor() {

        this.playerX = this.mouseX = window.innerWidth / 2;
        this.playerY = this.mouseY = window.innerHeight / 2;

        for (let i = 0; i < this.opponentCount; i++) {
            this.opponentPositions.push({ x: 0, y: 0 });
        }

        this.tX = 75;
        this.tY = 75;
    }

    private updatePositionLoop() {
        this.loopStarted = true;
            setTimeout(() => {
                let diffX = this.mouseX - this.playerX;
                let diffY = this.mouseY - this.playerY;
                let distance = Math.sqrt(Math.abs(diffX * 2) + Math.abs(diffY * 2));
                this.playerX += (diffX * this.velocity);
                this.playerY += (diffY * this.velocity);
                this.updatePositionLoop();
            }, 17);
        
    }

    ngAfterViewInit(): void {
        this.socket = new WebSocket(`ws://${window.location.host}/ws`);
        this.socket.onopen = (event: any) => {
            console.log("socket opened on " + `ws://${window.location.host}/ws`);
            this.sendPositionData();

        };

        this.socket.onmessage = (event: any) => {
            //console.log("got data");

            var json = JSON.parse(event.data);
            for (let i = 0; i < this.opponentCount; i++) {
                let updatedOpponent = json[i];
                if (updatedOpponent != undefined) {
                    this.opponentPositions[i].x = updatedOpponent.X;
                    this.opponentPositions[i].y = updatedOpponent.Y;
                }
            }

            this.sendPositionData();
        };

        this.socket.onclose = (event: any) => {
            alert("connection closed for some reason");
        }

        this.socket.onerror = (event: any) => {
            console.log("socket error");
            console.log(event);
        }
        //this.socket.onopen = (ev:Event)=> alert("connection Opened");
    }

    /**
     * Sets mouse position for player to move towards
     * @param event MouseEvent
     */
    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        if(!this.loopStarted)
            this.updatePositionLoop();
    }


    public sendPositionData() {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            alert("socket not connected");
        }
        var data = JSON.stringify({
            x: this.playerX,
            y: this.playerY
        });
        this.socket.send(data);

    }

}
