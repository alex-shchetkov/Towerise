import { Component, OnInit, HostListener, EventEmitter } from '@angular/core';
import { Vector2 } from "../../../shared/Vector2";
import { Rock } from "../../../shared/Rock";
import { SocketService } from '../../../shared/socket.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: '[rocks]',
    templateUrl: './rocks.component.html'
    
})



export class RocksComponent implements OnInit {
    public rocks: Array<Rock> = new Array<Rock>();
    public rockImgPath = require("./rock.svg");
    public circlePath = require("./circle.svg");
    

    constructor(public socketService: SocketService, public sanitizer: DomSanitizer) {
    }

    public ngOnInit() {
        this.socketService.socketEvents.subscribe((message: any) => {
                this.onMessage(message);
            },
            (error: any) => {
                console.error("[From Opponents]: Error in SocketService: " + error);
            },
            () => {
                console.log("[From Opponents]: Socket closed.");
            }
        );
        console.log(this.rockImgPath);
    }


    public onMessage(json: any) {
        let cells = json.Cells;
        for (let c = 0; c < cells.length; c++) {
            let cell = cells[c];
            for (let e = 0; e < cell.Entities.length; e++) {
                let entity = cell.Entities[e];

                let existingRock: Rock | undefined = this.rocks.find(rock => rock.id === entity.Id);
                if (existingRock == undefined) {
                    existingRock = new Rock(entity.Id,
                        new Vector2(entity.Coords.X, entity.Coords.Y),
                        new Vector2(entity.Size.X, entity.Size.Y),
                        new Vector2(entity.Direction.X, entity.Direction.Y),
                        entity.CurrentHp,
                        entity.MaxHp);
                    this.rocks.push(existingRock);
                } else {
                    let currentRock = existingRock as Rock;

                    currentRock.position = new Vector2(entity.Coords.X, entity.Coords.Y);
                    currentRock.currentHp = entity.CurrentHp;
                }


            }
        }
    }

    
}