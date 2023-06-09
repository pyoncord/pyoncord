import Patcher from "@api/Patcher";
import { filters } from "@metro";
import { Forms, I18n, NavigationNative } from "@metro/common";
import { assets, findInReactTree, lazyNavigate } from "@utils";

const patcher = new Patcher("settings-patcher");

function SettingsSection() {
    // This has to be destructured here, otherwise it will throw
    const { FormSection, FormRow, FormIcon } = Forms;

    const navigation = NavigationNative.useNavigation();
    const title = `Pyoncord (${__PYONCORD_COMMIT_HASH__}) ${__PYONCORD_DEV__ ? "(DEV)" : ""}`.trimEnd();

    return (
        <FormSection key="Pyoncord" title={title}>
            <FormRow
                label="Pyoncord"
                leading={<FormIcon source={assets.getAssetIDByName("Discord")} />}
                trailing={FormRow.Arrow}
                onPress={() => lazyNavigate(navigation, import("@ui/screens/General"), "Pyoncord")}
            />
            <FormRow
                label="Plugins"
                leading={<FormIcon source={assets.getAssetIDByName("ic_progress_wrench_24px")} />}
                trailing={FormRow.Arrow}
                onPress={() => lazyNavigate(navigation, import("@ui/screens/Plugins"), "Plugins")}
            />
        </FormSection>
    );
}

export default function patchSettings() {
    patcher.patch(filters.byName("getScreens", false)).after("default", (_args, screens) => {
        return Object.assign(screens, {
            PyoncordCustomPage: {
                title: "Pyoncord",
                render: ({ render: PageComponent, ...args }: any) => {
                    const navigation = NavigationNative.useNavigation();

                    React.useEffect(() => {
                        navigation.setOptions({ ...args });
                    }, []);

                    return <PageComponent />;
                },
            }
        });
    });

    const unpatch = patcher.patch(filters.byName("UserSettingsOverviewWrapper", false)).after("default", (_args, ret) => {
        const UserSettingsOverview = findInReactTree(ret.props.children, n => n.type?.name === "UserSettingsOverview");

        patcher.after(UserSettingsOverview.type.prototype, "renderSupportAndAcknowledgements", (_args, { props: { children } }) => {
            try {
                const index = children.findIndex((c: any) => c?.type?.name === "UploadLogsButton");
                if (index !== -1) children.splice(index, 1);
            } catch {
                // Ignore, this is not a big deal
            }
        });

        patcher.after(UserSettingsOverview.type.prototype, "render", (_args, res) => {
            try {
                const titles = [I18n.Messages.BILLING_SETTINGS, I18n.Messages.PREMIUM_SETTINGS];

                const sections = findInReactTree(
                    res.props.children,
                    n => n?.children?.[1]?.type === Forms.FormSection
                ).children;

                const index = sections.findIndex((c: any) => titles.includes(c?.props.label));
                sections.splice(-~index || 4, 0, <SettingsSection />);
            } catch (e: any) {
                console.error(
                    "An error occurred while trying to append Pyoncord's settings section. " +
                    e?.stack ?? e
                );
            }
        });

        unpatch();
    });

    return () => patcher.unpatchAllAndStop();
}
