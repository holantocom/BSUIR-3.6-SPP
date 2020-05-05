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
import { ApolloModule, Apollo } from "apollo-angular";
import { HttpLinkModule, HttpLink } from "apollo-angular-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createUploadLink } from "apollo-upload-client";
import { UserService } from "./Service/user.service";
import { ApolloLink } from "apollo-link";
import { environment } from "src/environments/environment";

@NgModule({
  declarations: [AppComponent, MainPageComponent, TaskEditComponent, AuthenticationComponent, RegistrationComponent],
  imports: [BrowserModule, FormsModule, NgbModule, HttpClientModule, AppRoutingModule, ReactiveFormsModule, ApolloModule, HttpLinkModule],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    HttpClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(apollo: Apollo) {
    let authLink = new ApolloLink((operation, forward) => {
      const token = UserService.token;
      if (token) {
        operation.setContext(({ headers }) => ({
          headers: {
            authorization: `Bearer ${token}`,
            ...headers
          }
        }));
      }
      return forward(operation);
    });

    let uploadLink = createUploadLink({
      uri: environment.apiUrl + "graphql"
    });

    apollo.create({
      link: authLink.concat(uploadLink),
      cache: new InMemoryCache()
    });
  }
}
