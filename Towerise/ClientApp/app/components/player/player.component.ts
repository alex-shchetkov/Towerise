import { Component, AfterViewInit } from '@angular/core';
import { getBaseUrl } from "../../app.module.browser";

class Movements {
    x: number;
    y: number;
};

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
    

    public x: number;
    public y: number;
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    public x3: number;
    public y3: number;
    public x4: number;
    public y4: number;
    public tX: number;
    public tY: number;
    private readonly RATE: number = 10;
    private movements = new Movements();
    private socket: WebSocket;

    constructor() {
        this.x = 75;
        this.y = 75;
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.x3 = 0;
        this.y3 = 0;
        this.x4 = 0;
        this.y4 = 0;
        this.tX = 75;
        this.tY = 75;
        this.movements.x = 0;
        this.movements.y = 0;
    }

    ngAfterViewInit(): void {
        this.socket = new WebSocket(`ws://${window.location.host}/ws`);
        this.socket.onopen = (event: any) => {
            console.log("socket opened");
            this.sendPositionData();
            
        };
        

        this.socket.onmessage = (event: any) => {
            
            var json = JSON.parse(event.data);
            if (json[0] != undefined) {
                this.x = json[0].x;
                this.y = json[0].y;
            }
            if (json[1] != undefined) {
                this.x1 = json[1].x;
                this.y1 = json[1].y;
            }
            if (json[2] != undefined) {
                this.x2 = json[2].x;
                this.y2 = json[2].y;
            }
            if (json[3] != undefined) {
                this.x3 = json[3].x;
                this.y3 = json[3].y;
            }
            if (json[4] != undefined) {
                this.x4 = json[4].x;
                this.y4 = json[4].y;
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
        this.tX += this.movements.x;
        this.tY += this.movements.y;
        this.sendPositionData();
    }

    public sendPositionData() {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            alert("socket not connected");
        }

        var data = JSON.stringify({
            x: this.tX,
            y: this.tY
        });
        this.socket.send(data);
        console.log("data sent x: " + this.tX); 
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
