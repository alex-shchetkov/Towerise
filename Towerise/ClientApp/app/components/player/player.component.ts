import { Component, OnInit, HostListener, EventEmitter } from '@angular/core';
import { getBaseUrl } from "../../app.module.browser";
import { Vector2 } from "../../shared/Vector2";
import { Opponent } from '../../shared/Opponent';
import { UserCommand } from '../../shared/UserCommand';
import { CommandType } from '../../shared/UserCommand';
import { SocketService } from "../../shared/socket.service";
import { PositionModel } from "../../shared/sockets/PositionModel";
import { Observable } from 'rxjs/Rx';

@Component({
    selector: '[player]',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
    

    public transformMatrix: SVGMatrix;
    public svgPoint: SVGPoint;
    public direction: Vector2;
    public mousePosition: Vector2;
    private initialPositionSet: boolean;
    private directionVector = new Vector2(1, 1);
    private dirLineLength = 4;
    private loopStarted = false;
    public directionLine: Vector2;
    public playerPosition: Vector2;
    public viewBox = "";
    public cTick = 0;
    public prevProcessedTick = 0;
    public initialServerTick = 0;
    private level:number = 1;
    private currentExp:number = 0;
    private maxExp:number = 100;

    public userCommandBuffer = new Array<UserCommand>();
    public commandBatchForServer = new Array<UserCommand>();

    constructor(public socketService: SocketService) {
        this.playerPosition = this.mousePosition = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
        this.viewBox = `${this.playerPosition.x - window.innerWidth / 4} ${this.playerPosition.y - window.innerHeight / 4} ${window.innerWidth/2} ${window.innerHeight/2}`;
        this.direction = new Vector2(0, 0);
        this.directionLine = this.direction;

        
    }



    public isMouseDown: Boolean = false;

    public onMouseDown(direction: Vector2) {
        //this.isMouseDown = true;
        this.userCommandBuffer.push(new UserCommand(CommandType.MouseDown, this.getCurrentTick(), direction));
    }

    public onMouseUp(direction: Vector2) {
        //this.isMouseDown = false;
        this.userCommandBuffer.push(new UserCommand(CommandType.MouseUp, this.getCurrentTick(), direction));
    }

    public onNewDirection(newDirection: Vector2) {
        this.userCommandBuffer.push(new UserCommand(CommandType.Direction,this.getCurrentTick(),newDirection));
        this.directionLine = this.playerPosition.add(newDirection.mult(this.dirLineLength));

    }

    public getCurrentTick() {
        return this.cTick + this.initialServerTick;
    }

    //returns the current exp as a value between 0 and 1. Used by the expBar
    public getCurrentExp() {
        return this.currentExp / this.maxExp;
    }


    //returns the current hp as a value between 0 and 1. Used by the expBar
    public getCurrentHp() {


    }

    

    public ngOnInit() {
        this.socketService.socketEvents.subscribe((message: any) => {
            this.onMessage(message);
        },
            (error: any) => {
                console.error("[From Player]: Error in SocketService: " + error);
            },
            () => {
                console.log("[From Player]: Socket closed.");
            }
        );
    }

    public updatePositionLoop() {
        this.loopStarted = true;
        
        setTimeout(() => {
            
            while (this.getCurrentTick()>this.prevProcessedTick) {
                if (this.userCommandBuffer.length === 0) {
                    if (this.isMouseDown) {
                        this.playerPosition = this.playerPosition.add(this.direction.mult(this.getCurrentTick() - this.prevProcessedTick));
                    }
                    this.prevProcessedTick = this.getCurrentTick();
                    continue;
                }
                let cCommand = this.userCommandBuffer[0];

                if (this.prevProcessedTick === 0) {
                    this.prevProcessedTick = cCommand.tick;
                }

                if (this.isMouseDown) {
                    this.playerPosition =
                        this.playerPosition.add(this.direction.mult(cCommand.tick - this.prevProcessedTick));
                }

                if (cCommand.type === CommandType.MouseDown) {
                    this.isMouseDown = true;
                }
                else if (cCommand.type === CommandType.MouseUp) {
                    this.isMouseDown = false;
                }
                else if (cCommand.type === CommandType.Direction) {
                    this.direction = cCommand.direction;
                    
                }
                this.prevProcessedTick = cCommand.tick;
                this.commandBatchForServer.push(cCommand);
                this.userCommandBuffer.splice(0, 1);
            }

                
            this.viewBox = `${this.playerPosition.x - window.innerWidth / 4} ${this.playerPosition.y - window.innerHeight / 4} ${window.innerWidth/2} ${window.innerHeight/2}`;
            this.updatePositionLoop();
        }, 31);

    }

    public UpdateServer() {
        setTimeout(() => {
            if (this.commandBatchForServer.length > 0) {
                let sendData = "[";

                for (let i = 0; i < this.commandBatchForServer.length; i++) {
                    sendData += this.commandBatchForServer[i].stringifiedModel+",";
                }
                sendData = sendData.substr(0, sendData.length - 1);
                sendData += "]";
                
                this.socketService.send(sendData);
                this.commandBatchForServer = new Array<UserCommand>();
                
            }
            this.UpdateServer();
        }, 50);
    }

    public onMessage(json: any) {
        let cells = json.Cells;
        for (let c = 0; c < cells.length; c++) {
            for (let p = 0; p < cells[c].Players.length; p++) {

                if (cells[c].Players[p].Name === this.socketService.name) {
                    this.currentExp = cells[c].Players[p].Exp;
                    if (!this.initialPositionSet) {
                        this.playerPosition.x = cells[c].Players[p].Coords.X;
                        this.playerPosition.y = cells[c].Players[p].Coords.Y;
                        this.viewBox =
                            `${this.playerPosition.x - window.innerWidth / 2} ${this.playerPosition.y -
                            window.innerHeight / 2} ${window.innerWidth} ${window.innerHeight}`;
                        this.initialPositionSet = true;
                        this.initialServerTick = json.tick;
                        let timer = Observable.timer(0, 31);

                        timer.subscribe(x => this.cTick = x);
                        this.UpdateServer();
                        this.updatePositionLoop();
                    }
                   /* else {
                        this.playerPosition.x = cells[c].Players[p].Coords.X;
                        this.playerPosition.y = cells[c].Players[p].Coords.Y;
                    }*/
                }
            }
        }
    }

}
