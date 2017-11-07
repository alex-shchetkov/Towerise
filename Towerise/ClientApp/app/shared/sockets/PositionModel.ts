export class PositionModel {
    X: number;
    Y: number;
    Type: number = 0;
    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    public get stringifiedModel(): string {
        return JSON.stringify({
            Velocity: {
                X: this.X,
                Y: this.Y
            },
            Type: 0  //enum for movement 
        });
    }
}