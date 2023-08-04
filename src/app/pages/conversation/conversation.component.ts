import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import jwt_decode from 'jwt-decode';
import { MessageDto } from 'src/app/Dto/MessageDto';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;

  private shouldScrollToBottom: boolean = false;
  private isLoadingMessages: boolean = false;
  private allMessagesLoaded: boolean = false;

  users: any;
  sortName: any
  allMessages: any[] = [];
  currentId: any;
  userId: any;
  userName: any;
  sendMessageForm!: FormGroup;
  selectedMessageId: number | null = null;
  isDropdownOpen = false;
  displyMessage: string = ''
  showMessageInput: string = ''
  editMessageId: number = 0;
  messageEdit: boolean = false;
  msgDto: MessageDto = new MessageDto();
  msgInboxArray: MessageDto[] = [];
  length: number = 0;
  count : number = 20;

  constructor(private userService: UserService, private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute, private chatService: ChatService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentId = params['id'];
      this.showMessage(this.currentId);
      this.getUserList(this.currentId);
    });
    this.chatService.retrieveMappedObject().subscribe((receivedObj: MessageDto) => {
      this.addToInbox(receivedObj);
      if (this.shouldScrollToBottom) {
        this.scrollToBottom();
        this.shouldScrollToBottom = true;
      }
    });
    this.initializeForm();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  initializeForm() {
    this.sendMessageForm = this.formBuilder.group({
      message: new FormControl('', [Validators.required]),
    })
  }

  getControl(name: any): AbstractControl | null {
    return this.sendMessageForm.get(name);
  }

  getUserList(id: string) {

    const jwtToken = localStorage.getItem('authToken');

    if (!jwtToken) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: any = jwt_decode(jwtToken);

    this.userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    this.userName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    this.userService.getName(id).subscribe((res) => {
      this.users = res.name
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error.message;
        if (errorMessage === undefined) {
          alert("unauthorized access")
        } else {
          alert(errorMessage);
        }
      }
    })
  }

  showMessage(id: number) {
    this.userService.getMessage(id, this.count).subscribe((res) => {
    this.shouldScrollToBottom = true;
      this.msgInboxArray = [];
      for (const message of res) {
        this.addToInbox(message);
      }
      this.allMessages = this.msgInboxArray.filter(
        (message) => message.senderId === this.userId || message.reciverdId === this.userId
      );
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error.message;
        alert(errorMessage);
      }
    });
  }

  saveMessage(event: any, id: any) {
    event.preventDefault();
    this.userService.editMessage(id, this.displyMessage).subscribe((res) => {
      const editDto = {
        content: this.displyMessage,
        id: id,
      };
      this.chatService.broadcastEditedMessage(editDto);
      alert(res.message);
      this.messageEdit = false
    })
  }

  addToInbox(obj: MessageDto) {
    const messageExists = this.msgInboxArray.some((message) => message.id === obj.id);
    if (!messageExists) {
      this.msgInboxArray.push(obj);
      this.allMessages = this.msgInboxArray.filter(
        (message) => message.senderId === this.userId || message.reciverdId === this.userId
      );
    }

  }
  cancelEdit(event: any) {
    event.preventDefault();
    this.messageEdit = false
  }

  sendMessages(data: any) {
    this.shouldScrollToBottom = true;
    this.userService.sendMesage(data, this.currentId).subscribe(async (res) => {
      this.msgDto = {
        content: res.content,
        reciverdId: res.receiverId,
        id: res.messageId,
        senderId: res.senderId
      }
      this.chatService.broadcastMessage(this.msgDto);
      this.showMessageInput = ""

    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error.message;
        alert(errorMessage);
      }
    })
  }

  deleteMessage(id: any) {
    const isConfirmed = confirm("Are you sure you want to delete this message?");
    if (isConfirmed) {
      this.getMessages(this.msgInboxArray);
      this.userService.deleteMessage(id).subscribe((res) => {
        const editDto = {
          id: id,
        };
        this.chatService.broadcastDeletedMessage(editDto);
        alert(res.message);
      }, (error) => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error.message;
          alert(errorMessage);
        }
      })
    }
  }

  editMessage(message: any) {
    this.displyMessage = message.content;
    this.editMessageId = message.id;
    this.messageEdit = true;
    this.getMessages(this.msgInboxArray);
  }

  showDropdown(messageId: any) {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.selectedMessageId = this.selectedMessageId === messageId ? null : messageId;
  }

  getMessages(message: any) {
    this.chatService.updateMessage(message);
  }

  onChatScroll() {
    const scrollTop = this.chatContainerRef.nativeElement.scrollTop;

    if (this.allMessagesLoaded) {
      return;
    }

    if(scrollTop == 0 && !this.isLoadingMessages ) {
      this.isLoadingMessages = true;
      this.count += 20;
      this.userService.getMessage(this.currentId, this.count).subscribe((res) => {

        if (res.length === 0) {
          this.shouldScrollToBottom = false;
          this.allMessagesLoaded = true;
        } else {
          for (const message of res) {
            this.addToInbox(message);
            this.shouldScrollToBottom = true;
          }
        }
        this.isLoadingMessages = false;


        if (this.shouldScrollToBottom) {
          this.chatContainerRef.nativeElement.scrollTop = this.chatContainerRef.nativeElement.scrollHeight;
        }
      })
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainerRef.nativeElement.scrollTop = this.chatContainerRef.nativeElement.scrollHeight;
    } catch (err) { }
  }

}
