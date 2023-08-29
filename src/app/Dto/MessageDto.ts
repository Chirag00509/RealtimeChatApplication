export class MessageDto {
  id: number;
  senderId?: string;
  ReceiverId: string;
  content: string;

  constructor() {
    this.senderId = '';
    this.ReceiverId = '';
    this.content = '';
    this.id = 0;
  }
}
