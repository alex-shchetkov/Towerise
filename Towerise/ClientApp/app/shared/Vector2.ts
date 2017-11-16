export class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public get magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    public normalize() {
        return new Vector2((this.x / (this.magnitude || 1)), (this.y / (this.magnitude || 1)));
    }

    public mult(scalar: number) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    public add(additionVector: Vector2) {
        return new Vector2(this.x + additionVector.x, this.y + additionVector.y);
    }

    public sub(subtractionVector: Vector2) {
        return new Vector2(this.x - subtractionVector.x, this.y - subtractionVector.y);
    }
}