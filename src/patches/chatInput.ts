import { waitForModule } from "@metro";

export default async function patchChatInput() {
    let hideGiftButton: boolean, moduleExports: any;

    const unwait = waitForModule(
        m => typeof m?.defaultProps?.hideGiftButton === "boolean",
        exports => {
            moduleExports = exports;
            ({ hideGiftButton } = exports.defaultProps);

            exports.defaultProps.hideGiftButton = true;
        }
    );

    return () => hideGiftButton !== undefined
        ? moduleExports.defaultProps.hideGiftButton = hideGiftButton
        : unwait();
}

