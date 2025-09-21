import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useMemo } from 'react';
import { TextStyle, TouchableOpacity, useColorScheme, ViewStyle } from 'react-native';

export type ThemedDatePickerProps = {
  label?: string;
  placeholder?: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: any;
  displayFormat?: (d: Date) => string;
  showClearButton?: boolean;
};

// Web-only shim: does not open a native picker; used to avoid bundling the native module in Storybook/web builds.
export default function ThemedDatePicker({
  label,
  placeholder,
  value,
  onChange,
  mode = 'date',
  disabled,
  containerStyle,
  labelStyle,
  inputStyle,
  displayFormat,
  showClearButton = true,
}: ThemedDatePickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconName = mode === 'time' ? 'clock' : 'calendar';

  const formatted = useMemo(() => {
    if (!value) return '';
    if (displayFormat) return displayFormat(value);
    try {
      if (mode === 'time') return value.toLocaleTimeString();
      if (mode === 'datetime') return value.toLocaleString();
      return value.toDateString();
    } catch {
      return value.toString();
    }
  }, [value, displayFormat, mode]);

  const handlePress = () => {
    // No-op on web; use controls in Storybook to set/clear date
    if (disabled) return;
  };

  return (
    <ThemedView
      lightColor={Colors[colorScheme].background}
      darkColor={Colors[colorScheme].background}
      style={[{ flexDirection: 'column' }, containerStyle]}
    >
      {label ? (
        <ThemedText
          lightColor={Colors.light.text}
          darkColor={Colors.dark.text}
          style={[{ marginBottom: 8 }, labelStyle]}
        >
          {label}
        </ThemedText>
      ) : null}

      <TouchableOpacity activeOpacity={0.8} onPress={handlePress} disabled={disabled}>
        <ThemedView
          lightColor={Colors[colorScheme].background}
          darkColor={Colors[colorScheme].background}
          style={{ position: 'relative' }}
        >
          <ThemedInput
            editable={false}
            placeholder={placeholder || label}
            value={formatted}
            setValue={() => {}}
            style={[
              {
                paddingRight: 44,
                backgroundColor: Colors[colorScheme].inputBackground,
                borderColor: Colors[colorScheme].inputBorder,
                borderWidth: 1,
              },
              inputStyle,
            ]}
          />

          <ThemedView
            lightColor={'transparent'}
            darkColor={'transparent'}
            style={{ position: 'absolute', right: 12, top: 15, zIndex: 1 }}
            pointerEvents="none"
          >
            <IconSymbol name={iconName as any} size={20} color={Colors[colorScheme].text} />
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>

      {showClearButton && !!value && (
        <ThemedView
          lightColor={Colors[colorScheme].background}
          darkColor={Colors[colorScheme].background}
          style={{ alignItems: 'flex-end', marginTop: 6 }}
        >
          <TouchableOpacity onPress={() => onChange(null)}>
            <ThemedText lightColor={Colors.light.bim} darkColor={Colors.dark.bim}>
              Clear
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
}
