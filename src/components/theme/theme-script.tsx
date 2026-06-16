import { THEME_STORAGE_KEY } from "@/lib/theme";
import type { ForcedPublicTheme } from "@/lib/env";

export function ThemeScript({
  forcedPublicTheme = null,
}: {
  forcedPublicTheme?: ForcedPublicTheme | null;
}) {
  const forcedJson = JSON.stringify(forcedPublicTheme);
  const script = `(function(){try{var forced=${forcedJson};var isAdmin=location.pathname.indexOf("/admin")===0;if(forced&&(forced==="light"||forced==="dark")&&!isAdmin){document.documentElement.setAttribute("data-theme",forced);document.documentElement.style.colorScheme=forced;return;}var key=${JSON.stringify(THEME_STORAGE_KEY)};var stored=localStorage.getItem(key);var theme=stored==="dark"?"dark":"light";document.documentElement.setAttribute("data-theme",theme);document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.setAttribute("data-theme","light");document.documentElement.style.colorScheme="light";}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
