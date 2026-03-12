import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { useState, useCallback, useEffect } from 'react';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as ImageManipulator from 'expo-image-manipulator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, RotateCcw, SkipForward } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const MIN_CROP = 80;

export default function CropScreen() {
    const router = useRouter();
    const { currentImageUri, setCurrentImageUri } = useStore();
    const insets = useSafeAreaInsets();

    // Step 1: normalize the image (fix EXIF rotation) before showing anything
    const [normalizedUri, setNormalizedUri] = useState<string | null>(null);
    const [imageNatural, setImageNatural] = useState({ w: 0, h: 0 });
    const [preparing, setPreparing] = useState(true);

    useEffect(() => {
        if (!currentImageUri) return;
        (async () => {
            try {
                // manipulateAsync with no ops bakes in EXIF rotation,
                // so width/height returned are the TRUE display dimensions
                const result = await ImageManipulator.manipulateAsync(
                    currentImageUri,
                    [],
                    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
                );
                setNormalizedUri(result.uri);
                setImageNatural({ w: result.width, h: result.height });
            } catch { // 'e' removed as it was unused
                // fallback: use original
                setNormalizedUri(currentImageUri);
            } finally {
                setPreparing(false);
            }
        })();
    }, [currentImageUri]);

    const [isCropping, setIsCropping] = useState(false);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

    // Crop box (shared values)
    const boxX = useSharedValue(0);
    const boxY = useSharedValue(0);
    const boxW = useSharedValue(0);
    const boxH = useSharedValue(0);
    const initialised = useSharedValue(false);

    const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        if (containerSize.w === 0 && width > 0) {
            setContainerSize({ w: width, h: height });
            // Initial crop = 84% wide, centred vertically, square-ish
            const w = width * 0.84;
            const h = Math.min(w, height * 0.70);
            boxX.value = (width - w) / 2;
            boxY.value = (height - h) / 2;
            boxW.value = w;
            boxH.value = h;
            initialised.value = true;
        }
    }, []); // eslint-disable-line

    // ── Move box ──────────────────────────────────────────────────────────────
    const mSX = useSharedValue(0); const mSY = useSharedValue(0);
    const moveGesture = Gesture.Pan()
        .onBegin(() => { mSX.value = boxX.value; mSY.value = boxY.value; })
        .onUpdate((e) => {
            boxX.value = Math.max(0, Math.min(mSX.value + e.translationX, containerSize.w - boxW.value));
            boxY.value = Math.max(0, Math.min(mSY.value + e.translationY, containerSize.h - boxH.value));
        });

    // ── TL ────────────────────────────────────────────────────────────────────
    const tlX = useSharedValue(0); const tlY = useSharedValue(0);
    const tlW = useSharedValue(0); const tlH = useSharedValue(0);
    const tlGesture = Gesture.Pan()
        .onBegin(() => { tlX.value = boxX.value; tlY.value = boxY.value; tlW.value = boxW.value; tlH.value = boxH.value; })
        .onUpdate((e) => {
            const nw = Math.max(MIN_CROP, tlW.value - e.translationX);
            const nh = Math.max(MIN_CROP, tlH.value - e.translationY);
            boxX.value = Math.max(0, tlX.value + tlW.value - nw);
            boxY.value = Math.max(0, tlY.value + tlH.value - nh);
            boxW.value = nw; boxH.value = nh;
        });

    // ── TR ────────────────────────────────────────────────────────────────────
    const trY = useSharedValue(0); const trW = useSharedValue(0); const trH = useSharedValue(0);
    const trGesture = Gesture.Pan()
        .onBegin(() => { trY.value = boxY.value; trW.value = boxW.value; trH.value = boxH.value; })
        .onUpdate((e) => {
            const nh = Math.max(MIN_CROP, trH.value - e.translationY);
            boxY.value = Math.max(0, trY.value + trH.value - nh);
            boxW.value = Math.max(MIN_CROP, trW.value + e.translationX);
            boxH.value = nh;
        });

    // ── BL ────────────────────────────────────────────────────────────────────
    const blX = useSharedValue(0); const blW = useSharedValue(0); const blH = useSharedValue(0);
    const blGesture = Gesture.Pan()
        .onBegin(() => { blX.value = boxX.value; blW.value = boxW.value; blH.value = boxH.value; })
        .onUpdate((e) => {
            const nw = Math.max(MIN_CROP, blW.value - e.translationX);
            boxX.value = Math.max(0, blX.value + blW.value - nw);
            boxW.value = nw;
            boxH.value = Math.max(MIN_CROP, blH.value + e.translationY);
        });

    // ── BR ────────────────────────────────────────────────────────────────────
    const brW = useSharedValue(0); const brH = useSharedValue(0);
    const brGesture = Gesture.Pan()
        .onBegin(() => { brW.value = boxW.value; brH.value = boxH.value; })
        .onUpdate((e) => {
            boxW.value = Math.max(MIN_CROP, brW.value + e.translationX);
            boxH.value = Math.max(MIN_CROP, brH.value + e.translationY);
        });

    // ── Animated styles ───────────────────────────────────────────────────────
    const cropBoxStyle = useAnimatedStyle(() => ({ left: boxX.value, top: boxY.value, width: boxW.value, height: boxH.value }));
    const overlayTopStyle = useAnimatedStyle(() => ({ height: Math.max(0, boxY.value) }));
    const overlayBotStyle = useAnimatedStyle(() => ({ top: boxY.value + boxH.value, bottom: 0 }));
    const overlayLeftStyle = useAnimatedStyle(() => ({ top: boxY.value, width: Math.max(0, boxX.value), height: boxH.value }));
    const overlayRightStyle = useAnimatedStyle(() => ({ top: boxY.value, left: boxX.value + boxW.value, right: 0, height: boxH.value }));

    // ── Apply crop ────────────────────────────────────────────────────────────
    const applyCrop = useCallback(async () => {
        if (!normalizedUri || imageNatural.w === 0 || containerSize.w === 0) return;
        setIsCropping(true);
        try {
            const CW = containerSize.w;
            const CH = containerSize.h;
            const IW = imageNatural.w;
            const IH = imageNatural.h;

            // cover mode: scale so the image fills the container completely
            const scale = Math.max(CW / IW, CH / IH);

            // Rendered size & centering offset
            const renderedW = IW * scale;
            const renderedH = IH * scale;
            const offsetX = (renderedW - CW) / 2;
            const offsetY = (renderedH - CH) / 2;

            // Container-space → image-pixel-space
            const originX = Math.round((boxX.value + offsetX) / scale);
            const originY = Math.round((boxY.value + offsetY) / scale);
            const cropW = Math.round(boxW.value / scale);
            const cropH = Math.round(boxH.value / scale);

            const safeOX = Math.max(0, Math.min(originX, IW - 1));
            const safeOY = Math.max(0, Math.min(originY, IH - 1));
            const safeW = Math.min(cropW, IW - safeOX);
            const safeH = Math.min(cropH, IH - safeOY);

            const result = await ImageManipulator.manipulateAsync(
                normalizedUri,
                [{ crop: { originX: safeOX, originY: safeOY, width: safeW, height: safeH } }],
                { compress: 0.88, format: ImageManipulator.SaveFormat.JPEG }
            );

            setCurrentImageUri(result.uri);
            router.back();
        } catch (err) {
            console.error('Crop failed:', err);
        } finally {
            setIsCropping(false);
        }
    }, [normalizedUri, imageNatural, containerSize, boxX, boxY, boxW, boxH, router, setCurrentImageUri]);

    // ── Render ────────────────────────────────────────────────────────────────
    if (preparing) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator color="#10b981" size="large" />
                <Text style={styles.loadingScreenText}>Preparing image...</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.root}>
            <View style={styles.container} onLayout={onContainerLayout}>

                {/* Image (already EXIF-normalized) */}
                {normalizedUri && (
                    <Image source={{ uri: normalizedUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                )}

                {/* Dark overlays around crop box */}
                <Animated.View style={[styles.overlay, styles.oFull, overlayTopStyle]} pointerEvents="none" />
                <Animated.View style={[styles.overlay, styles.oFull, overlayBotStyle]} pointerEvents="none" />
                <Animated.View style={[styles.overlay, styles.oAbs, overlayLeftStyle]} pointerEvents="none" />
                <Animated.View style={[styles.overlay, styles.oAbs, overlayRightStyle]} pointerEvents="none" />

                {/* Moveable crop box */}
                <GestureDetector gesture={moveGesture}>
                    <Animated.View style={[styles.cropBox, cropBoxStyle]}>

                        {/* Rule-of-thirds */}
                        <View style={[styles.gl, { top: '33%', left: 0, right: 0, height: StyleSheet.hairlineWidth }]} pointerEvents="none" />
                        <View style={[styles.gl, { top: '66%', left: 0, right: 0, height: StyleSheet.hairlineWidth }]} pointerEvents="none" />
                        <View style={[styles.gl, { left: '33%', top: 0, bottom: 0, width: StyleSheet.hairlineWidth }]} pointerEvents="none" />
                        <View style={[styles.gl, { left: '66%', top: 0, bottom: 0, width: StyleSheet.hairlineWidth }]} pointerEvents="none" />

                        {/* TL */}
                        <GestureDetector gesture={tlGesture}>
                            <Animated.View style={[styles.corner, styles.cTL]} hitSlop={20}>
                                <View style={styles.cH} /><View style={styles.cV} />
                            </Animated.View>
                        </GestureDetector>
                        {/* TR */}
                        <GestureDetector gesture={trGesture}>
                            <Animated.View style={[styles.corner, styles.cTR]} hitSlop={20}>
                                <View style={[styles.cH, styles.rAlign]} /><View style={[styles.cV, styles.rAlign]} />
                            </Animated.View>
                        </GestureDetector>
                        {/* BL */}
                        <GestureDetector gesture={blGesture}>
                            <Animated.View style={[styles.corner, styles.cBL]} hitSlop={20}>
                                <View style={[styles.cH, styles.bAlign]} /><View style={[styles.cV, styles.bAlign]} />
                            </Animated.View>
                        </GestureDetector>
                        {/* BR */}
                        <GestureDetector gesture={brGesture}>
                            <Animated.View style={[styles.corner, styles.cBR]} hitSlop={20}>
                                <View style={[styles.cH, styles.bAlign, styles.rAlign]} /><View style={[styles.cV, styles.bAlign, styles.rAlign]} />
                            </Animated.View>
                        </GestureDetector>
                    </Animated.View>
                </GestureDetector>

                {/* Hint label */}
                <View style={styles.hint} pointerEvents="none">
                    <Text style={styles.hintText}>Drag to move  •  Pull corners to resize</Text>
                </View>

                {/* Bottom buttons */}
                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, 28) }]}>
                    {isCropping ? (
                        <BlurView intensity={60} tint="dark" style={styles.loadBox}>
                            <ActivityIndicator color="#10b981" size="large" />
                            <Text style={styles.loadText}>Applying crop...</Text>
                        </BlurView>
                    ) : (
                        <View style={styles.buttons}>
                            <TouchableOpacity style={styles.retakeBtn} onPress={() => router.back()} activeOpacity={0.7}>
                                <BlurView intensity={50} tint="dark" style={styles.blurBtn}>
                                    <RotateCcw color="#fff" size={22} />
                                    <Text style={styles.btnTxt}>Retake</Text>
                                </BlurView>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.skipBtn} onPress={() => router.back()} activeOpacity={0.7}>
                                <BlurView intensity={50} tint="dark" style={styles.blurBtn}>
                                    <SkipForward color="#fff" size={20} />
                                    <Text style={styles.btnTxt}>Cancel</Text>
                                </BlurView>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cropBtn} onPress={applyCrop} activeOpacity={0.8}>
                                <Check color="#fff" size={22} />
                                <Text style={styles.cropBtnTxt}>Crop</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </GestureHandlerRootView>
    );
}

const CORNER = 44;
const BAR_W = 4;
const BAR_L = 22;

const styles = StyleSheet.create({
    loadingScreen: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingScreenText: { color: '#fff', fontSize: 16 },
    root: { flex: 1, backgroundColor: '#000' },
    container: { flex: 1 },

    overlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.60)' },
    oFull: { left: 0, right: 0 },
    oAbs: {},

    cropBox: { position: 'absolute', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
    gl: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.25)' },

    corner: { position: 'absolute', width: CORNER, height: CORNER },
    cTL: { top: -BAR_W / 2, left: -BAR_W / 2 },
    cTR: { top: -BAR_W / 2, right: -BAR_W / 2 },
    cBL: { bottom: -BAR_W / 2, left: -BAR_W / 2 },
    cBR: { bottom: -BAR_W / 2, right: -BAR_W / 2 },

    cH: { position: 'absolute', top: 0, left: 0, width: BAR_L, height: BAR_W, backgroundColor: '#10b981', borderRadius: 2 },
    cV: { position: 'absolute', top: 0, left: 0, width: BAR_W, height: BAR_L, backgroundColor: '#10b981', borderRadius: 2 },
    rAlign: { left: undefined, right: 0 },
    bAlign: { top: undefined, bottom: 0 },

    hint: { position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center' },
    hintText: {
        color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500',
        backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 20, overflow: 'hidden',
    },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
    buttons: { flexDirection: 'row', gap: 16 },
    retakeBtn: { flex: 1, borderRadius: 20, overflow: 'hidden' },
    skipBtn: { flex: 1, borderRadius: 20, overflow: 'hidden' },
    blurBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8, backgroundColor: 'rgba(0,0,0,0.3)' },
    btnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
    cropBtn: {
        flex: 1.5, backgroundColor: '#10b981', borderRadius: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, gap: 8,
        shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
    },
    cropBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
    loadBox: { borderRadius: 20, padding: 28, alignItems: 'center', overflow: 'hidden', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    loadText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
