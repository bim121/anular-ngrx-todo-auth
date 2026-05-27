import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, switchMap, throwError } from "rxjs";
import { AuthResponse, User } from "./auth.model";
import {v4 as uuidv4} from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private userUrl = 'http://localhost:3000/users';

    public register(credentials: {name: string, email: string, password: string}): Observable<User>{
        const newUser: User = {
            id: uuidv4(),
            name: credentials.name,
            email: credentials.email
        };

        const userToSave = {...newUser, password: credentials.password}

        return this.http.get<User[]>(`${this.userUrl}?email=${credentials.email.toLocaleLowerCase()}`).pipe(
            switchMap(existingUsers => {
                if(existingUsers.length > 0) {
                    return throwError(() => new Error('email already exist in DB.'));
                }

                return this.http.post<User>(this.userUrl, userToSave).pipe(
                    map(() => newUser)
                )
            }),
            catchError(this.handleError)
        );
    }

    public login(credentials: {email: string; password: string}) : Observable<AuthResponse>{
        return this.http.get<any[]>(`${this.userUrl}?email=${credentials.email.toLowerCase()}&password=${credentials.password}`).pipe(
            map(users => {
                if(users.length > 0) {
                    const user = users[0];

                    const {password, ...userWithoutPassword} = user;

                    return {
                        user: userWithoutPassword,
                        accessToken: `mockToken=${user.id}-${new Date().getTime()}`
                    }
                } else {
                    throw new Error("Invalid email or password");
                }
            }),
            catchError(this.handleError)
        )
    }

    private handleError(error: any): Observable<never> {
        console.error('AuthService Error', error);
        let errorMessage = "An unknown error occured during authentication.";
        if(error.message) {
            errorMessage = error.message;
        } else if (error.status) {
            errorMessage = `Server error: ${error.status}`;
        }
        return throwError(() => new Error(errorMessage));
    }
}