import { Component } from '@angular/core';
import { WindowRef } from "../window-ref.provider";

class Movements {
    x: number;
    y: number;
};

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
export class PlayerComponent {

    protected x: number;
    protected y: number;
    private readonly RATE: number = 10;
    private movements = new Movements();

    constructor(private winRef: WindowRef) {
        this.x = 75;
        this.y = 75;
        this.movements.x = 0;
        this.movements.y = 0;
    }

    protected keyDownHandler(key: string) {
        if (key.toUpperCase() === Directions.RIGHT)
            this.movements.x = this.RATE;
        if (key.toUpperCase() === Directions.LEFT)
            this.movements.x = -this.RATE;
        if (key.toUpperCase() === Directions.UP)
            this.movements.y = -this.RATE;
        if (key.toUpperCase() === Directions.DOWN)
            this.movements.y = this.RATE;
        console.log('here');
        this.x += this.movements.x;
        this.y += this.movements.y;
    }

    protected keyUpHandler(key: string) {

        if ([Directions.UP, Directions.DOWN].indexOf(key.toUpperCase()) !== -1) {
            this.movements.y = 0;
        }
        if ([Directions.LEFT, Directions.RIGHT].indexOf(key.toUpperCase()) !== -1) {
            this.movements.x = 0;
        }
    }
}
