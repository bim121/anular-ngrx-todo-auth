import { FormEvent, useState } from 'react';
import { loginUser } from '@marketing/core/api';
import { ANGULAR_APP_URL } from '@marketing/core/env';
import { Toast } from '@marketing/shared/ui/toast';
import './login-page.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const auth = await loginUser(email, password);
      const message = `Welcome, ${auth.user.name}! Redirecting to the app…`;
      setSuccess(message);

      window.setTimeout(() => {
        window.location.assign(ANGULAR_APP_URL);
      }, 1500);
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
            React login stub — same json-server as the Angular app.
          </p>
        </header>

        {success ? (
          <Toast type="success" message={success} />
        ) : null}

        {error ? <Toast type="error" message={error} onDismiss={() => setError(null)} /> : null}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-form__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="test@example.com"
              required
              disabled={loading}
            />
          </label>

          <label className="login-form__field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password123"
              minLength={8}
              required
              disabled={loading}
            />
          </label>

          <button type="submit" className="login-form__submit" disabled={loading}>
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
