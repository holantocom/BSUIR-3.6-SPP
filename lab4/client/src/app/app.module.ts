import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MainPageComponent } from "./main-page/main-page.component";
import { TaskEditComponent } from "./task-edit/task-edit.component";
import { AuthenticationComponent } from './authentication/authentication.component';
import { RegistrationComponent } from './registration/registration.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';

@NgModule({
  declarations: [AppComponent, MainPageComponent, TaskEditComponent, AuthenticationComponent, RegistrationComponent],
  imports: [BrowserModule, FormsModule, NgbModule, HttpClientModule, AppRoutingModule, ReactiveFormsModule],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    HttpClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
