import { Component, OnInit, HostListener, EventEmitter } from '@angular/core';
import { getBaseUrl } from "../../app.module.browser";
import { Vector2 } from "../../shared/Vector2";
import { Opponent } from '../../shared/Opponent';
import { SocketService } from "../../shared/socket.service";
import { PositionModel } from "../../shared/sockets/PositionModel";

@Component({
    selector: '[player]',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

    public transformMatrix: SVGMatrix;
    public svgPoint: SVGPoint;
    public direction: Vector2;
    public mousePosition: Vector2;
    private initialPositionSet: boolean;
    private directionVector = new Vector2(1, 1);
    private dirLineLength = new Vector2(4, 4);
    private loopStarted = false;
    public directionLine: Vector2;
    public playerPosition: Vector2;
    public viewBox = "";

    constructor(public socketService: SocketService) {
        this.playerPosition = this.mousePosition = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
        this.viewBox = `${this.playerPosition.x - window.innerWidth / 4} ${this.playerPosition.y - window.innerHeight / 4} ${window.innerWidth/2} ${window.innerHeight/2}`;
        this.direction = new Vector2(0, 0);
        this.directionLine = this.direction;
    }



    public isMouseDown: Boolean = false;

    public ngOnInit() {
        this.socketService.socketEvents.subscribe((message: any) => {
            this.onMessage(message);
        },
            (error: any) => {
                console.error("[From Player]: Error in SocketService: " + error);
            },
            () => {
                console.log("[From Player]: Socket closed.");
            }
        );
    }

    public updatePositionLoop() {
        this.loopStarted = true;
        setTimeout(() => {
                let normal = this.direction.normalize();
                let movement = normal.mult(this.directionVector);
                this.directionLine = this.playerPosition.add(movement.mult(this.dirLineLength));
                if (this.isMouseDown) {
                    this.playerPosition = this.playerPosition.add(movement);
                    this.socketService.send(new PositionModel(movement.x, movement.y).stringifiedModel);
                }
                
                this.viewBox = `${this.playerPosition.x - window.innerWidth / 4} ${this.playerPosition.y - window.innerHeight / 4} ${window.innerWidth/2} ${window.innerHeight/2}`;
                this.updatePositionLoop();
        }, 17);

    }

    public onMessage(json: any) {
        for (let c = 0; c < json.length; c++) {
            for (let p = 0; p < json[c].Players.length; p++) {

                if (json[c].Players[p].Name === this.socketService.name) {
                    if (!this.initialPositionSet) {
                        this.playerPosition.x = json[c].Players[p].Coords.X;
                        this.playerPosition.y = json[c].Players[p].Coords.Y;
                        this.viewBox = `${this.playerPosition.x - window.innerWidth / 2} ${this.playerPosition.y - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
                        this.initialPositionSet = true;

                        this.updatePositionLoop();
                    }
                }
            }
        }
    }

}
