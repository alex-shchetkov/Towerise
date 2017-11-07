export class HandshakeModel {
    Name: string;
    constructor(name: string) {
        this.Name = name;
    }

    public get stringifiedModel(): string {
        return JSON.stringify({ Name: this.Name });
    }
}