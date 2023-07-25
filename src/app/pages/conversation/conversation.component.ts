import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {

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
  messageEdit:boolean = false;

  constructor(private userService: UserService, private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentId = +params['id'];
      this.showMessage(this.currentId);
      this.getUserList(this.currentId);
    });
    this.initializeForm();
  }
  initializeForm() {
    this.sendMessageForm = this.formBuilder.group({
      message: new FormControl('', [Validators.required]),
    })
  }

  getUserList(id: number) {

    const jwtToken = localStorage.getItem('authToken');

    if (!jwtToken) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: any = jwt_decode(jwtToken);

    const Id = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const name = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    this.userId = Id;
    this.userName = name;

    this.userService.userList().subscribe((res) => {

      const user = res.find(user => user.id === id);
      this.users = user.name;
      this.sortName = this.users.charAt(0);

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

  getControl(name: any): AbstractControl | null {
    return this.sendMessageForm.get(name);
  }

  showMessage(id: number) {
    this.userService.getMessage(id).subscribe((res) => {
      this.allMessages = [];
      this.allMessages = res;
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
      alert(res.message);
      this.showMessage(this.currentId);
      this.messageEdit = false
    })
   }

   cancelEdit(event: any) {
    event.preventDefault();
    this.messageEdit = false
   }

  sendMessages(data: any) {
    this.userService.sendMesage(data, this.currentId).subscribe((res) => {
      this.showMessage(res.receiverId);
      this.showMessageInput=""
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error.message;
        alert(errorMessage);
      }
    })
  }

  deleteMessage(id: number) {
    const isConfirmed = confirm("Are you sure you want to delete this message?");
    if(isConfirmed) {
      this.userService.deleteMessage(id).subscribe((res) => {
        this.showMessage(this.currentId);
        alert(res.message);
      }, (error) => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error.message;
          alert(errorMessage);
        }
      })
    }
  }

  editMessage(message:any) {
    this.displyMessage = message.content;
    this.editMessageId = message.id;
    this.messageEdit = true;
  }

  showDropdown(messageId: any) {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.selectedMessageId = this.selectedMessageId === messageId ? null : messageId;
  }
}
