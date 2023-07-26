import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  user: SocialUser | null;
  loggedIn: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authService: SocialAuthService
    ) { this.user = null }

  ngOnInit(): void {
    this.initializeForm();
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      this.googleTokenVerifier(this.user.idToken);
    });
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  getControl(name: any): AbstractControl | null {
    return this.loginForm.get(name);
  }

  googleTokenVerifier(token: string) {
    this.userService.VerifyToken(token).subscribe((res) => {
      localStorage.setItem("authToken", res.token);
      this.router.navigateByUrl("/chat");
    })
  }

  navigatePage() {
    this.router.navigateByUrl("/register");
  }

  login(data: any) {
    this.userService.login(data).subscribe((res) => {
      if (res) {
        localStorage.setItem("authToken", res.token);
        alert("You have successfully login");
        this.router.navigateByUrl("/chat");
      }
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error.message;
        alert(errorMessage);
      }
    })
  }
}
