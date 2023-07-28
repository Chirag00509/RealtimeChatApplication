import { Injectable, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { MessageDto } from '../Dto/MessageDto';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private connection: any = new signalR.HubConnectionBuilder().withUrl("https://localhost:7223/chat")   // mapping to the chathub as in startup.cs
  .configureLogging(signalR.LogLevel.Information)
  .build();
readonly POST_URL = "https://localhost:7223/api/Message"

private receivedMessageObject: MessageDto = new MessageDto();
private sharedObj = new Subject<MessageDto>();

constructor(private http: HttpClient) {
  this.connection.onclose(async () => {
    await this.start();
  });
  this.connection.on("ReceiveOne", (user: any, message: any) => { this.mapReceivedMessage(user, message); });
  this.start();
}

public async start() {
  try {
    await this.connection.start();
    console.log("connected");
    console.log(this.connection.connectionId);
    this.receivedMessageObject.connectionId = this.connection.connectionId
  } catch (err) {
    console.log(err);
    setTimeout(() => this.start(), 5000);
  }
}

private mapReceivedMessage(reciverdId: string, content: string): void {
  this.receivedMessageObject.reciverdId = reciverdId;
  this.receivedMessageObject.content = content;
  this.sharedObj.next(this.receivedMessageObject);
}

public broadcastMessage(msgDto: any) {
  this.http.post(this.POST_URL, msgDto).subscribe(data => console.log(data));
}

public retrieveMappedObject(): Observable<MessageDto> {
  return this.sharedObj.asObservable();
}
}
