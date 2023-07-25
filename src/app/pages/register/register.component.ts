import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm! : FormGroup

  constructor(private formBuilder : FormBuilder, private userService : UserService, private router : Router ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group({
      name : new FormControl('', [ Validators.required ]),
      email : new FormControl('', [ Validators.required, Validators.email ]),
      password: new FormControl('', [ Validators.required, Validators.minLength(6) ])
    })
  }
  getControl(name: any) : AbstractControl | null  {
    return this.registerForm.get(name);
  }

  registration(data : any) {
    this.userService.register(data).subscribe((res) => {
      if(res) {
        alert("You have successfully registered");
        this.router.navigateByUrl('/login')
      }
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error.message;
        alert(errorMessage);
      }
    } )
  }


}
