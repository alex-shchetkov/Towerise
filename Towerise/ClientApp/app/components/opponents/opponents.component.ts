import { Component, OnInit } from '@angular/core';
import { Vector2 } from "../../shared/Vector2";
import { Opponent } from '../../shared/Opponent';
import { SocketService } from '../../shared/socket.service';

@Component({
    selector: '[opponents]',
    templateUrl: './opponents.component.html'
})
export class OpponentsComponent implements OnInit {

    public opponentPositions = new Array<Opponent>();

    constructor(public socketService: SocketService) {

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
    }

    public onMessage(json: any) {

        let oppCount = 0;
        console.log(json);
        for (let c = 0; c < json.length; c++) {
            for (let p = 0; p < json[c].Players.length; p++) {

                if (json[c].Players[p].Name !== this.socketService.name) {
                    if (this.opponentPositions.length <= oppCount) {
                        let opp = new Opponent();
                        opp.Position = new Vector2(0, 0);
                        opp.Color = 'blue';
                        this.opponentPositions.push(opp);
                    }
                    let currentOpponent = this.opponentPositions[oppCount];
                    currentOpponent.Position.x = json[c].Players[p].Coords.X;
                    currentOpponent.Position.y = json[c].Players[p].Coords.Y;
                    currentOpponent.Color = json[c].Players[p].Color;
                    oppCount++;
                }
            }
        }
    }

}
