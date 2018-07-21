import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { PlayerComponent } from "../player/player.component";
import { OpponentsComponent } from "../opponents/opponents.component";
import { Vector2 } from "../../shared/Vector2";
import { GridLine } from "../../shared/GridLine";
import { CoordLabel } from "../../shared/CoordLabel";
import { Opponent } from '../../shared/Opponent';
import { SocketService } from '../../shared/socket.service';
import { RocksComponent } from './rock/rocks.component';

@Component({
    selector: 'play-space',
    templateUrl: './play-space.component.html',
    styleUrls: ['./play-space.component.css']
})
export class PlaySpaceComponent implements OnInit {

    @ViewChild(PlayerComponent)
    public playerComponent: PlayerComponent;

    @ViewChild(OpponentsComponent)
    public opponentsComponent: OpponentsComponent;

    @ViewChild(RocksComponent)
    public rocks: RocksComponent;

    public gridLines = new Array<GridLine>();

    public coordLabels = new Array<CoordLabel>();
    

    constructor(public socketService: SocketService) {

        this.populateGridLineArray();
    }

    public ngOnInit() {
        this.socketService.create(`ws://${window.location.host}/ws`).subscribe(() => {

            console.log("Socket Opened!");

        },
            (error: any) => {
                console.error(error);
            }
        );

        this.socketService.socketEvents.subscribe(() => { }, (error: any) => {
            console.log("socket error");
            console.log(event);
        });
    }

    public populateGridLineArray() {

        for (let x = -5; x < 6; x++) {
            this.gridLines.push({ x1: x * 100, x2: x * 100, y1: -500, y2: 500 });
        }

        for (let y = -5; y < 6; y++) {
            this.gridLines.push({ x1: -500, x2: 500, y1: y * 100, y2: y * 100 });
        }


        for (let x = -5; x < 5; x++) {
            for (let y = -5; y < 5; y++) {
                this.coordLabels.push(new CoordLabel(`(${x+5},${y+5})`, x * 100+45, y * 100+50));
            }
        }


    }

    public getNormalizedDirection(clientX: number, clientY: number) {

        return new Vector2(clientX - window.innerWidth / 2, clientY - window.innerHeight / 2).normalize();
    }

   


    /**
     * Sets mouse position for player to move towards
     * @param event MouseEvent
     */
    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.playerComponent.onNewDirection(this.getNormalizedDirection(event.clientX, event.clientY));
        
    }


    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        //event.which returns mouse buttons. 1 is left button
        if (event.which === 1)
            this.playerComponent.onMouseDown(this.getNormalizedDirection(event.clientX, event.clientY));
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        //event.which returns mouse buttons. 1 is left button
        if (event.which === 1)
            this.playerComponent.onMouseUp(this.getNormalizedDirection(event.clientX,event.clientY));
    }

    

}
