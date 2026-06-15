<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import {
  isLoginValid,
  validateLogin,
} from '@/features/auth/validate-login';

const router = useRouter();
const { login, loading, error } = useAuth();

const email = ref('');
const password = ref('');
const submitted = ref(false);

const errors = computed(() => validateLogin(email.value, password.value));
const isValid = computed(() => isLoginValid(errors.value));

async function handleSubmit(): Promise<void> {
  submitted.value = true;

  if (!isValid.value) {
    return;
  }

  try {
    await login({ email: email.value, password: password.value });
    await router.push('/todos');
  } catch {
    // store.error is shown below
  }
}
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">analytics-mfe</p>
      <h1>Sign in</h1>

      <form class="form" @submit.prevent="handleSubmit">
        <label>
          <span>Email</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            :disabled="loading"
            :aria-invalid="submitted && errors.email ? 'true' : undefined"
          />
          <span v-if="submitted && errors.email" class="error">
            {{ errors.email }}
          </span>
        </label>

        <label>
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            :disabled="loading"
            :aria-invalid="submitted && errors.password ? 'true' : undefined"
          />
          <span v-if="submitted && errors.password" class="error">
            {{ errors.password }}
          </span>
        </label>

        <button type="submit" :disabled="loading || (submitted && !isValid)">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p v-if="error" class="error server">{{ error }}</p>

      <p class="hint">
        Test: <code>test@example.com</code> / <code>password123</code>
      </p>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: linear-gradient(160deg, #1e1b4b, #312e81 55%, #4c1d95);
  color: #f8fafc;
  font-family: system-ui, sans-serif;
}

.card {
  width: min(100%, 26rem);
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a78bfa;
}

h1 {
  margin: 0 0 1.25rem;
}

.form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #475569;
  background: #0f172a;
  color: inherit;
}

button {
  padding: 0.8rem;
  border: none;
  border-radius: 0.5rem;
  background: #7c3aed;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #fca5a5;
  font-size: 0.85rem;
}

.server {
  margin-top: 1rem;
}

.hint {
  margin: 1rem 0 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

code {
  color: #e2e8f0;
}
</style>
