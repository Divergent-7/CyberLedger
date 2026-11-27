import { auth } from "@/lib/auth/server";

export async function GET() {
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified,
    },
  });
}
