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

  private sharedObj = new Subject<MessageDto>();
  private messages: MessageDto[] = [];

  constructor(private http: HttpClient) {
    this.connection.onclose(async () => {
      await this.start();
    });
    this.connection.on("ReceiveOne", (message: any) => { this.mapReceivedMessage( message ); });
    this.connection.on("ReceiveEdited", (message: any) => { this.mapReceivedEditedMessage(message); });
    this.start();
  }

  public async start() {
    try {
      await this.connection.start();
      console.log("connected");
    } catch (err) {
      console.log(err);
      setTimeout(() => this.start(), 5000);
    }
  }

  private mapReceivedMessage(message:any): void {
    const receivedMessageObject: MessageDto = new MessageDto();

    receivedMessageObject.id = message.id;
    receivedMessageObject.senderId = message.senderId;
    receivedMessageObject.reciverdId = message.receiverId;
    receivedMessageObject.content = message.content;

    this.messages.push(receivedMessageObject);
    this.sharedObj.next(receivedMessageObject);

  }

  private mapReceivedEditedMessage(messsage: any) : void {
    const editedMessageIndex = this.messages.findIndex(msg => msg.id === messsage.id);
    console.log(editedMessageIndex);
  }

  public broadcastMessage(msgDto: any) {
    this.connection.invoke("SendMessage", msgDto).catch((err: any) => console.error(err));
  }

  public broadcastEditedMessage(msgDto: any) {
    debugger;
    this.connection.invoke("SendEditedMessage", msgDto).catch((err: any) => console.error(err));
  }


  public retrieveMappedObject(): Observable<MessageDto> {
    return this.sharedObj.asObservable();
  }
}
