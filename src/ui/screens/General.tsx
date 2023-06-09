import { settings as settingsDef } from "@index";
import { Forms } from "@metro/common";
import { getAssetIDByName } from "@utils/assets";

const { ScrollView } = ReactNative;
const { FormSection, FormRow, FormSwitchRow } = Forms;

export default function General() {
    const settings = settingsDef.useStorage();

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
            <FormSection title="Settings" titleStyleType="no_border">
                <FormSwitchRow
                    label="Enable Discord's experiments menu"
                    subLabel="Enables the experiments menu in Discord's settings, which only staff has access to."
                    leading={<FormRow.Icon source={getAssetIDByName("ic_badge_staff")} />}
                    value={settings.experiments}
                    onValueChange={(v: boolean) => settings.experiments = v}
                />
                <FormSwitchRow
                    label="Hide gift button on chat input"
                    subLabel="Hides the gift button on the chat input."
                    leading={<FormRow.Icon source={getAssetIDByName("ic_gift_24px")} />}
                    value={settings.hideGiftButton}
                    onValueChange={(v: boolean) => settings.hideGiftButton = v}
                />
                <FormSwitchRow
                    label="Hide idle status"
                    subLabel="Hides the idling status when app is backgrounded."
                    leading={<FormRow.Icon source={getAssetIDByName("StatusIdle")} />}
                    value={settings.hideIdling}
                    onValueChange={(v: boolean) => settings.hideIdling = v}
                />
            </FormSection>
        </ScrollView>
    );
}
