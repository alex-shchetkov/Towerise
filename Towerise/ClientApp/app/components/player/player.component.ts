import { Component, AfterViewInit, HostListener } from '@angular/core';
import { getBaseUrl } from "../../app.module.browser";

class Movements {
    x: number;
    y: number;
};

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
export class PlayerComponent implements AfterViewInit  {

    public playerX: number;
    public playerY: number;
    private mouseX: number;
    private mouseY: number;
    public playerPosition: Position;
    private readonly velocity = 0.075;
    private loopStarted = false;
    public opponentPositions = new Array<Position>();

    public opponentCount = 16;

    public opponentColors = [
        'blue',
        'red',
        'black',
        'purple',
        'blue',
        'red',
        'black',
        'purple',
        'blue',
        'red',
        'black',
        'purple',
        'blue',
        'red',
        'black',
        'purple',
        'blue',
        'red',
        'black',
        'purple',
    ];
    
    public tX: number;
    public tY: number;
    private movements = new Movements();
    private socket: WebSocket;

    constructor() {

        this.playerX = window.innerWidth / 2;
        this.playerY = window.innerHeight / 2;

        for (let i = 0; i < this.opponentCount; i++) {
            this.opponentPositions.push({ x: 0, y: 0 });
        }
        console.log("oppenentPositions made");
        this.tX = 75;
        this.tY = 75;
        this.movements.x = 0;
        this.movements.y = 0;
        
    }

    private updatePositionLoop() {
        this.loopStarted = true;
        setTimeout(() => {
            let diffX = this.mouseX - this.playerX;
            let diffY = this.mouseY - this.playerY;
            let distance = Math.sqrt(Math.abs(diffX * 2) + Math.abs(diffY * 2));
            this.playerX += (diffX * this.velocity);
            this.playerY += (diffY * this.velocity);
            this.sendPositionData((diffX * this.velocity), (diffY * this.velocity));
            this.updatePositionLoop();

        }, 17);

    }

    ngAfterViewInit(): void {
        this.socket = new WebSocket(`ws://${window.location.host}/ws`);
        this.socket.onopen = (event: any) => {
            console.log("socket opened on " + `ws://${window.location.host}/ws`);
            this.sendHandshake();
            //this.sendPositionData();
        };
        
        this.socket.onmessage = (event: any) => {
            //console.log("got data");
            var oppCount = 0;
            var json = JSON.parse(event.data);
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    for (let i = 0; i < json.length; i++) {
                        if (json[i].X === x && json[i].Y === y) {
                            for (let e = 0; e < json[i].Entities.length; e++) {
                                if (oppCount < this.opponentCount) {
                                    this.opponentPositions[oppCount].x = 100 * x + json[i].Entities[e].Coords.X*100;
                                    this.opponentPositions[oppCount].y = 100 * y + json[i].Entities[e].Coords.Y * 100;
                                    console.log("set " + oppCount + " to x:" + this.opponentPositions[oppCount].x);
                                    console.log("set " + oppCount + " to y:" + this.opponentPositions[oppCount].y);
                                    oppCount++;
                                }
                                
                            }
                        }
                    }
                }
            }
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
        if (!this.loopStarted)
            this.updatePositionLoop();
    }

    public sendPositionData(diffX: number, diffY: number) {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            alert("socket not connected");
        }
        var data = JSON.stringify({
            x: diffX,
            y: diffY
        });
        this.socket.send(data);
        
    }

    public sendHandshake() {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            alert("socket not connected");
        }


        var data = JSON.stringify({
            Name: "random"
        });
        this.socket.send(data);

    }
}
