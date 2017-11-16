import { Vector2 } from "./Vector2";

export class UserCommand {
    public type: CommandType;
    public tick: number;
    public direction: Vector2;

    constructor(type: CommandType, tick: number, direction: Vector2) {
        this.type = type;
        this.tick = tick;
        this.direction = direction;
    }

    public get stringifiedModel(): string {
        return JSON.stringify({
            Tick: this.tick,
            Direction: {
                X: this.direction.x,
                Y: this.direction.y
            },
            Type: this.type
        });
    }
}

export enum CommandType {
    MouseDown =1,
    MouseUp = 2,
    Direction = 0
}