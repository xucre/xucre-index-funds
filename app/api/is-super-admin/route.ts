
import { currentUser } from '@clerk/nextjs/server'

export async function GET(
  req: Request
) {
    const user = await currentUser();
    const adminUsers = (process.env.ADMIN_USER_LIST as string).split(',');
    if (!user) {
        return new Response('Unauthorized', {
            status: 401,
        });
    } else if (adminUsers.includes(user.id)) {
        return new Response('pong', {
            status: 200,
        });
    } else {
        return new Response('Forbidden', {
            status: 403,
        });
    }
}
