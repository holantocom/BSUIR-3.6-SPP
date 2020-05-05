import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { map } from "rxjs/operators";
import { User } from "../Model/user";
import { Observable } from "rxjs";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";

@Injectable({
  providedIn: "root"
})
export class UserService {
  private url = environment.apiUrl + "api/users/";
  private static tokenKey = "token";

  constructor(private apollo: Apollo) {}

  static get token() {
    return localStorage.getItem(UserService.tokenKey);
  }

  signin(user: User) {
    let signinMutation = gql`
      mutation signin($login: String!, $password: String!) {
        signin(login: $login, password: $password)
      }
    `;

    return this.apollo
        .mutate<String>({
          mutation: signinMutation,
          variables: {
            login: user.login,
            password: user.password
          }
        })
        .pipe(
            map(({ data }) => {
              let token = data.signin;
              if (token) {
                localStorage.setItem(UserService.tokenKey, token);
              }

              return token;
            })
        );
  }

  signup(user: User): Observable<Object> {
    let signupMutation = gql`
      mutation signup($user: UserInput!) {
        signup(user: $user) {
          ...newUser
        }
      }
      fragment newUser on User {
        login
      }
    `;

    return this.apollo
        .mutate<Object>({
          mutation: signupMutation,
          variables: {
            user: user
          }
        })
        .pipe(map(({ data }) => data.signup));
  }

  signout() {
    localStorage.removeItem(UserService.tokenKey);
    this.apollo.getClient().resetStore();
  }
}
