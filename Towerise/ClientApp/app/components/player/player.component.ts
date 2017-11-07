import { Component, AfterViewInit, HostListener, EventEmitter } from '@angular/core';
import { getBaseUrl } from "../../app.module.browser";
import { Vector2 } from "../../shared/Vector2";
import { SocketListener } from '../../shared/SocketListener'; 

@Component({
    selector: '[player]',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent extends SocketListener implements AfterViewInit {

    public transformMatrix: SVGMatrix;
    public svgPoint: SVGPoint;
    public direction: Vector2;
    public mousePosition: Vector2;
    private initialPositionSet: boolean;
    private velocity = new Vector2(5, 5);
    private loopStarted = false;
    public directionLine: Vector2;
    public playerPosition: Vector2;
    public viewBox = "";
    public opponentPositions = new EventEmitter<Array<Vector2>>();
    private opponentPositionsRetrieved = new Array<Vector2>();

    constructor() {
        super();
        this.playerPosition = this.mousePosition = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
        this.viewBox = `${this.playerPosition.x - window.innerWidth / 2} ${this.playerPosition.y - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
        this.direction = new Vector2(0, 0);
        this.directionLine = this.direction;
    }

    public updatePositionLoop() {
        this.loopStarted = true;
        setTimeout(() => {
            let normal = this.direction.normalize();
            let movement = normal.mult(this.velocity);
            this.directionLine = this.playerPosition.add(movement.mult(this.velocity));
            this.playerPosition = this.playerPosition.add(movement);
            this.viewBox = `${this.playerPosition.x - window.innerWidth / 2} ${this.playerPosition.y - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
            super.sendPositionData(movement.x, movement.y);
            this.updatePositionLoop();
        }, 17);

    }

    public onMessage(event: any) {
        //console.log("got data");
        var oppCount = 0;
        var json = JSON.parse(event.data);
        
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let i = 0; i < json.length; i++) {
                    if (json[i].X === x && json[i].Y === y) {
                        for (let p = 0; p < json[i].Players.length; p++) {

                            if (json[i].Players[p].Name !== this.name) {
                                if (this.opponentPositionsRetrieved.length <= oppCount) {
                                    this.opponentPositionsRetrieved.push(new Vector2(0, 0));
                                }
                                this.opponentPositionsRetrieved[oppCount].x = 100 * x + json[i].Players[p].Coords.X;
                                this.opponentPositionsRetrieved[oppCount].y = 100 * y + json[i].Players[p].Coords.Y;
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

        this.opponentPositions.emit(this.opponentPositionsRetrieved);
    }

}
