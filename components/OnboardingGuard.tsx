"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isOnboardingDone } from "@/lib/difficulty";

type OnboardingGuardProps = {
  children: React.ReactNode;
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/onboarding") {
      return;
    }

    if (!isOnboardingDone()) {
      router.replace("/onboarding");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
