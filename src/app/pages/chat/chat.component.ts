import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  users: any[] = [];

  constructor(private userService: UserService, private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.getUserList();
  }

  getUserList() {
    this.userService.userList().subscribe((res) => {
      this.users = res;

    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error.message;
        if (errorMessage === undefined) {
          alert("unauthorized access");
          this.router.navigateByUrl("/login")
        } else {
          alert(errorMessage);
        }
      }
    })
  }

  showMessage(id: any) {
    this.router.navigate(['/chat', { outlets: { childPopup: [ 'user', id ] }}]);
  }
}
