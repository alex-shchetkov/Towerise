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
    public mouseX: number;
    public mouseY: number;
    public playerPosition: Position;
    private readonly velocity = 0.016;
    private loopStarted = false;
    public opponentPositions = new Array<Position>();
    public transformMatrix: SVGMatrix;
    private svgPoint: SVGPoint;

    public viewBox = "";

    public opponentCount = 4;

    public opponentColors = [
        'blue',
        'red',
        'black',
        'purple'
    ];

    private socket: WebSocket;

    constructor() {
  
        this.playerX = this.mouseX = window.innerWidth / 2;
        this.playerY = this.mouseY = window.innerHeight / 2;
        this.viewBox = `${this.playerX - window.innerWidth / 2} ${this.playerY - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;

        for (let i = 0; i < this.opponentCount; i++) {
            this.opponentPositions.push({ x: 0, y: 0 });
        }
    }

    private updatePositionLoop() {
        this.loopStarted = true;
        setTimeout(() => {
            let diffX = this.mouseX - this.playerX;
            let diffY = this.mouseY - this.playerY;
            this.playerX += Math.floor((diffX * this.velocity));
            this.playerY += Math.floor((diffY * this.velocity));
            this.viewBox = `${this.playerX - window.innerWidth / 2} ${this.playerY - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
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
                if (json[i] != undefined) {
                    this.opponentPositions[i].x = updatedOpponent.x;
                    this.opponentPositions[i].y = updatedOpponent.y;
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
        this.transformMatrix = (document.getElementsByTagName('svg')[0] as SVGSVGElement).getScreenCTM();
        this.svgPoint = (document.getElementsByTagName('svg')[0] as SVGSVGElement).createSVGPoint();
        this.svgPoint.x = event.clientX;
        this.svgPoint.y = event.clientY;
        this.svgPoint = this.svgPoint.matrixTransform(this.transformMatrix.inverse());
        this.mouseX = this.svgPoint.x;
        this.mouseY = this.svgPoint.y;
        if (!this.loopStarted)
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
