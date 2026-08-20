import { FormEvent, useState } from 'react';
import {
  AUTH_VALIDATION_MESSAGES,
  isValidEmail,
} from '@shared/validators/email';
import { loginUser } from '@marketing/core/api';
import { useAuthStore } from '@marketing/stores/authStore';
import { ANGULAR_APP_URL } from '@marketing/core/env';
import { Toast } from '@marketing/shared/ui/toast';
import { Button } from '@marketing/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@marketing/shared/ui/card';
import { Input } from '@marketing/shared/ui/input';
import { ThemeToggle } from '@marketing/shared/ui/theme-toggle';

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
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] p-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border-[var(--color-border)] shadow-[var(--shadow-lg)]">
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-primary)]">
            marketing-mfe
          </p>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            React + shadcn primitives — shared `--color-primary` with Angular DS.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {success ? (
            <div className="grid gap-2">
              <Toast type="success" message={success} />
              <p className="text-sm">
                <a
                  className="font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
                  href={ANGULAR_APP_URL}
                >
                  Open Angular app →
                </a>
                <span className="text-[var(--color-muted)]">
                  {' '}
                  (needs <code>npm start</code> on port 4200)
                </span>
              </p>
            </div>
          ) : null}

          {error ? (
            <Toast type="error" message={error} onDismiss={() => setError(null)} />
          ) : null}

          <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            <label className="grid gap-1.5 text-sm">
              <span>Email</span>
              <Input
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
                <span id="email-error" className="text-xs text-[var(--color-danger-text)]" role="alert">
                  {emailError}
                </span>
              ) : null}
            </label>

            <label className="grid gap-1.5 text-sm">
              <span>Password</span>
              <Input
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
                  className="text-xs text-[var(--color-danger-text)]"
                  role="alert"
                >
                  {passwordError}
                </span>
              ) : null}
            </label>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          Test user: <code className="mx-1">test@example.com</code> /{' '}
          <code>password123</code>
        </CardFooter>
      </Card>
    </main>
  );
}
