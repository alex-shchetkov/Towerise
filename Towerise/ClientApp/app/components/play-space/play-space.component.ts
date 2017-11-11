import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { PlayerComponent } from "../player/player.component";
import { OpponentsComponent } from "../opponents/opponents.component";
import { Vector2 } from "../../shared/Vector2";
import { GridLine } from "../../shared/GridLine";
import { Opponent } from '../../shared/Opponent';
import { SocketService } from '../../shared/socket.service';

@Component({
    selector: 'play-space',
    templateUrl: './play-space.component.html'
})
export class PlaySpaceComponent implements OnInit {

    @ViewChild(PlayerComponent)
    public playerComponent: PlayerComponent;

    @ViewChild(OpponentsComponent)
    public opponentsComponent: OpponentsComponent;

    public gridLines = new Array<GridLine>();

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

    }


    /**
     * Sets mouse position for player to move towards
     * @param event MouseEvent
     */
    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        let svg = (document.getElementsByTagName('play-space')[0].getElementsByTagName('svg')[0] as SVGSVGElement);
        this.playerComponent.transformMatrix = (document.getElementsByTagName('play-space')[0].getElementsByTagName('svg')[0] as SVGSVGElement).getScreenCTM();
        this.playerComponent.svgPoint = (document.getElementsByTagName('svg')[0] as SVGSVGElement).createSVGPoint();
        this.playerComponent.svgPoint.x = event.clientX;
        this.playerComponent.svgPoint.y = event.clientY;
        this.playerComponent.svgPoint = this.playerComponent.svgPoint.matrixTransform(this.playerComponent.transformMatrix.inverse());
        this.playerComponent.mousePosition.x = this.playerComponent.svgPoint.x;
        this.playerComponent.mousePosition.y = this.playerComponent.svgPoint.y;
        this.playerComponent.direction = this.playerComponent.mousePosition.sub(this.playerComponent.playerPosition);
        if (this.playerComponent.isMouseDown) {


        }
    }

}
