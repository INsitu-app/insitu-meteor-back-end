import { Accounts } from "meteor/accounts-base";

Accounts.onLogin(() => {
    console.info("Login success");
});

Accounts.onLogout(() => {
    console.info("Logout success");
});
