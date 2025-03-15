'use server'
import { user } from "@covalenthq/ai-agent-sdk/dist/core/base";
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

export const sendInAppNotification = async (userId: string, workflow: string, data: any) => {
    try {
        console.log('sending in app notification');
        console.log(`User ID: ${userId}, Workflow: ${workflow}, Data: ${JSON.stringify(data)}`);
        await knockClient.workflows.trigger(workflow, {
            actor: 'Xucre',
            recipients: [userId],
            data: data,
        });
        console.log('Notification sent successfully');
    } catch (e) {
        console.error(e);
    }
}