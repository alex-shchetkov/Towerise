import { Component, OnInit } from '@angular/core';
import { SocketService } from "../../../shared/socket.service";

@Component({
    selector: '[rocks]',
    templateUrl: './rock.component.html'
})
export class RockComponent implements OnInit {

    public printed = false;
    constructor(public socketService: SocketService) {

    }

    public ngOnInit() {
        this.socketService.socketEvents.subscribe((message: any) => {
            this.onMessage(message);
        },
            (error: any) => {
                console.error("[From Rock]: Error in SocketService: " + error);
            },
            () => {
                console.log("[From Rock]: Socket closed.");
            }
        );
    }

    public onMessage(message: any) {

        var hasEntities = message.Cells.filter((item: any) => {
            return item.Entities.length > 0;
        });
        if (!this.printed && hasEntities.length > 0) {
            console.log(message);
            this.printed = true;
        } else {

        }
    }
}