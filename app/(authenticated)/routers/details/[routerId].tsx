import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import TileContainer from "@/components/TileContainer";
import translations from "@/constants/Trans";
import { useGeneral } from "@/context/GeneralContext";
import { generateRandomInt } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import useTrackHistory from "@/hooks/useTrackHistory";
import { getRouterActiveUsers } from "@/services/RouterService";
import { HotspotActiveUser } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type routerTab = 'active' | 'users' | 'cookies' | 'hosts' | 'dhcp_leases' | 'traffic';
type ActiveMeta = { total: number, per_page: number, current_page: number, last_page: number, first_Item: number, last_Item: number };

export default function RouterDetails() {
    const { handleUpdateHistory, language, authToken, routersLastFetched, setRoutersLastFetched } = useGeneral();
    const { routerId } = useLocalSearchParams() as { routerId?: string };
    const navigation = useNavigation();
    const bim = useThemeColor({}, 'bim');
    const tabText = useThemeColor({}, 'heading.one');
    const titleText = useThemeColor({}, 'headers');
    const background = useThemeColor({}, 'background');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<routerTab>('active');
    const [retrying, setRetrying] = useState(false);
    const [activeUsers, setActiveUsers] = useState<HotspotActiveUser[]>([]);
    const [activeMeta, setActiveMeta] = useState<ActiveMeta | undefined>();
    const tabTitleKeys: Record<routerTab, { width: number, key: string }[]> = {
        active: [
            { width: 100, key: 'server' },
            { width: 100, key: 'user' },
            { width: 100, key: 'address' },
            { width: 100, key: 'mac' },
            { width: 100, key: 'uptime' },
            { width: 100, key: 'bytesIn' },
            { width: 100, key: 'bytesOut' },
            { width: 100, key: 'timeLeft' },
            { width: 100, key: 'loginBy' },
            { width: 100, key: 'startDate' }
        ],
        users: [{ width: 100, key: 'users' }],
        cookies: [{ width: 100, key: 'cookies' }],
        hosts: [{ width: 100, key: 'hosts' }],
        dhcp_leases: [{ width: 100, key: 'dhcpLeases' }],
        traffic: [{ width: 100, key: 'traffic' }],
    };

    // Seed parent immediately on mount to guarantee ordering before current route push
    useEffect(() => {
        handleUpdateHistory(`/(authenticated)/routers/preview/${routerId}`);
    }, [handleUpdateHistory, routerId]);

    // Track current route after parent seeding is registered
    useTrackHistory(
        routerId
            ? `/(authenticated)/routers/details/${routerId}`
            : '/(authenticated)/routers'
    );

    useEffect(() => {
        navigation.setOptions({
            headerProps: {
                goback: true,
            },
        });
    }, [navigation]);

    const fetchActiveUsers = useCallback(async (params?: { isRetry?: boolean; page?: number }) => {
        if (!routerId || !authToken) return;
        setLoading(true);
        setRetrying(params?.isRetry ?? false);
        try {
            const resp = await getRouterActiveUsers({ routerId, token: authToken, page: params?.page });
            if (resp.ok) {
                const data = await resp.json();
                setActiveUsers(data?.active || []);
                setActiveMeta(data?.active_meta || undefined);
            } else {
                console.error('[RouterDetails] fetchActiveUsers failed', resp.status, resp.statusText);
            }
        } catch (error) {
            console.error('[RouterDetails] fetchActiveUsers error', error);
        } finally {
            setLoading(false);
        }
    }, [routerId, authToken, activeMeta?.current_page, activeMeta?.last_page]);

    useEffect(() => {
        if (!routerId || !authToken) return;
        setLoading(true);
        fetchActiveUsers();
    }, [routerId, authToken]);

    const handleRefresh = () => {
        //setLoading(true);

    };
    if (loading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} lightColor={background} darkColor={background}>
                <ActivityIndicator size="large" color={bim} />
            </ThemedView>
        );
    }
    return (
        <>
            <ParallaxScrollView
                headerBackgroundColor={{
                    light: background,
                    dark: background,
                }}
                contentStyle={{
                    paddingHorizontal: 10,
                }}
                containerStyle={{ flex: 1 }}
                onRefresh={handleRefresh}
                refreshing={loading}
            >
                <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', marginHorizontal: 20 }} lightColor={background} darkColor={background}>
                    <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: titleText }}>{translations[language].categories.routers.routerDetails}</ThemedText>
                </ThemedView>
                <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', marginHorizontal: 20 }} lightColor={background} darkColor={background}>
                    <ScrollView
                        style={{ width: '100%' }}
                        horizontal
                        showsHorizontalScrollIndicator={true}
                    >
                        <ThemedView style={{ flexDirection: 'row', marginVertical: 10 }} lightColor={background} darkColor={background}>
                            <ThemedButton
                                title={translations[language].categories.routers.activeSessions + ` (${activeMeta?.total ?? 0})`}
                                onPress={() => setActiveTab('active')}
                                darkTextColor={activeTab === 'active' ? bim : tabText}
                                lightTextColor={activeTab === 'active' ? bim : tabText}
                                lightColor={background}
                                darkColor={background}
                                style={{ marginRight: 10, borderBottomWidth: activeTab === 'active' ? 2 : 0, borderBottomColor: activeTab === 'active' ? bim : 'transparent' }}

                            />
                            <ThemedButton
                                title={translations[language].categories.routers.users}
                                onPress={() => setActiveTab('users')}
                                darkTextColor={activeTab === 'users' ? bim : tabText}
                                lightTextColor={activeTab === 'users' ? bim : tabText}
                                lightColor={background}
                                darkColor={background}
                                style={{ marginRight: 10, borderBottomWidth: activeTab === 'users' ? 2 : 0, borderBottomColor: activeTab === 'users' ? bim : 'transparent' }}

                            />
                            <ThemedButton
                                title={translations[language].categories.routers.cookies}
                                onPress={() => setActiveTab('cookies')}
                                darkTextColor={activeTab === 'cookies' ? bim : tabText}
                                lightTextColor={activeTab === 'cookies' ? bim : tabText}
                                lightColor={background}
                                darkColor={background}
                                style={{ marginRight: 10, borderBottomWidth: activeTab === 'cookies' ? 2 : 0, borderBottomColor: activeTab === 'cookies' ? bim : 'transparent' }}

                            />
                            <ThemedButton
                                title={translations[language].categories.routers.hosts}
                                onPress={() => setActiveTab('hosts')}
                                darkTextColor={activeTab === 'hosts' ? bim : tabText}
                                lightTextColor={activeTab === 'hosts' ? bim : tabText}
                                lightColor={background}
                                darkColor={background}
                                style={{ marginRight: 10, borderBottomWidth: activeTab === 'hosts' ? 2 : 0, borderBottomColor: activeTab === 'hosts' ? bim : 'transparent' }}

                            />
                            <ThemedButton
                                title={translations[language].categories.routers.dhcpLeases}
                                onPress={() => setActiveTab('dhcp_leases')}
                                darkTextColor={activeTab === 'dhcp_leases' ? bim : tabText}
                                lightTextColor={activeTab === 'dhcp_leases' ? bim : tabText}
                                lightColor={background}
                                darkColor={background}
                                style={{ marginRight: 10, borderBottomWidth: activeTab === 'dhcp_leases' ? 2 : 0, borderBottomColor: activeTab === 'dhcp_leases' ? bim : 'transparent' }}

                            />
                            <ThemedButton
                                title={translations[language].categories.routers.traffic}
                                onPress={() => setActiveTab('traffic')}
                                darkTextColor={activeTab === 'traffic' ? bim : tabText}
                                lightTextColor={activeTab === 'traffic' ? bim : tabText}
                                lightColor={background}
                                darkColor={background}
                                style={{ marginRight: 10, borderBottomWidth: activeTab === 'traffic' ? 2 : 0, borderBottomColor: activeTab === 'traffic' ? bim : 'transparent' }}

                            />
                        </ThemedView>
                    </ScrollView>
                </ThemedView>
                <TileContainer id={routerId || 'new-router' + generateRandomInt(1000, 9999)} backgroundColor={background} style={{ marginHorizontal: 10, padding: 10 }}>
                    <ThemedView style={{ display: activeTab === 'active' ? 'flex' : 'none', flex: 1, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'flex-start', marginHorizontal: 20 }} lightColor={background} darkColor={background}>
                        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }} lightColor={background} darkColor={background}>
                            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: titleText, marginVertical: 10 }}>{translations[language].categories.routers.activeSessions}</ThemedText>
                        </ThemedView>
                        <ThemedView style={{ flex: 1, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'flex-start' }} lightColor={background} darkColor={background}>
                            <ScrollView style={{ width: '100%' }} horizontal nestedScrollEnabled showsHorizontalScrollIndicator={true}>
                                <ThemedView style={{ flexDirection: 'row' }} lightColor={background} darkColor={background}>
                                    <ThemedView style={{ flexDirection: 'column', gap: 10 }} lightColor={background} darkColor={background}>
                                        <ThemedView style={{ flexDirection: 'row', gap: 10 }} lightColor={background} darkColor={background}>
                                            {tabTitleKeys.active.map((a) => (
                                                <ThemedText key={a.key} style={{ fontSize: 16, fontWeight: 'bold', color: titleText, width: a.width }}>
                                                    {translations[language].categories.routers[a.key]}
                                                </ThemedText>
                                            ))}
                                        </ThemedView>
                                        <ThemedView style={{ flexDirection: 'column', gap: 10 }} lightColor={background} darkColor={background}>
                                            <ThemedView>
                                                {activeUsers.map((user, index) => (
                                                    <ThemedView key={index} style={{ flexDirection: 'row', gap: 10 }} lightColor={background} darkColor={background}>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[0].width }}>{user.server}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[1].width }}>{user.user}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[2].width }}>{user.address}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[3].width }}>{user['mac-address']}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[4].width }}>{user.uptime}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[5].width }}>{user['bytes-in']}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[6].width }}>{user['bytes-out']}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[7].width }}>{user['session-time-left'] || '-'}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[8].width }}>{user['login-by'] || '-'}</ThemedText>
                                                        <ThemedText style={{ fontSize: 14, color: tabText, width: tabTitleKeys.active[9].width }}>{user['start-date'] || '-'}</ThemedText>
                                                    </ThemedView>
                                                ))}
                                            </ThemedView>
                                            <ThemedView style={{ height: 50, flexDirection: 'row', gap: 10, display: (activeMeta?.total ?? 0 > 1) && (activeMeta?.last_page ?? 0 > 1) ? 'flex' : 'none' }} lightColor={background} darkColor={background}>
                                                <ThemedButton
                                                    title={translations[language].categories.buttons.first}
                                                    onPress={() => {
                                                        if (activeMeta && activeMeta.current_page > 1) {
                                                            fetchActiveUsers({ page: 1 });
                                                        }
                                                    }}
                                                    disabled={activeMeta?.current_page === 1}
                                                    darkColor={background}
                                                    lightColor={background}
                                                    textStyle={{ color: activeMeta?.current_page === 1 ? tabText : bim, fontSize: 14 }}
                                                />
                                                <ThemedButton
                                                    title={translations[language].categories.buttons.previous}
                                                    onPress={() => {
                                                        if (activeMeta && activeMeta.current_page > 1) {
                                                            fetchActiveUsers({ page: activeMeta.current_page > 1 ? activeMeta.current_page - 1 : 1 });
                                                        }
                                                    }}
                                                    disabled={activeMeta?.current_page === 1}
                                                    darkColor={background}
                                                    lightColor={background}
                                                    textStyle={{ color: activeMeta?.current_page === 1 ? tabText : bim, fontSize: 14 }}
                                                />
                                                <ThemedButton
                                                    title={translations[language].categories.buttons.next}
                                                    onPress={() => {
                                                        if (activeMeta && activeMeta.current_page < activeMeta.last_page) {
                                                            fetchActiveUsers({ page: activeMeta.current_page + 1 });
                                                        }
                                                    }
                                                    }
                                                    disabled={activeMeta?.current_page === activeMeta?.last_page}
                                                    darkColor={background}
                                                    lightColor={background}
                                                    textStyle={{ color: activeMeta?.current_page === activeMeta?.last_page ? tabText : bim, fontSize: 14 }}
                                                />
                                                <ThemedButton
                                                    title={translations[language].categories.buttons.last}
                                                    onPress={() => {
                                                        if (activeMeta && activeMeta.current_page < activeMeta.last_page) {
                                                            fetchActiveUsers({ page: activeMeta.last_page });
                                                        }
                                                    }}
                                                    disabled={activeMeta?.current_page === activeMeta?.last_page}
                                                    darkColor={background}
                                                    lightColor={background}
                                                    textStyle={{ color: activeMeta?.current_page === activeMeta?.last_page ? tabText : bim, fontSize: 14 }}
                                                />
                                            </ThemedView>
                                        </ThemedView>
                                    </ThemedView>
                                </ThemedView>
                            </ScrollView>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={{ display: activeTab === 'users' ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'flex-start', marginHorizontal: 20 }} lightColor={background} darkColor={background}>

                    </ThemedView>
                </TileContainer>
            </ParallaxScrollView>
        </>
    )
}
