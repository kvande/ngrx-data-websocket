import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

@Injectable()
export class WebSocketService {

  public socket: WebSocketSubject<any> = webSocket('ws://localhost:5000/ws');

  constructor() {
    // 'someone' have to subscribe in order for the web socket connection to start
    // receiving messages, otherwise they will be thrown away
    this.socket.subscribe();
  }

}
