import { Component, AfterViewInit } from '@angular/core';
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

    public playerPosition: Position;

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
    private readonly RATE: number = 10;
    private movements = new Movements();
    private socket: WebSocket;

    constructor() {

        this.playerX = window.innerWidth / 2;
        this.playerY = window.innerHeight / 2;

        for (let i = 0; i < this.opponentCount; i++) {
            this.opponentPositions.push({ x: 0, y: 0 });
        }

        this.tX = 75;
        this.tY = 75;
        this.movements.x = 0;
        this.movements.y = 0;
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
                        if (json[i].X === x && json[i].y === y) {
                            for (let e = 0; e < json[i].Entities.length; e++) {
                                if (oppCount < this.opponentCount) {
                                    this.opponentPositions[oppCount].x = 10 * x + json[i].Entities[e].Coords.x;
                                    this.opponentPositions[oppCount].y = 10 * y + json[i].Entities[e].Coords.y;
                                    oppCount++;
                                }
                                
                            }
                        }
                    }
                }
            }

            for (let i = 0; i < this.opponentCount; i++){
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

    public keyDownHandler(key: string) {
        if (key.toUpperCase() === Directions.RIGHT)
            this.movements.x = this.RATE;
        if (key.toUpperCase() === Directions.LEFT)
            this.movements.x = -this.RATE;
        if (key.toUpperCase() === Directions.UP)
            this.movements.y = -this.RATE;
        if (key.toUpperCase() === Directions.DOWN)
            this.movements.y = this.RATE;
        console.log('here');
        this.playerX += this.movements.x;
        this.playerY += this.movements.y;
        //this.sendPositionData();
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

    public sendHandshake() {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            alert("socket not connected");
        }


        var data = JSON.stringify({
            Name: "random"
        });
        this.socket.send(data);

    }

    public keyUpHandler(key: string) {

        if ([Directions.UP, Directions.DOWN].indexOf(key.toUpperCase()) !== -1) {
            this.movements.y = 0;
        }
        if ([Directions.LEFT, Directions.RIGHT].indexOf(key.toUpperCase()) !== -1) {
            this.movements.x = 0;
        }
        
    }
}
