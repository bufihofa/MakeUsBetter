import { useEffect, useState, useRef } from 'react';
import { Modal, Text, Button, Stack, Center } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconHeart, IconPhoneCall } from '@tabler/icons-react';
import { Capacitor } from '@capacitor/core';

export function IncomingEmotion() {
    const [visible, setVisible] = useState(false);
    const [emotionData, setEmotionData] = useState<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const vibrationInterval = useRef<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Handle incoming emotion call event
        const handleIncomingCall = (event: any) => {
            const data = event.detail;
            console.log('Incoming emotion call:', data);

            setEmotionData(data);
            setVisible(true);
            startRinging();

            // Auto dismiss after 30 seconds if no answer (like a missed call)
            // or 5 seconds as requested? "nháy máy B trong 5s" implies short duration.
            const timer = setTimeout(() => {
                stopRinging();
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        };

        window.addEventListener('incomingEmotionCall', handleIncomingCall);
        return () => {
            window.removeEventListener('incomingEmotionCall', handleIncomingCall);
            stopRinging();
        };
    }, []);

    const startRinging = async () => {
        // Play sound
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio('/sounds/ringtone.mp3'); // Need to ensure file exists or use default
                audioRef.current.loop = true;
            }
            // User interaction policy might block this if not triggered by user, 
            // but since it's a "call" triggered by system wake-up, often it's allowed or handled by native.
            // On web it might fail without interaction. on Android WebView it *should* work if allowed.
            await audioRef.current.play().catch(e => console.error("Audio play failed", e));
        } catch (e) {
            console.error("Audio setup failed", e);
        }

        // Vibrate
        if (Capacitor.isNativePlatform()) {
            // Vibrate pattern: 1s on, 1s off
            const vibrate = async () => {
                if (navigator.vibrate) {
                    navigator.vibrate([1000, 1000]);
                }
            };
            vibrate();
            vibrationInterval.current = setInterval(vibrate, 2000);
        }
    };

    const stopRinging = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (vibrationInterval.current) {
            clearInterval(vibrationInterval.current);
            vibrationInterval.current = null;
        }
        if (navigator.vibrate) {
            navigator.vibrate(0);
        }
    };

    const handleAccept = () => {
        stopRinging();
        setVisible(false);
        navigate('/calendar');
    };

    const handleDismiss = () => {
        stopRinging();
        setVisible(false);
    };

    return (
        <Modal
            opened={visible}
            onClose={handleDismiss}
            fullScreen
            withCloseButton={false}
            styles={{
                content: {
                    backgroundColor: '#FF6B6B', // Vibrant color
                    color: 'white'
                }
            }}
        >
            <Center h="100vh">
                <Stack align="center" gap="xl">
                    <div className="animate-pulse">
                        <IconHeart size={120} fill="white" />
                    </div>

                    <Text size="xl" fw={700}>Incoming Emotion!</Text>
                    {emotionData?.body && (
                        <Text size="lg" ta="center">{emotionData.body}</Text>
                    )}

                    <Button
                        size="xl"
                        variant="white"
                        color="red"
                        radius="xl"
                        leftSection={<IconPhoneCall />}
                        onClick={handleAccept}
                        mt="xl"
                    >
                        See Emotion
                    </Button>
                </Stack>
            </Center>
        </Modal>
    );
}
