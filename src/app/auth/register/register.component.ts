import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule, NgForm } from "@angular/forms";
import { Component, inject } from "@angular/core";
import { from, Observable } from "rxjs";
import * as fromAuthSelector from '../auth.selectors';
import * as AuthActions from '../auth.actions';
import { Store } from "@ngrx/store";

@Component({
    selector: 'app-register',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    private store = inject(Store);

    isLoading$!: Observable<boolean>;
    error$!: Observable<string | null>;

    constructor() {
        this.isLoading$ = this.store.select(fromAuthSelector.selectAuthLoading);
        this.error$ = this.store.select(fromAuthSelector.selectAuthError);
    }

    public onSubmit(form: NgForm) {
        if(form.invalid) {
            return;
        }
        const {name, email, password} = form.value;
        this.store.dispatch(AuthActions.registerUser({credentials: {name, email, password}}));
    }
}