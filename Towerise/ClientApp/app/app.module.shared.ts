import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'

import { AppComponent } from './components/app/app.component';
import { PlayerComponent } from "./components/player/player.component";
import { PlaySpaceComponent } from "./components/play-space/play-space.component";
import { OpponentsComponent } from "./components/opponents/opponents.component";
import { RocksComponent } from "./components/play-space/rock/rocks.component";

import { SocketService } from "./shared/socket.service";


@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) { }
    transform(value: any) {
        console.log(this.sanitized.bypassSecurityTrustHtml(value));
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}

@NgModule({
    entryComponents: [
        PlayerComponent,
        OpponentsComponent,
        RocksComponent
    ],
    declarations: [
        AppComponent,
        PlayerComponent,
        PlaySpaceComponent,
        OpponentsComponent,
        RocksComponent
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
