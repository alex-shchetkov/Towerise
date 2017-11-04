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
    public mouseX: number;
    public mouseY: number;
    public playerPosition: Position;
    public readonly velocity = 0.016;
    public loopStarted = false;
    public initialPositionSet = false;
    public opponentPositions = new Array<Position>();
    public transformMatrix: SVGMatrix;
    public svgPoint: SVGPoint;
    public socketConnectionStatus:string;

    public name:string;

    public viewBox = "";

    //public opponentCount = 4;

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

    public socket: WebSocket;

    constructor() {
        this.socketConnectionStatus = "red";
        this.playerX = this.mouseX = window.innerWidth / 2;
        this.playerY = this.mouseY = window.innerHeight / 2;
        this.viewBox = `${this.playerX - window.innerWidth / 2} ${this.playerY - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;

        /*for (let i = 0; i < this.opponentCount; i++) {
            this.opponentPositions.push({ x: 0, y: 0 });
        }*/
    }

    public updatePositionLoop() {
        this.loopStarted = true;
        setTimeout(() => {
            let diffX = this.mouseX - this.playerX;
            let diffY = this.mouseY - this.playerY;
            this.playerX += Math.floor((diffX * this.velocity));
            this.playerY += Math.floor((diffY * this.velocity));
            this.viewBox = `${this.playerX - window.innerWidth / 2} ${this.playerY - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
            this.sendPositionData(Math.floor((diffX * this.velocity)), Math.floor((diffY * this.velocity)));
            this.updatePositionLoop();
        }, 17);

    }

    ngAfterViewInit(): void {
        this.socket = new WebSocket(`ws://${window.location.host}/ws`);
        this.socket.onopen = (event: any) => {
            console.log("socket opened on " + `ws://${window.location.host}/ws`);
            this.socketConnectionStatus = "green";
            this.sendHandshake();
            //this.sendPositionData();
        };

        this.socket.onmessage = (event: any) => {

            
            //console.log("got data");
            var oppCount = 0;
            var json = JSON.parse(event.data);

            if (!this.initialPositionSet) {
                
            }

            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    for (let i = 0; i < json.length; i++) {
                        if (json[i].X === x && json[i].Y === y) {
                            for (let p = 0; p < json[i].Players.length; p++) {
                                
                                    if (json[i].Players[p].Name !== this.name) {
                                        if (this.opponentPositions.length <= oppCount) {
                                            this.opponentPositions.push({ x: 0, y: 0 });
                                        }
                                        this.opponentPositions[oppCount].x = 100 * x + json[i].Players[p].Coords.X;
                                        this.opponentPositions[oppCount].y = 100 * y + json[i].Players[p].Coords.Y;
                                        oppCount++;
                                    } else {
                                        if (!this.initialPositionSet) {
                                            this.playerX = json[i].Players[p].Coords.X;
                                            this.playerY = json[i].Players[p].Coords.Y;
                                            this.initialPositionSet = true;
                                            this.updatePositionLoop();
                                        }
                                    }
                                    
                                
                                
                            }
                        }
                    }
                }
            }
        };

        

        this.socket.onclose = (event: any) => {
            this.socketConnectionStatus = "red";
            //alert("connection closed for some reason");
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
        
    }
    socketClosedMessage : Boolean = false;
    public sendPositionData(diffX: number, diffY: number) {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            this.socketConnectionStatus = "red";
            return;
        }

        
        var data = JSON.stringify({
            Velocity:{
                X: diffX,
                Y: diffY
            },
            Type:0  //enum for movement 
        });
        this.socket.send(data);
        
    }

    public sendHandshake() {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            this.socketConnectionStatus = "red";
            alert("socket not connected");
        }

        this.name = this.makeid();
        var data = JSON.stringify({
            Name: this.name
        });

        //console.log("name: " + this.name);
        this.socket.send(data);

    }

    public makeid(): string {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        console.log("generated name: " + text);
        return text;
    }
}
