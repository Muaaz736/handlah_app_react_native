import React from 'react';
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTutorialContext } from './TutorialContext';
import { TutorialStep } from './tutorialTypes';
import colors from '../utils/colors';
import FONTS from '../utils/fonts';
import { navigationRef } from '../navigation/navigationRef';

const { width: SW, height: SH } = Dimensions.get('window');

// Padding around the spotlight cut-out
const SPOT_PAD = 10;
// Corner radius on the spotlight border
const SPOT_RADIUS = 16;

// Categorize steps
const MODAL_STEPS = new Set<TutorialStep>([
    'you_are_all_set',
    'halo_intro',
    'amazing',
]);

const SPOTLIGHT_STEPS = new Set<TutorialStep>([
    'spotlight_identity_hub',
    'spotlight_add_button',
    'spotlight_halo_fab',
    'spotlight_ai_assistant',
    'spotlight_account_tab',
    'spotlight_user_guide',
    'spotlight_guide_module',
    'guide_detail',
]);

// Image asset (kept outside component – static, no i18n needed)
const CONFETTI_IMAGE = require('../assets/images/icons/mynaui_confetti.png');

// Numbered label per spotlight step (matches the green circles in the designs)
const SPOTLIGHT_NUMBER: Record<string, number> = {
    spotlight_identity_hub: 1,
    spotlight_add_button: 2,
    spotlight_halo_fab: 3,
};

// Main overlay component
export const TutorialOverlay: React.FC = () => {
    const { t } = useTranslation();
    const { step, spotlightRect, spotlightAction, nextStep, skipTutorial } =
        useTutorialContext();

    // Spotlight rects come from `measureInWindow`, whose origin is not the same
    // as this overlay's on every platform: on Android it is the content area
    // below the status bar, while the overlay itself is laid out edge-to-edge
    // and so starts *above* that origin (its measured y is negative by exactly
    // the status bar height). Left uncorrected, every spotlight is drawn that
    // much too high.
    //
    // Rather than hard-code a status bar height — which differs per device and
    // changes with notches, gesture bars and rotation — measure this overlay in
    // the same coordinate space and subtract its origin. On iOS the origin is
    // (0, 0), so the arithmetic is a no-op and behaviour is unchanged.
    const rootRef = React.useRef<View>(null);
    const [frame, setFrame] = React.useState({ x: 0, y: 0, width: SW, height: SH });

    const measureRoot = React.useCallback(() => {
        rootRef.current?.measureInWindow((x, y, width, height) => {
            if (width > 0 && height > 0) {
                setFrame(prev =>
                    prev.x === x && prev.y === y && prev.width === width && prev.height === height
                        ? prev
                        : { x, y, width, height },
                );
            }
        });
    }, []);

    // Build per-step content from translations
    const MODAL_CONTENT: Record<string, { title: string; body: string; cta: string; image?: any }> = {
        you_are_all_set: {
            title: t('tutorial.you_are_all_set_title'),
            body: t('tutorial.you_are_all_set_body'),
            cta: t('tutorial.start_tutorial'),
            image: CONFETTI_IMAGE,
        },
        halo_intro: {
            title: t('tutorial.halo_intro_title'),
            body: t('tutorial.halo_intro_body'),
            cta: t('tutorial.start_tutorial'),
        },
        amazing: {
            title: t('tutorial.amazing_title'),
            body: t('tutorial.amazing_body'),
            cta: t('tutorial.start_tutorial'),
        },
    };

    const SPOTLIGHT_TOOLTIP: Record<string, string> = {
        spotlight_identity_hub: t('tutorial.spotlight_identity_hub_tooltip'),
        spotlight_add_button: t('tutorial.spotlight_add_button_tooltip'),
        spotlight_passport_choice: t('tutorial.spotlight_passport_choice_tooltip'),
        spotlight_halo_fab: t('tutorial.spotlight_halo_fab_tooltip'),
        spotlight_account_tab: t('tutorial.spotlight_account_tab_tooltip'),
        spotlight_user_guide: t('tutorial.spotlight_user_guide_tooltip'),
        spotlight_guide_module: t('tutorial.spotlight_guide_module_tooltip'),
    };

    const GUIDE_DETAIL_TOOLTIP = {
        title: t('tutorial.guide_detail_title'),
        body: t('tutorial.guide_detail_body'),
    };

    const AI_ASSISTANT_TOOLTIP = {
        title: t('tutorial.ai_assistant_title'),
        body: t('tutorial.ai_assistant_body'),
    };

    if (!step || step === 'complete' || step === 'passport_form_hint' || step === 'passport_congratulations' || step === 'spotlight_passport_choice') {
        return null;
    }

    if (MODAL_STEPS.has(step)) {
        const content = MODAL_CONTENT[step];
        // No modal step is terminal anymore (the flow continues into the user-guide
        // walkthrough), so every modal offers a Skip.
        const isLast = false;

        return (
            <View
                style={styles.root}
                pointerEvents="box-none"
                ref={rootRef}
                collapsable={false}
                // Measured here too so the origin is already known by the time
                // the first spotlight step renders.
                onLayout={measureRoot}
            >
                <View style={styles.darkFull} />
                <View style={styles.modalCard}>
                    {content.image && <Image source={content.image as ImageSourcePropType} style={{ width: 60, height: 60 }} />}
                    <Text style={styles.modalTitle}>{content.title}</Text>
                    <Text style={styles.modalBody}>{content.body}</Text>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={nextStep}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.primaryBtnText}>{content.cta}</Text>
                    </TouchableOpacity>
                    {!isLast && (
                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={skipTutorial}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.skipBtnText}>{t('common.skip_this')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    if (!SPOTLIGHT_STEPS.has(step) || !spotlightRect) {
        return null;
    }

    const { x, y, width, height } = spotlightRect;
    // Translate the measured rect into this overlay's own coordinate space.
    const sX = Math.max(0, x - frame.x - SPOT_PAD);
    const sY = Math.max(0, y - frame.y - SPOT_PAD);
    const sW = width + SPOT_PAD * 2;
    const sH = height + SPOT_PAD * 2;

    // Use the overlay's real laid-out size, not a snapshot of Dimensions taken
    // at import time, so the cut-out still covers the screen after a rotation.
    const overlayW = frame.width;
    const overlayH = frame.height;

    const spotCenterY = sY + sH / 2;
    const tooltipAbove = spotCenterY > overlayH * 0.5;

    const tooltipText = SPOTLIGHT_TOOLTIP[step] ?? '';
    const stepNumber = SPOTLIGHT_NUMBER[step];

    // Tooltip vertical position. The spotlight rect follows the chat input as it
    // rises above the keyboard, so anchoring to it keeps the tooltip just above
    // the (visible) input — like a normal messaging app.
    const tooltipStyle = tooltipAbove
        ? { bottom: overlayH - sY + 14, left: 16, right: 16 }
        : { top: sY + sH + 14, left: 16, right: 16 };

    return (
        <View
            style={styles.root}
            pointerEvents="box-none"
            ref={rootRef}
            // Android flattens plain container views; without this the ref has
            // no native view to measure.
            collapsable={false}
            onLayout={measureRoot}
        >
            {/* Single SVG overlay: full-screen rect with a rounded-rect hole punched out */}
            <Svg
                pointerEvents="none"
                style={StyleSheet.absoluteFillObject}
                width={overlayW}
                height={overlayH}
            >
                <Path
                    fillRule="evenodd"
                    d={[
                        `M 0 0 H ${overlayW} V ${overlayH} H 0 Z`,
                        `M ${sX + SPOT_RADIUS} ${sY}`,
                        `H ${sX + sW - SPOT_RADIUS}`,
                        `Q ${sX + sW} ${sY} ${sX + sW} ${sY + SPOT_RADIUS}`,
                        `V ${sY + sH - SPOT_RADIUS}`,
                        `Q ${sX + sW} ${sY + sH} ${sX + sW - SPOT_RADIUS} ${sY + sH}`,
                        `H ${sX + SPOT_RADIUS}`,
                        `Q ${sX} ${sY + sH} ${sX} ${sY + sH - SPOT_RADIUS}`,
                        `V ${sY + SPOT_RADIUS}`,
                        `Q ${sX} ${sY} ${sX + SPOT_RADIUS} ${sY} Z`,
                    ].join(' ')}
                    fill={OVERLAY_BG}
                />
            </Svg>

            {/* Touch-blockers: swallow taps in the dark areas so they can't reach the
                screen below. Tapping a dark area also dismisses the keyboard, so the
                user always has a way to close it (the overlay otherwise sits on top). */}
            <Pressable onPress={() => Keyboard.dismiss()} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: sY }} />
            <Pressable onPress={() => Keyboard.dismiss()} style={{ position: 'absolute', top: sY, left: 0, width: sX, height: sH }} />
            <Pressable onPress={() => Keyboard.dismiss()} style={{ position: 'absolute', top: sY, left: sX + sW, right: 0, height: sH }} />
            <Pressable onPress={() => Keyboard.dismiss()} style={{ position: 'absolute', top: sY + sH, left: 0, right: 0, bottom: 0 }} />

            {/* Spotlight highlight border */}
            <View
                pointerEvents="none"
                style={[
                    styles.spotBorder,
                    {
                        position: 'absolute',
                        top: sY,
                        left: sX,
                        width: sW,
                        height: sH,
                        borderRadius: SPOT_RADIUS,
                    },
                ]}
            />

            {/* Spotlight tap area – only when an action is registered */}
            {spotlightAction && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: sY,
                        left: sX,
                        width: sW,
                        height: sH,
                    }}
                    onPress={spotlightAction.fn}
                    activeOpacity={0.8}
                />
            )}

            {/* Tooltip bubble */}
            {step === 'spotlight_ai_assistant' ? (
                // Standalone Continue button above a separate white info card, both above the spotlight
                <View style={{ position: 'absolute', ...tooltipStyle }}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => {
                            Keyboard.dismiss();
                            nextStep();
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.primaryBtnText}>{t('common.continue')}</Text>
                    </TouchableOpacity>
                    <View style={[styles.tooltipBubble, { marginTop: 12 }]}>
                        <Text style={styles.tooltipTitle}>{AI_ASSISTANT_TOOLTIP.title}</Text>
                        <Text style={[styles.tooltipBody, { marginBottom: 0 }]}>{AI_ASSISTANT_TOOLTIP.body}</Text>
                    </View>
                </View>
            ) : step === 'guide_detail' ? (
                // Final step: detailed-guide tooltip + "Complete Tutorial" button below the highlighted guide.
                <View style={{ position: 'absolute', ...tooltipStyle }}>
                    <View style={styles.tooltipBubble}>
                        <Text style={styles.tooltipBody}>{GUIDE_DETAIL_TOOLTIP.body}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { marginTop: 12 }]}
                        onPress={() => {
                            // Finish the tutorial, then return the user to the Dashboard (Home tab).
                            nextStep();
                            if (navigationRef.isReady()) {
                                navigationRef.navigate('Dashboard', { screen: 'Home' });
                            }
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.primaryBtnText}>{t('tutorial.complete_tutorial')}</Text>
                    </TouchableOpacity>
                </View>
            ) : step !== "spotlight_halo_fab" ? (
                <View style={[styles.tooltipBubble, { position: 'absolute', ...tooltipStyle }]}>
                    {/* Step number circle (omitted if step has no number) */}
                    {stepNumber !== undefined && (
                        <View style={styles.stepCircle}>
                            <Text style={styles.stepCircleText}>{stepNumber}</Text>
                        </View>
                    )}
                    <Text style={styles.tooltipBody}>{tooltipText}</Text>
                </View>
            ) : (<View style={[styles.tooltipBubble, { position: 'absolute', ...tooltipStyle, paddingTop: 0 }]}>
                <Text style={styles.tooltipBody}>{tooltipText}</Text>
            </View>)}
        </View>
    );
};

const OVERLAY_BG = 'rgba(0,0,0,0.65)';
const PRIMARY = colors.primary;

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 99,
    },
    darkFull: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: OVERLAY_BG,
    },
    dark: {
        backgroundColor: OVERLAY_BG,
    },
    spotBorder: {
        borderWidth: 2,
        borderColor: colors.white,
    },

    modalCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 44,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: FONTS.display_bold,
        color: colors.black,
        textAlign: 'center',
        marginBottom: 12,
    },
    modalBody: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },

    tooltipOnlyCard: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 15,
    },
    tooltipTitle: {
        fontSize: 18,
        fontFamily: FONTS.display_bold,
        color: colors.black,
        textAlign: 'center',
        marginBottom: 10,
    },
    tooltipBody: {
        fontSize: 16,
        fontFamily: FONTS.display_regular,
        color: colors.black,
        textAlign: 'center',
        lineHeight: 21,
        marginTop: 18,
    },

    tooltipBubble: {
        backgroundColor: colors.white,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 12,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        alignSelf: 'flex-start',
        position: 'absolute',
        top: -25,
        left: "50%",
    },
    stepCircleText: {
        color: colors.black,
        fontWeight: "600",
        fontSize: 20,
    },

    primaryBtn: {
        backgroundColor: PRIMARY,
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 32,
        alignSelf: 'stretch',
        alignItems: 'center',
        marginBottom: 4,
    },
    primaryBtnText: {
        fontSize: 16,
        fontFamily: FONTS.display_bold,
        color: colors.black,
        fontWeight: '700',
    },
    skipBtn: {
        marginTop: 10,
        paddingVertical: 8,
    },
    skipBtnText: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
        color: colors.black,
        textAlign: 'center',
    },
    skipInlineBtn: {
        marginTop: 6,
        alignSelf: 'center',
    },
    skipInlineText: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: '#999',
        textDecorationLine: 'underline',
    },
});
