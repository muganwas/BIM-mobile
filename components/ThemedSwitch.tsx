import { Switch, type SwitchProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedSwitchProps = SwitchProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedSwitch({
    lightColor,
    darkColor,
    thumbColor,
    trackColor,
    ...rest
}: ThemedSwitchProps) {
    const enabledTrackColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        'tint'
    );
    const disabledTrackColor = useThemeColor({}, 'inputBorder');
    const disabledThumbColor = useThemeColor({}, 'lightGrey');
    return (
        <Switch
            trackColor={{
                false: disabledTrackColor,
                true: enabledTrackColor,
                ...trackColor

            }}
            thumbColor={rest.value ? thumbColor : disabledThumbColor}
            {...rest}
        />
    );
}