import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Authenticator";
import { validateEmail, validatePassword, getAuthErrorMessage } from "./authErrors";

type LoginFormState = { email: string; password: string };
type FieldErrors = Partial<Record<keyof LoginFormState, string>>;

const initialState: LoginFormState = { email: "", password: "" };

function validate(form: LoginFormState): FieldErrors {
  const errs: FieldErrors = {};
  const emailErr = validateEmail(form.email);
  const passErr = validatePassword(form.password);
  if (emailErr) errs.email = emailErr;
  if (passErr) errs.password = passErr;
  return errs;
}

export function useLoginForm() {
  const { singIn, signInWithGoogle } = useAuth();
  const [form, setForm] = useState<LoginFormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const navigate = useNavigate();

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setErrors(validate(updated));
  }

  async function handleSubmit(e: { preventDefault(): void }): Promise<void> {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setIsSubmitting(true);
    setFirebaseError("");
    try {
      await singIn(form.email, form.password);
      navigate("/tasks");
    } catch (err: unknown) {
      setFirebaseError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn(): Promise<void> {
    setFirebaseError("");
    try {
      await signInWithGoogle();
      navigate("/tasks");
    } catch (err: unknown) {
      setFirebaseError(getAuthErrorMessage(err));
    }
  }

  return { form, errors, isSubmitting, firebaseError, handleChange, handleSubmit, handleGoogleSignIn };
}
