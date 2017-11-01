﻿import { Component, AfterViewInit } from '@angular/core';
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
            this.sendPositionData();
            
        };
        
        this.socket.onmessage = (event: any) => {
            //console.log("got data");
            
            var json = JSON.parse(event.data);
            for (let i = 0; i < this.opponentCount; i++){
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

    public keyUpHandler(key: string) {

        if ([Directions.UP, Directions.DOWN].indexOf(key.toUpperCase()) !== -1) {
            this.movements.y = 0;
        }
        if ([Directions.LEFT, Directions.RIGHT].indexOf(key.toUpperCase()) !== -1) {
            this.movements.x = 0;
        }
        
    }
}
