"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/design-system/components/button";
import { Field, Input } from "@/design-system/components/field";
import { FormStatus } from "@/design-system/components/feedback";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "@/server/actions/auth";

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</Button>
      <div className="flex justify-between text-sm text-muted">
        <Link href="/forgot-password" className="hover:text-fg">Esqueci a senha</Link>
        <Link href="/signup" className="hover:text-fg">Criar conta</Link>
      </div>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, {});
  if (state.ok) return <FormStatus state={state} />;
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field label="Nome" htmlFor="fullName">
        <Input id="fullName" name="fullName" autoComplete="name" required maxLength={120} />
      </Field>
      <Field label="E-mail profissional" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Senha" htmlFor="password" hint="Mínimo de 12 caracteres, com letras e números.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
      </Field>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Criando…" : "Criar conta"}</Button>
      <p className="text-sm text-muted">
        Já tem conta? <Link href="/login" className="text-fg underline-offset-2 hover:underline">Entrar</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Enviando…" : "Enviar instruções"}</Button>
      <Link href="/login" className="text-sm text-muted hover:text-fg">Voltar para o login</Link>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field label="Nova senha" htmlFor="password" hint="Mínimo de 12 caracteres, com letras e números.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
      </Field>
      <Field label="Confirmar senha" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar senha"}</Button>
      {state.ok ? <Link href="/" className="text-sm text-muted hover:text-fg">Ir para o app</Link> : null}
    </form>
  );
}
