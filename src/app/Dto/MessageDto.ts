export class MessageDto {
  senderId: string;
  reciverdId: string;
  content: string;
  id: number;

  constructor() {
    this.senderId = '';
    this.reciverdId = '';
    this.content = '';
    this.id = 0;
  }
}
