import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontSize, fontWeight } from '@/constants/Font';
import { useGeneral } from '@/context/GeneralContext';
//

export default function ConnectorLayout() {
    const { user, language, authToken } = useGeneral();
    //const { connector, fetchConnector } = useConnector();
    return (
        <ThemedView
            style={{ flex: 1, padding: 16 }}
            lightColor='background'
            darkColor='background'
        >
            <ThemedText
                style={{
                    fontSize: fontSize['heading.two'],
                    fontWeight: fontWeight['heading.three'],
                    marginBottom: 8,
                }}
            >
                {'Sample text'}
            </ThemedText>
        </ThemedView>
    )
}