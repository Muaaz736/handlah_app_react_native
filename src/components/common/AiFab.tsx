import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useUserRole } from "../../hooks/useUserRole";
import { Dimensions, Image, TouchableOpacity, View } from "react-native";
import { fabStyles } from "../../navigation/StackNavigation/Stackstyles";
import { ICONS } from "../../utils/Images";

const { height } = Dimensions.get('window');

interface AiFabProps {
    /** Optional callback forwarded to the inner TouchableOpacity on press. */
    onPress?: () => void;
}

export const AiFab = React.forwardRef<View, AiFabProps>(({ onPress }, ref) => {
    const { themeColors } = useUserRole();
    const navigation = useNavigation<any>();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            navigation.navigate('Dashboard', { screen: 'AiAssistant' } as never);
        }
    };

    return (
        <TouchableOpacity
            ref={ref as any}
            style={[fabStyles.btn, { backgroundColor: themeColors.primary, bottom: height >= 812 ? 10 : 15 }]}
            onPress={handlePress}
            activeOpacity={0.85}
        >
            <Image source={ICONS.APP_ICON} style={fabStyles.icon} resizeMode="contain" />
        </TouchableOpacity>
    );
});

AiFab.displayName = 'AiFab';