import { Component, AfterViewInit, HostListener } from '@angular/core';
import { getBaseUrl } from "../../app.module.browser";
import { Vector2 } from "../../shared/Vector2";

@Component({
    selector: 'player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements AfterViewInit  {

    public mousePosition: Vector2;
    public directionLine: Vector2;
    public playerPosition: Vector2;
    public velocity = new Vector2(5, 5);
    public loopStarted = false;
    public initialPositionSet = false;
    public opponentPositions = new Array<Vector2>();
    public transformMatrix: SVGMatrix;
    public svgPoint: SVGPoint;
    public socketConnectionStatus: string;
    public direction: Vector2;

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
        this.playerPosition = this.mousePosition = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
        this.viewBox = `${this.playerPosition.x - window.innerWidth / 2} ${this.playerPosition.y - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
        this.direction = new Vector2(0, 0);
        this.directionLine = this.direction;
        /*for (let i = 0; i < this.opponentCount; i++) {
            this.opponentPositions.push({ x: 0, y: 0 });
        }*/
    }

    public updatePositionLoop() {
        this.loopStarted = true;
        setTimeout(() => {
            let normal = this.direction.normalize();
            let movement = normal.mult(this.velocity);
            this.directionLine = this.playerPosition.add(movement.mult(this.velocity));
            this.playerPosition = this.playerPosition.add(movement);
            this.viewBox = `${this.playerPosition.x - window.innerWidth / 2} ${this.playerPosition.y - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
            this.sendPositionData(movement.x, movement.y);
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
                                            this.opponentPositions.push(new Vector2(0, 0));
                                        }
                                        this.opponentPositions[oppCount].x = 100 * x + json[i].Players[p].Coords.X;
                                        this.opponentPositions[oppCount].y = 100 * y + json[i].Players[p].Coords.Y;
                                        oppCount++;
                                    } else {
                                        if (!this.initialPositionSet) {
                                            this.playerPosition.x = json[i].Players[p].Coords.X;
                                            this.playerPosition.y = json[i].Players[p].Coords.Y;
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
        this.mousePosition.x = this.svgPoint.x;
        this.mousePosition.y = this.svgPoint.y;
        this.direction = this.mousePosition.sub(this.playerPosition);
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
