import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { PlayerComponent } from "../player/player.component";
import { OpponentsComponent } from "../opponents/opponents.component";
import { Vector2 } from "../../shared/Vector2";

@Component({
    selector: 'play-space',
    templateUrl: './play-space.component.html'
})
export class PlaySpaceComponent implements OnInit {

    @ViewChild(PlayerComponent)
    public playerComponent: PlayerComponent;

    @ViewChild(OpponentsComponent)
    public opponentsComponent: OpponentsComponent;

    constructor() {
    }

    public ngOnInit() {
        this.playerComponent.opponentPositions.subscribe((positions: Array<Vector2>) => {

            this.opponentsComponent.opponentPositions = positions;

        });
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
    }
}
