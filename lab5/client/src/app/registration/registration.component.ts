import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../Service/user.service";
import { User } from "../Model/user";
import { first } from "rxjs/operators";
import { ApolloError } from "apollo-client";


@Component({
  selector: "app-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.css"]
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    if (UserService.token) {
      this.router.navigate(["/"]);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      login: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(6)]]
    });
  }

  get form() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.userService
      .signup(new User(this.form.login.value, this.form.password.value))
      .pipe(first())
      .subscribe(
        data => {
          window.alert("Вы успешно зарегистрированы");
          this.router.navigate(["/signin"]);
        },
          (error: ApolloError) => {
            window.alert(error.graphQLErrors[0].message);
        }
      );
  }
}
