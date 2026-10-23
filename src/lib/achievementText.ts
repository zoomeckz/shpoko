import type { TFunction, TKey } from "@/i18n";
import type { Achievement } from "./achievements";

/** An achievement's name and goal description in the current language. */
export function achievementText(t: TFunction, a: Achievement) {
  return {
    title: t(`ach.${a.id}.title` as TKey),
    describe: (n: number) => t(`ach.${a.id}.desc` as TKey, { n }),
  };
}
