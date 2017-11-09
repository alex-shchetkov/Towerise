import { Component, ViewChild } from '@angular/core';
import { Vector2 } from "../../shared/Vector2";
import { Opponent } from '../../shared/Opponent';

@Component({
    selector: '[opponents]',
    templateUrl: './opponents.component.html'
})
export class OpponentsComponent {

    public opponentPositions = new Array<Opponent>();

}
