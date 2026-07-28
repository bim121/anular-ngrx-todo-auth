import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, switchMap, throwError } from "rxjs";
import { AuthResponse, User } from "./auth.model";

type StoredUser = User & { password: string };

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private userUrl = 'http://localhost:3000/users';

    public register(credentials: {name: string, email: string, password: string}): Observable<User>{
        const newUser: User = {
            id: crypto.randomUUID(),
            name: credentials.name,
            email: credentials.email
        };

        const userToSave = {...newUser, password: credentials.password}

        return this.checkEmailAvailable(credentials.email).pipe(
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

    public checkEmailAvailable(email: string): Observable<User[]> {
        return this.http.get<User[]>(
            `${this.userUrl}?email=${email.toLowerCase()}`
        );
    }

    public login(credentials: {email: string; password: string}) : Observable<AuthResponse>{
        return this.http.get<StoredUser[]>(`${this.userUrl}?email=${credentials.email.toLowerCase()}&password=${credentials.password}`).pipe(
            map(users => {
                if(users.length > 0) {
                    const user = users[0];

                    const userWithoutPassword: User = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    };

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

    private handleError(error: unknown): Observable<never> {
        console.error('AuthService Error', error);
        let errorMessage = "An unknown error occured during authentication.";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (
            typeof error === 'object' &&
            error !== null &&
            'status' in error &&
            typeof error.status === 'number'
        ) {
            errorMessage = `Server error: ${error.status}`;
        }
        return throwError(() => new Error(errorMessage));
    }
}