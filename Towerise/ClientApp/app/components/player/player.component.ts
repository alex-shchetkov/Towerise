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
    

    public name:string;

    public mousePosition: Vector2;
    private initialPositionSet: boolean;
    private velocity = new Vector2(1, 1);
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

    

    public isMouseDown: Boolean = false;

    public updatePositionLoop() {
        this.loopStarted = true;
        setTimeout(() => {
            let normal = this.direction.normalize();
            let movement = normal.mult(this.velocity);
            this.directionLine = this.playerPosition.add(movement.mult(this.velocity));
            this.playerPosition = this.playerPosition.add(movement);
            super.sendPositionData(movement.x, movement.y);
            this.viewBox = `${this.playerPosition.x - window.innerWidth / 2} ${this.playerPosition.y - window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
            this.updatePositionLoop();
            if (this.isMouseDown) {
                
            }
            
            
            
        }, 17);

    }

    public onMessage(event: any) {
        //console.log("got data");
        var oppCount = 0;
        var json = JSON.parse(event.data);


        for (let c = 0; c < json.length; c++) {
            for (let p = 0; p < json[c].Players.length; p++) {

                if (json[c].Players[p].Name !== this.name) {
                    if (this.opponentPositionsRetrieved.length <= oppCount) {
                        this.opponentPositionsRetrieved.push(new Vector2(0, 0));
                    }
                    this.opponentPositionsRetrieved[oppCount].x = json[c].Players[p].Coords.X;
                    this.opponentPositionsRetrieved[oppCount].y = json[c].Players[p].Coords.Y;
                    oppCount++;
                } else {
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
        this.opponentPositions.emit(this.opponentPositionsRetrieved);
    }}
