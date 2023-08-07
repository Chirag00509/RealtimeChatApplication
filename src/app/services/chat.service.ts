import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { MessageDto } from '../Dto/MessageDto';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  token = localStorage.getItem("authToken");
  private connection: any = new signalR.HubConnectionBuilder().withUrl(`https://localhost:7223/chat?token=${this.token}`)
  .configureLogging(signalR.LogLevel.Information)
  .build();

  private msgInboxArray: MessageDto[] = [];
  private sharedObj = new Subject<MessageDto>();;

  constructor(private http: HttpClient) {
    this.connection.onclose(async () => {
      await this.start();
    });
    debugger;
    this.connection.on("ReceiveOne", (message: any) => { this.mapReceivedMessage( message ); });
    // this.connection.on("ReceiveEdited", (message: any) => { this.mapReceivedEditedMessage( message ); });
    // this.connection.on("ReceiveDeleted", (message: any) => { this.mapReceivedDeletedMessage( message ); });

    this.start();
  }

  public async start() {
    try {
      await this.connection.start();
      console.log("connected");
      const connectionId = this.connection.connectionId;
      console.log("Connection ID:", connectionId);
    } catch (err) {
      console.log(err);
      setTimeout(() => this.start(), 5000);
    }
  }

  private mapReceivedMessage(message:any): void {
    debugger;
    const receivedMessageObject: MessageDto = {
      id: message.id,
      senderId: message.senderId,
      reciverdId: message.receiverId,
      content: message.content
    };

    this.sharedObj.next(receivedMessageObject);
  }

  // public updateMessage(allMessage: any) {
  //   this.msgInboxArray = allMessage;
  // }

  // private mapReceivedEditedMessage(message: any) : void {
  //   const editedMessageIndex = this.msgInboxArray.findIndex(msg => msg.id == message.id);
  //   if (editedMessageIndex !== -1) {
  //     this.msgInboxArray[editedMessageIndex].content = message.content;
  //   }
  // }

  // private mapReceivedDeletedMessage(message : any) : void {
  //   const editedMessageIndex = this.msgInboxArray.findIndex(msg => msg.id == message.id);
  //   if (editedMessageIndex !== -1) {
  //     this.msgInboxArray.splice(editedMessageIndex, 1);
  //   }
  // }

  public broadcastMessage( msgDto: any) {
    debugger;
    this.connection.invoke("SendMessage", msgDto).catch((err: any) => console.error(err));
  }

  public broadcastEditedMessage(msgDto: any) {
    this.connection.invoke("SendEditedMessage", msgDto).catch((err: any) => console.error(err));
  }

  public broadcastDeletedMessage(msgDto: any) {
    debugger;
    this.connection.invoke("SendDeletedMessage", msgDto).catch((err: any) => console.error(err));
  }

  public retrieveMappedObject(): Observable<MessageDto> {
    return this.sharedObj.asObservable();
  }
}
