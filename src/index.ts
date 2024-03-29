import initFixes from "@core/fixes";
import { initFetchI18nStrings } from "@core/i18n";
import { initCorePlugins } from "@core/plugins";
import initSettings from "@core/ui/settings";
import { initVendettaObject } from "@core/vendettaObject";
import { patchAssets } from "@lib/api/assets";
import { patchCommands } from "@lib/api/commands";
import { injectFluxInterceptor } from "@lib/api/flux";
import { isThemeSupported } from "@lib/api/native/loader";
import { patchLogHook } from "@lib/debug";
import { initPlugins } from "@lib/managers/plugins";
import { initThemes, patchChatBackground } from "@lib/managers/themes";
import { patchSettings } from "@lib/ui/settings";
import { logger } from "@lib/utils/logger";
import initSafeMode from "@ui/safeMode";

import * as lib from "./lib";

export default async () => {
    // Themes
    if (isThemeSupported()) {
        try {
            initThemes();
        } catch (e) {
            console.error("[Bunny] Failed to initialize themes...", e);
        }
    }

    // Load everything in parallel
    await Promise.all([
        injectFluxInterceptor(),
        patchSettings(),
        patchLogHook(),
        patchAssets(),
        patchCommands(),
        patchChatBackground(),
        initVendettaObject(),
        initFetchI18nStrings(),
        initSettings(),
        initFixes(),
        initSafeMode(),
        initCorePlugins(),
    ]).then(
        // Push them all to unloader
        u => u.forEach(f => f && lib.unload.push(f))
    );

    // Assign window object
    window.bunny = lib;

    // Once done, load plugins
    lib.unload.push(await initPlugins());

    // We good :)
    logger.log("Bunny is ready!");
};
