import { Strings } from "@core/i18n";
import { CardWrapper } from "@core/ui/components/Card";
import { getAssetIDByName } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { findByProps } from "@lib/metro/filters";
import { settings } from "@lib/settings";
import { HelpMessage } from "@lib/ui/components/discord";
import { HTTP_REGEX_MULTI } from "@lib/utils/constants";
import { clipboard } from "@metro/common";
import { showInputAlert } from "@ui/alerts";
import { ErrorBoundary, Search } from "@ui/components";
import fuzzysort from "fuzzysort";
import { FlatList, View } from "react-native";

interface AddonPageProps<T> {
    title: string;
    floatingButtonText: string;
    fetchFunction: (url: string) => Promise<void>;
    items: Record<string, T & { id: string; }>;
    safeModeMessage: string;
    safeModeExtras?: JSX.Element | JSX.Element[];
    card: React.ComponentType<CardWrapper<T>>;
}

function getItemsByQuery<T extends { id?: string; }>(items: T[], query: string): T[] {
    if (!query) return items;

    return fuzzysort.go(query, items, {
        keys: [
            "id",
            "manifest.name",
            "manifest.description",
            "manifest.authors.0.name",
            "manifest.authors.1.name"
        ]
    }).map(r => r.obj);
}

const reanimated = findByProps("useSharedValue");
const { FloatingActionButton } = findByProps("FloatingActionButton");

export default function AddonPage<T>({ floatingButtonText, fetchFunction, items, safeModeMessage, safeModeExtras, card: CardComponent }: AddonPageProps<T>) {
    useProxy(settings);
    useProxy(items);

    const collapseText = reanimated.useSharedValue(0);
    const yOffset = React.useRef<number>(0);
    const [search, setSearch] = React.useState("");

    return (
        <ErrorBoundary>
            {/* TODO: Implement better searching than just by ID */}
            <FlatList
                ListHeaderComponent={<>
                    {settings.safeMode?.enabled && <View style={{ marginBottom: 10 }}>
                        <HelpMessage messageType={0}>{safeModeMessage}</HelpMessage>
                        {safeModeExtras}
                    </View>}
                    <Search
                        style={{ marginBottom: 15 }}
                        onChangeText={(v: string) => setSearch(v.toLowerCase())}
                        placeholder={Strings.SEARCH}
                    />
                </>}
                onScroll={e => {
                    if (e.nativeEvent.contentOffset.y <= 0) return;
                    collapseText.value = Number(e.nativeEvent.contentOffset.y > yOffset.current);
                    yOffset.current = e.nativeEvent.contentOffset.y;
                }}
                style={{ paddingHorizontal: 10, paddingTop: 10 }}
                contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 5 }}
                data={getItemsByQuery(Object.values(items), search)}
                renderItem={({ item, index }) => <CardComponent item={item} index={index} />}
            />
            <FloatingActionButton
                text={floatingButtonText}
                icon={getAssetIDByName("DownloadIcon")}
                state={{ collapseText }}
                onPress={() => {
                    // from ./InstallButton.tsx
                    clipboard.getString().then(content =>
                        showInputAlert({
                            title: floatingButtonText,
                            initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                            placeholder: Strings.URL_PLACEHOLDER,
                            onConfirm: (input: string) => fetchFunction(input),
                            confirmText: Strings.INSTALL,
                            cancelText: Strings.CANCEL,
                        })
                    );
                }}
            />
        </ErrorBoundary>
    );
}
