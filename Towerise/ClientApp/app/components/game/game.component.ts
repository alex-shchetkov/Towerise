import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
    selector: 'game',
    templateUrl: './game.component.html'
})


export class GameComponent implements AfterViewInit {
    
    @ViewChild('connectionUrl') connectionUrl: any;
    @ViewChild('stateLabel') stateLabel: any;
    @ViewChild('sendMessage') sendMessage: any;
    @ViewChild('commsLog') commsLog: any;
    private socket: WebSocket;
    
    
    isSendMessageDisabled: boolean = true;
    isSendBtnDisabled: boolean = true;
    isCloseBtnDisabled: boolean = true;
    isConnectionBtnDisabled: boolean = false;
    isConnectionUrlDisabled: boolean = false;

    public closeButtonClick () {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            alert("socket not connected");
        }
        this.socket.close(1000, "Closing from client");
    }

    public sendButtonClick () {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            alert("socket not connected");
        }
        var data = this.sendMessage.nativeElement.value;
        this.socket.send(data);
        this.commsLog.nativeElement.innerHTML += '<tr>' +
            '<td class="commslog-client">Client</td>' +
            '<td class="commslog-server">Server</td>' +
            '<td class="commslog-data">' + this.htmlEscape(data) + '</td>'
        '</tr>';
    }

    public connectButtonClick () {
        this.stateLabel.nativeElement.innerHTML = "Connecting";
        this.socket = new WebSocket(this.connectionUrl.nativeElement.value);
        this.socket.onopen = (event: any) =>{
        
            this.updateState();
            this.commsLog.nativeElement.innerHTML += '<tr>' +
                '<td colspan="3" class="commslog-data">Connection opened</td>' +
                '</tr>';
        };



        this.socket.onclose = (ev: CloseEvent) => {

            this.updateState();
            this.commsLog.nativeElement.innerHTML += '<tr>' +
                '<td colspan="3" class="commslog-data">Connection closed. Code: ' + this.htmlEscape(ev.code.toString()) + '. Reason: ' + this.htmlEscape(ev.code.toString()) + '</td>' +
                '</tr>';
        };
        this.socket.onerror = this.updateState;

        this.socket.onmessage = (event: any) => {
            this.commsLog.nativeElement.innerHTML += '<tr>' +
                '<td class="commslog-server">Server</td>' +
                '<td class="commslog-client">Client</td>' +
                '<td class="commslog-data">' + this.htmlEscape(event.data) + '</td>'
            '</tr>';
        };
    };

    contructor() {
    }
    ngAfterViewInit(): void {
        
    }

    private disable() {
        this.isSendMessageDisabled = true;
        this.isSendBtnDisabled = true;
        this.isCloseBtnDisabled = true;
    }

    private enable() {
        this.isSendMessageDisabled = false;
        this.isSendBtnDisabled = false;
        this.isCloseBtnDisabled = false;
    }



    private updateState() {
        
        this.isConnectionUrlDisabled = true;
        this.isConnectionBtnDisabled = true;
        if (!this.socket) {
            this.disable();
        } else {
            switch (this.socket.readyState) {
                case WebSocket.CLOSED:
                    this.stateLabel.nativeElement.innerHTML = "Closed";
                    this.disable();
                    this.isConnectionUrlDisabled = false;
                    this.isConnectionBtnDisabled = false;
                    break;
                case WebSocket.CLOSING:
                    this.stateLabel.nativeElement.innerHTML = "Closing...";
                    this.disable();
                    break;
                case WebSocket.CONNECTING:
                    this.stateLabel.nativeElement.innerHTML = "Connecting...";
                    this.disable();
                    break;
                case WebSocket.OPEN:
                    this.stateLabel.nativeElement.innerHTML = "Open";
                    this.enable();
                    break;
                default:
                    this.stateLabel.nativeElement.innerHTML = "Unknown WebSocket State: " + this.htmlEscape(this.socket.readyState.toString());
                    this.disable();
                    break;
            }
        }
    }


    
    private htmlEscape(str: string) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}
