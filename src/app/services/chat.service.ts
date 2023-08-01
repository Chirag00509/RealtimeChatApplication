import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { MessageDto } from '../Dto/MessageDto';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private connection: any = new signalR.HubConnectionBuilder().withUrl("https://localhost:7223/chat")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  readonly POST_URL = "https://localhost:7223/api/Message";

  private receivedMessageObject: MessageDto = new MessageDto();
  private sharedObj = new Subject<MessageDto>();

  constructor(private http: HttpClient) {
    this.connection.onclose(async () => {
      await this.start();
    });
    this.connection.on("ReceiveOne", (user: any, message: any) => { this.mapReceivedMessage( user, message ); });
    this.start();
  }

  public async start() {
    try {
      await this.connection.start();
      console.log("connected");
      // this.receivedMessageObject.connectionId = this.connection.connectionId
    } catch (err) {
      console.log(err);
      setTimeout(() => this.start(), 5000);
    }
  }

  private mapReceivedMessage(user:string ,message:any): void {
    const receivedMessageObject: MessageDto = new MessageDto();
    receivedMessageObject.id = message.id;
    receivedMessageObject.senderId = user;
    receivedMessageObject.reciverdId = message.receiverId;
    receivedMessageObject.content = message.content;
    this.sharedObj.next(receivedMessageObject);
  }

  public broadcastMessage(msgDto: any) {
    debugger;
    this.connection.invoke("SendMessage", msgDto).catch((err: any) => console.error(err));
  }

  public retrieveMappedObject(): Observable<MessageDto> {
    debugger;
    return this.sharedObj.asObservable();
  }
}
