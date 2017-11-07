import { Component, ViewChild } from '@angular/core';
import { Vector2 } from "../../shared/Vector2";

@Component({
    selector: '[opponents]',
    templateUrl: './opponents.component.html'
})
export class OpponentsComponent {

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

    public opponentPositions = new Array<Vector2>();

}
