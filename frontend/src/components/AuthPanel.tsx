import { useState } from "react";
import type { LoginInput, RegisterInput, UserRole } from "../types/api";

type Props = {
  isBusy: boolean;
  onRegister: (input: RegisterInput) => Promise<void>;
  onLogin: (input: LoginInput) => Promise<void>;
};

const roles: UserRole[] = ["supplier", "vendor", "buyer", "admin"];

export function AuthPanel({ isBusy, onRegister, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState<UserRole>("vendor");

  async function handleRegister() {
    await onRegister({
      email,
      password,
      display_name: displayName,
      country,
      role,
    });
  }

  async function handleLogin() {
    await onLogin({ email, password });
  }

  return (
    <section className="panel">
      <h2>Authentication</h2>
      <p className="panel-subtitle">Create an account or log in to continue.</p>
      <div className="grid two">
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@aliafrica.com"
          />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="********"
          />
        </label>
        <label>
          Display Name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Amina Traders"
          />
        </label>
        <label>
          Country
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Kenya" />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            {roles.map((value) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="actions">
        <button onClick={handleRegister} disabled={isBusy}>
          Register
        </button>
        <button className="secondary" onClick={handleLogin} disabled={isBusy}>
          Login
        </button>
      </div>
    </section>
  );
}
