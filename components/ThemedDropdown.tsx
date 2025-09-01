import { ReactNode, Ref, useEffect, useRef, useState } from 'react';
import {
	Image,
	Keyboard,
	Animated as Reanimated,
	StyleSheet,
	Text,
	TextStyle,
	TouchableHighlight,
	TouchableOpacity,
	useAnimatedValue,
	useColorScheme,
	View,
	type ViewProps,
	ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { fontWeight } from '@/constants/Font';
import { useGeneral } from '@/context/GeneralContext';
import { delay } from '@/helpers';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimContainer from './AnimContainer';
import { ThemedText } from './ThemedText';

export type ThemedDropdownProps = ViewProps & {
	containerRef: Ref<View>;
	lightColor?: string;
	darkColor?: string;
	placeholder: string;
	value?: string;
	showCheckbox?: boolean;
	active?: boolean;
	selectedValues?: string[];
	showDropdown?: boolean;
	delayTouch?: boolean;
	label?: string;
	labelStyle?: TextStyle;
	setShowDropdown?: (v: boolean) => void;
	multiselect?: boolean;
	onSelect?: () => void;
	onPressEnd?: (v: any) => void;
	secondaryElement?: (option: string) => ReactNode;
	setValue: (value: any) => void;
	toggleMainScroll?: (v: boolean) => void;
	options: string[];
	dropDownStyle?: ViewStyle;
};

export const ThemedDropdown = ({
	style,
	lightColor,
	darkColor,
	value,
	setValue,
	onPressEnd,
	active = true,
	options,
	selectedValues,
	showCheckbox = true,
	showDropdown = false,
	setShowDropdown = () => {},
	multiselect,
	placeholder,
	dropDownStyle,
	label,
	labelStyle,
	delayTouch,
	onSelect,
	id,
	toggleMainScroll,
	secondaryElement,
	containerRef,
	...otherProps
}: ThemedDropdownProps) => {
	const backgroundColor = useThemeColor(
		{ light: lightColor, dark: darkColor },
		'background'
	);
	const { isAnimatable, keyboardVisible } = useGeneral();
	const dropdownAnimVal = useAnimatedValue(0);
	const colorScheme = useColorScheme() ?? 'light';
	const scrollRef = useAnimatedRef<Animated.ScrollView>();
	const setValDelay = useRef<NodeJS.Timeout | null>(null);

	const [isScrolling, setIsScrolling] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState(false);

	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
	const resetIsCrollingTimeout = useRef<NodeJS.Timeout | null>(null);
	useEffect(() => {
		if (!showDropdown) {
			scrollRef.current?.scrollTo?.({ y: 0, animated: isAnimatable });
			Reanimated.timing(dropdownAnimVal, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true,
			}).start(() => setDropdownVisible(false));
		} else {
			setDropdownVisible(true);
			Reanimated.timing(dropdownAnimVal, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}).start();
		}
	}, [showDropdown, scrollRef, isAnimatable, dropdownAnimVal]);
	return (
		<>
			<View
				ref={containerRef}
				style={[
					{
						position: 'relative',
						flexDirection: 'column',
						overflow: 'visible',
					},
					style,
					showDropdown && {
						elevation: 25,
						zIndex: 900,
					},
				]}
				{...otherProps}
			>
				{label && (
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
						style={[
							{
								marginBottom: 8,
								textAlign: 'left',
								fontWeight: fontWeight['heading.two'],
							},
							labelStyle,
						]}
					>
						{label}
					</ThemedText>
				)}
				<TouchableOpacity
					style={[
						{
							backgroundColor,
							position: 'relative',
						},
					]}
					onPress={async () => {
						if (!active) return;
						if (keyboardVisible) {
							Keyboard.dismiss();
							isAnimatable && (await delay(50));
						}
						if (!!onSelect) {
							onSelect();
						} else {
							setShowDropdown(!showDropdown);
						}
					}}
					activeOpacity={0.9}
				>
					<View
						style={[
							styles.valueContainer,
							{
								borderWidth: 2,
								borderRadius: 5,
								borderColor: Colors[colorScheme].inputBorder,
							},
						]}
					>
						{multiselect && !!selectedValues?.filter(Boolean)?.length ? (
							<Text
								allowFontScaling={false}
								style={[styles.valueText, !active && { color: '#979797' }]}
							>
								{selectedValues.filter(Boolean).length} {'selected'}
							</Text>
						) : value ? (
							<Text
								allowFontScaling={false}
								style={[styles.valueText, !active && { color: '#979797' }]}
							>
								{value}
							</Text>
						) : (
							<Text
								allowFontScaling={false}
								style={[styles.valueText, !active && { color: '#979797' }]}
							>
								{placeholder}
							</Text>
						)}
						<View>
							<Image source={require('@/assets/icons/chevron-down.png')} />
						</View>
					</View>
				</TouchableOpacity>
				<AnimContainer
					generalStyle={{
						...styles.dropdown,
						...dropDownStyle,
						position: 'absolute',
						display: dropdownVisible ? 'flex' : 'none',
						transformOrigin: 'top',
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.1,
						shadowRadius: 10,
						elevation: 6,
						zIndex: 400,
					}}
					animStyle={{
						transform: [
							// Change from simple translateY to scale origin from bottom
							{
								translateY: dropdownAnimVal.interpolate({
									inputRange: [0, 1],
									outputRange: [20, 0], // Slightly more downward starting position
								}),
							},
							{
								scaleY: dropdownAnimVal.interpolate({
									inputRange: [0, 1],
									outputRange: [0.2, 1], // Start at 0.2 scale (nearly collapsed)
								}),
							},
						],
					}}
					lightColor={dropDownStyle?.backgroundColor as string}
					darkColor={dropDownStyle?.backgroundColor as string}
				>
					<ScrollView
						ref={scrollRef}
						nestedScrollEnabled={true}
						keyboardShouldPersistTaps='handled'
						style={{ backgroundColor: '#fff' }}
						onTouchStart={(e) => {
							if (delayTouch) {
								e.stopPropagation();
								setIsScrolling(true);
								resetIsCrollingTimeout.current = setTimeout(
									() => setIsScrolling(false),
									80
								);
							}
						}}
						onScrollBeginDrag={(e) => {
							e.stopPropagation();
							setIsScrolling(true);
							if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
						}}
						onScrollEndDrag={() => {
							scrollTimeout.current = setTimeout(
								() => setIsScrolling(false),
								100
							);
							resetIsCrollingTimeout.current &&
								clearTimeout(resetIsCrollingTimeout.current);
						}}
						onMomentumScrollEnd={() => {
							scrollTimeout.current = setTimeout(
								() => setIsScrolling(false),
								100
							);
							resetIsCrollingTimeout.current &&
								clearTimeout(resetIsCrollingTimeout.current);
						}}
						onScroll={(e) => e.stopPropagation()}
					>
						<ThemedView
							style={[
								{
									gap: 4,
									flexDirection: 'column',
									padding: 8,
								},
							]}
							lightColor='#fff'
							darkColor='#fff'
						>
							{!multiselect &&
								options?.map((option, i) => (
									<TouchableHighlight
										style={[
											styles.option,
											{
												backgroundColor: value === option ? '#002060' : '#fff',
												borderRadius: 4,
											},
										]}
										key={`${i}-${id}-option`}
										onPress={async () => {
											if (isScrolling) return; // Prevent action while scrolling
											if (keyboardVisible) {
												Keyboard.dismiss();
												isAnimatable && (await delay(50));
											}
											setValDelay.current && clearTimeout(setValDelay.current);
											//setValDelay.current = setTimeout(() => {
											setValue(option);
											//}, 50); // Delay setting value to allow for smoother interaction
											setShowDropdown(!showDropdown);
										}}
										onPressOut={() => {
											if (isScrolling) return; // Prevent action while scrolling
											onPressEnd && onPressEnd(option);
										}}
										delayPressIn={50} // Wait longer before registering press
										activeOpacity={0.9} // Less aggressive opacity change
										underlayColor={value === option ? '#001850' : '#f0f0f0'} // Darker when selected
									>
										<ThemedView
											style={{
												flexDirection: 'row',
												gap: 10,
												alignItems: 'center',
											}}
											lightColor='transparent'
											darkColor='transparent'
										>
											{secondaryElement && secondaryElement(option)}
											<Text
												allowFontScaling={false}
												style={{
													color: value === option ? '#FFFFFF' : '#767676',
													fontSize: 14,
													fontWeight: 400,
													letterSpacing: 0.05,
												}}
											>
												{option}
											</Text>
										</ThemedView>
									</TouchableHighlight>
								))}
							{multiselect &&
								options?.map((option, i) => (
									<TouchableHighlight
										style={[
											styles.option,
											{
												backgroundColor: selectedValues?.includes(option)
													? '#002060'
													: '#fff',

												borderRadius: 4,
											},
										]}
										key={`${i}-${id}-option`}
										onPress={async () => {
											if (isScrolling) return; // Prevent action while scrolling
											if (keyboardVisible) {
												Keyboard.dismiss();
												isAnimatable && (await delay(50));
											}
											setValue(option);
										}}
										onPressOut={() => {
											if (isScrolling) return; // Prevent action while scrolling
											onPressEnd && onPressEnd(option);
										}}
										activeOpacity={0.6}
										underlayColor='#fff'
										delayPressIn={50} // Wait longer before registering press
									>
										<ThemedView
											style={{
												flexDirection: 'row',
												gap: 10,
												alignItems: 'center',
											}}
											lightColor='transparent'
											darkColor='transparent'
										>
											<ThemedView
												style={{
													display: showCheckbox ? 'flex' : 'none',
													width: 20,
													height: 20,
													borderWidth: 1,
													borderColor: '#333',
													borderRadius: 5,
													justifyContent: 'center',
													alignItems: 'center',
												}}
												lightColor='transparent'
												darkColor='transparent'
											>
												<Image
													source={require('@/assets/icons/blue-check.png')}
													style={{
														display: selectedValues?.includes(option)
															? 'flex'
															: 'none',
														width: 20,
														height: 20,
													}}
												/>
											</ThemedView>
											{secondaryElement && secondaryElement(option)}
											<Text
												allowFontScaling={false}
												style={{
													color: selectedValues?.includes(option)
														? '#FFFFFF'
														: '#767676',
													fontSize: 14,
													fontWeight: 400,
													letterSpacing: 0.05,
												}}
											>
												{option}
											</Text>
										</ThemedView>
									</TouchableHighlight>
								))}
						</ThemedView>
					</ScrollView>
				</AnimContainer>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	dropdown: {
		flexDirection: 'column',
		position: 'absolute',
		width: '100%',
		top: 90,
		maxHeight: 150,
		backgroundColor: '#fff',
		borderColor: 'transparent',
		borderWidth: 1,
		borderRadius: 4,
		gap: 4,
		overflow: 'hidden',
	},
	option: {
		position: 'relative',
		zIndex: 50,
		paddingRight: 8,
		paddingLeft: 5,
		paddingTop: 8,
		paddingBottom: 8,
	},
	valueContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 15,
		position: 'relative',
		zIndex: 5,
	},
	valueText: {
		fontSize: 14,
		color: '#333333',
		fontWeight: 400,
		letterSpacing: 0.25,
	},
});
