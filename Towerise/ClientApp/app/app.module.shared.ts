import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './components/app/app.component';
import { PlayerComponent } from "./components/player/player.component";
import { PlaySpaceComponent } from "./components/play-space/play-space.component";
import { OpponentsComponent } from "./components/opponents/opponents.component";
import { ObjectsComponent } from "./components/objects/objects.component";
import { RockComponent } from "./components/objects/rocks/rock.component";

import { SocketService } from "./shared/socket.service";


@NgModule({
    entryComponents: [
        PlayerComponent,
        OpponentsComponent
    ],
    declarations: [
        AppComponent,
        PlayerComponent,
        PlaySpaceComponent,
        OpponentsComponent,
        RockComponent,
        ObjectsComponent
    ],
    providers: [
        SocketService
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule
    ]
})
export class AppModuleShared {
}
