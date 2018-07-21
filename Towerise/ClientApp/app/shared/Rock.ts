import { Vector2 } from './Vector2';
export class Rock {
    public id: string;
    public position: Vector2;
    public size: Vector2;
    public direction: Vector2;
    public currentHp: number;
    public maxHp: number;


    constructor(id: string, position: Vector2, size: Vector2, direction: Vector2, currentHp: number, maxHp: number) {
        this.id = id;
        this.position = position;
        this.size = size;
        this.direction = direction;
        this.currentHp = currentHp;
        this.maxHp = maxHp;

    }


    public getCurrentHp() {
        return this.currentHp / this.maxHp;
    }
}
