import { Strings } from "@core/i18n";
import { getAssetIDByName } from "@lib/api/assets";
import { TextInput } from "@ui/components/discord/Redesign";
import ErrorBoundary from "@ui/components/ErrorBoundary";
import { Image, View } from "react-native";

export interface SearchProps {
    onChangeText?: (v: string) => void;
    placeholder?: string;
    style?: import("react-native").TextStyle;
}

function SearchIcon() {
    return <Image style={{ transform: [{ scale: 0.8 }] }} source={getAssetIDByName("search")} />;
}

export default ({ onChangeText, placeholder, style }: SearchProps) => {
    const [query, setQuery] = React.useState("");

    const onChange = (value: string) => {
        setQuery(value);
        onChangeText?.(value);
    };

    return <ErrorBoundary>
        <View style={style}>
            <TextInput
                grow
                isClearable
                leadingIcon={SearchIcon}
                placeholder={placeholder ?? Strings.SEARCH}
                onChange={onChange}
                returnKeyType={"search"}
                size="md"
                autoCapitalize="none"
                autoCorrect={false}
                value={query}
            />
        </View>
    </ErrorBoundary>;
};
