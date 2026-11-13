"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cx } from "./cx";
import { inputClass } from "./field";

// Campo de senha com botão de mostrar/ocultar. O valor nunca sai do campo; só muda o tipo do input.
export function PasswordInput({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <input {...props} type={show ? "text" : "password"} className={cx(inputClass, "pr-11", className)} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={show}
        aria-controls={props.id}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-sm text-muted hover:text-fg"
      >
        {show ? <EyeOff aria-hidden className="size-4" strokeWidth={1.5} /> : <Eye aria-hidden className="size-4" strokeWidth={1.5} />}
      </button>
    </span>
  );
}
