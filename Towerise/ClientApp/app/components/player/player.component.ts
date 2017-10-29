import { Component } from '@angular/core';

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

    public x: number;
    public y: number;
    private readonly RATE: number = 10;
    private movements = new Movements();

    constructor() {
        this.x = 75;
        this.y = 75;
        this.movements.x = 0;
        this.movements.y = 0;
    }

    public keyDownHandler(key: string) {
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

    public keyUpHandler(key: string) {

        if ([Directions.UP, Directions.DOWN].indexOf(key.toUpperCase()) !== -1) {
            this.movements.y = 0;
        }
        if ([Directions.LEFT, Directions.RIGHT].indexOf(key.toUpperCase()) !== -1) {
            this.movements.x = 0;
        }
    }
}
