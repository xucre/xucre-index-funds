'use server'
import { Knock } from "@knocklabs/node";

const knockClient = new Knock(process.env.KNOCK_API_KEY);

export const syncKnock = async (userId: string, userName: string, userEmail: string) => {
    try {
        const user = await knockClient.users.get(userId);
        // await knockClient.workflows.trigger("welcome-back", {
        //     // user id of who performed the action
        //     actor: "Xucre",
        //     // list of user ids for who should receive the notification
        //     recipients: [userId],
        //     // data payload to send through
        //     data: {},
        // });
    } catch (e) {
        await knockClient.users.identify(userId, {
            name: userName,
            email: userEmail,
        });
        await knockClient.workflows.trigger("announcement1", {
            // user id of who performed the action
            actor: "Xucre",
            // list of user ids for who should receive the notification
            recipients: [userId],
            // data payload to send through
            data: {},
        });
    }
}