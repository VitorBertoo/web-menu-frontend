import { Button, Icon } from "@/components/ui";
import { logoutAction } from "../actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm" block>
        <Icon name="logout" size="sm" />
        Sair
      </Button>
    </form>
  );
}
