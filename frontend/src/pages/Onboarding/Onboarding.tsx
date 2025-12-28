import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    Text,
    Button,
    Stack,
    Group,
    ThemeIcon,
    PinInput,
    CopyButton,
    ActionIcon,
    Tooltip,
    Center,
    Loader
} from '@mantine/core';
import {
    IconHeart,
    IconLink,
    IconCheck,
    IconCopy,
    IconArrowLeft,
    IconHourglass,
    IconRefresh
} from '@tabler/icons-react';
import { pairApi } from '../../services/api';
import storage from '../../services/storage';

type Step = 'welcome' | 'create' | 'join' | 'waiting' | 'success';

export default function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('welcome');
    const [pairCode, setPairCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingPair, setCheckingPair] = useState(true);

    const userName = storage.getUserName() || 'Bạn';

    const checkPairStatus = useCallback(async () => {
        try {
            setLoading(true);
            const response = await pairApi.getPartner();
            const data = response.data;

            if (data.isPaired) {
                // Already paired, go to home
                storage.setPartnerId(data.partnerId);
                storage.setPartnerName(data.partnerName);
                storage.setPairCode(data.pairCode);
                navigate('/home', { replace: true });
            } else if (data.pairCode) {
                // Has created pair but waiting for partner
                setGeneratedCode(data.pairCode);
                storage.setPairCode(data.pairCode);
                setStep('waiting');
            } else {
                // Not paired, no code -> Welcome screen
                setStep('welcome');
            }
        } catch (error) {
            // Not paired yet, show welcome
            console.error("Check pair status error", error);
        } finally {
            setCheckingPair(false);
            setLoading(false);
        }
    }, [navigate]);

    // Check if already paired on mount
    useEffect(() => {
        checkPairStatus();
    }, [checkPairStatus]);

    const handleCreatePair = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await pairApi.create();
            const data = response.data;

            storage.setToken(data.token);
            storage.setPairCode(data.pairCode);

            setGeneratedCode(data.pairCode);
            setStep('waiting');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinPair = async () => {
        if (!pairCode.trim() || pairCode.length !== 6) {
            setError('Mã ghép phải có 6 ký tự');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await pairApi.join(pairCode.trim().toUpperCase());
            const data = response.data;

            storage.setToken(data.token);
            storage.setPartnerId(data.partnerId);
            storage.setPartnerName(data.partnerName);
            storage.setPairCode(data.pairCode);

            setPartnerName(data.partnerName);
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mã ghép không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        navigate('/home');
    };

    if (checkingPair) {
        return (
            <Center h="100vh">
                <Stack align="center" gap="sm">
                    <Loader size="lg" color="primary" />
                    <Text c="dimmed">Đang kiểm tra...</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Container size={420} my={40}>
            <Center mb={20}>
                <IconHeart size={50} color="var(--mantine-color-primary-6)" style={{ fill: 'var(--mantine-color-primary-1)' }} />
            </Center>

            {/* Welcome Step */}
            {step === 'welcome' && (
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Stack align="center">
                        <Title order={2} ta="center">Xin chào, {userName}!</Title>
                        <Text c="dimmed" ta="center">Hãy kết nối với người yêu của bạn để bắt đầu chia sẻ cảm xúc.</Text>

                        <Button fullWidth onClick={() => setStep('create')} size="md" leftSection={<IconHeart size={20} />}>
                            Tạo kết nối mới
                        </Button>
                        <Button fullWidth variant="light" onClick={() => setStep('join')} size="md" leftSection={<IconLink size={20} />}>
                            Nhập mã ghép cặp
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Create Step */}
            {step === 'create' && (
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Button variant="subtle" size="xs" mb="md" leftSection={<IconArrowLeft size={16} />} onClick={() => setStep('welcome')} style={{ marginLeft: -10 }}>
                        Quay lại
                    </Button>
                    <Stack align="center">
                        <ThemeIcon size={60} radius="xl" color="primary" variant="light">
                            <IconHeart size={30} />
                        </ThemeIcon>
                        <Title order={2} ta="center">Tạo kết nối mới</Title>
                        <Text c="dimmed" ta="center">Bạn sẽ nhận được mã ghép để chia sẻ với người yêu</Text>

                        {error && <Text c="red" size="sm" ta="center">{error}</Text>}

                        <Button fullWidth onClick={handleCreatePair} loading={loading} size="md">
                            Tạo mã ghép cặp
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Join Step */}
            {step === 'join' && (
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Button variant="subtle" size="xs" mb="md" leftSection={<IconArrowLeft size={16} />} onClick={() => setStep('welcome')} style={{ marginLeft: -10 }}>
                        Quay lại
                    </Button>
                    <Stack align="center">
                        <ThemeIcon size={60} radius="xl" color="blue">
                            <IconLink size={30} />
                        </ThemeIcon>
                        <Title order={2} ta="center">Nhập mã ghép cặp</Title>
                        <Text c="dimmed" ta="center">Nhập mã 6 ký tự từ người yêu của bạn</Text>

                        <PinInput
                            length={6}
                            type="alphanumeric"
                            value={pairCode}
                            onChange={(val) => setPairCode(val.toUpperCase())}
                            size="md"
                            placeholder="○"
                        />

                        {error && <Text c="red" size="sm" ta="center">{error}</Text>}

                        <Button fullWidth onClick={handleJoinPair} loading={loading} size="md" disabled={pairCode.length !== 6}>
                            Ghép cặp
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Waiting Step */}
            {step === 'waiting' && (
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Stack align="center">
                        <ThemeIcon size={60} radius="xl" color="yellow">
                            <IconHourglass size={30} />
                        </ThemeIcon>
                        <Title order={2} ta="center">Mã ghép cặp của bạn</Title>
                        <Text c="dimmed" ta="center">Chia sẻ mã này với người yêu của bạn</Text>

                        <Group gap="xs">
                            <Title order={1} style={{ letterSpacing: 4 }}>{generatedCode}</Title>
                            <CopyButton value={generatedCode} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Tooltip label={copied ? 'Đã sao chép' : 'Sao chép'} withArrow position="right">
                                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                        </Group>

                        <Stack gap="xs" w="100%">
                            <Text size="sm" ta="center" c="dimmed">Đang chờ người yêu của bạn nhập mã...</Text>
                            <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={checkPairStatus} loading={loading}>
                                Kiểm tra kết nối
                            </Button>
                        </Stack>

                        <Button variant="subtle" onClick={handleContinue} size="sm">
                            Tiếp tục vào ứng dụng (tôi sẽ kiểm tra sau)
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Success Step */}
            {step === 'success' && (
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Stack align="center">
                        <ThemeIcon size={80} radius="xl" color="teal">
                            <IconCheck size={40} />
                        </ThemeIcon>
                        <Title order={2} ta="center">Kết nối thành công!</Title>
                        <Text ta="center" size="lg">Bạn đã ghép cặp với <Text span fw={700} c="primary">{partnerName}</Text></Text>

                        <Button fullWidth onClick={handleContinue} size="md" mt="md" leftSection={<IconHeart size={20} />}>
                            Bắt đầu chia sẻ cảm xúc
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Container>
    );
}
