import type { Task } from "../../types/task";
import { useAuth } from "../../features/auth/Authenticator";
import EmailSummaryButton from "./BuildTodoSummary";

interface Props {
  tasks: Task[];
}

export default function TodoSummarySection({ tasks }: Props) {
  const { user } = useAuth();

  if (!user?.email) return null;

  return <EmailSummaryButton todos={tasks} userEmail={user.email} />;
}
