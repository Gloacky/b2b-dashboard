import { redirect } from "next/navigation";

import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";

export default async function HomePage() {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const firstMembership = user.memberships[0];

  if (!firstMembership) {
    redirect("/onboarding");
  }

  redirect(`/${firstMembership.organization.slug}/dashboard`);
}