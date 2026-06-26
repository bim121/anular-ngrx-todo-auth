import { FormEvent, useState } from 'react';
import {
  AUTH_VALIDATION_MESSAGES,
  isValidEmail,
} from '@shared/validators/email';
import { loginUser } from '@marketing/core/api';
import { useAuthStore } from '@marketing/stores/authStore';
import { ANGULAR_APP_URL } from '@marketing/core/env';
import { Toast } from '@marketing/shared/ui/toast';
import './login-page.css';

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function validateForm(): boolean {
    let valid = true;

    if (!email.trim()) {
      setEmailError(AUTH_VALIDATION_MESSAGES.emailRequired);
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError(AUTH_VALIDATION_MESSAGES.emailInvalid);
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const auth = await loginUser(email, password);
      setSuccess(`Welcome, ${auth.user.name}! Login successful.`);
      login(auth);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <header>
          <p className="login-card__eyebrow">marketing-mfe</p>
          <h1>Sign in</h1>
          <p className="login-card__hint">
            React hooks + TanStack Query — same json-server as the Angular app.
          </p>
        </header>

        {success ? (
          <div className="login-success">
            <Toast type="success" message={success} />
            <p className="login-card__redirect">
              <a href={ANGULAR_APP_URL}>Open Angular app →</a>
              <span className="login-card__redirect-hint">
                {' '}
                (needs <code>npm start</code> on port 4200)
              </span>
            </p>
          </div>
        ) : null}

        {error ? (
          <Toast type="error" message={error} onDismiss={() => setError(null)} />
        ) : null}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-form__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) {
                  setEmailError(null);
                }
              }}
              placeholder="test@example.com"
              aria-invalid={emailError ? 'true' : undefined}
              aria-describedby={emailError ? 'email-error' : undefined}
              disabled={loading}
            />
            {emailError ? (
              <span id="email-error" className="login-form__error" role="alert">
                {emailError}
              </span>
            ) : null}
          </label>

          <label className="login-form__field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (passwordError) {
                  setPasswordError(null);
                }
              }}
              placeholder="password123"
              aria-invalid={passwordError ? 'true' : undefined}
              aria-describedby={passwordError ? 'password-error' : undefined}
              disabled={loading}
            />
            {passwordError ? (
              <span
                id="password-error"
                className="login-form__error"
                role="alert"
              >
                {passwordError}
              </span>
            ) : null}
          </label>

          <button
            type="submit"
            className="login-form__submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-card__footer">
          Test user: <code>test@example.com</code> / <code>password123</code>
        </p>
      </section>
    </main>
  );
}
