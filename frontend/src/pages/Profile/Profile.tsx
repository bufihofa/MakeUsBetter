import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Title,
    Text,
    Button,
    Group,
    Stack,
    Avatar,
    Paper,
    Switch,
    ThemeIcon,
    Divider,
    Modal,
    FileButton,
    Loader,
    Overlay,
    Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconUser,
    IconHeart,
    IconLogout,
    IconBell,
    IconInfoCircle,
    IconKey,
    IconCamera,
} from '@tabler/icons-react';
import storage from '../../services/storage';
import { userApi } from '../../services/api';

export default function Profile() {
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const resetRef = useRef<() => void>(null);

    const userName = storage.getUserName() || 'Bạn';
    const partnerName = storage.getPartnerName();
    const pairCode = storage.getPairCode();

    // Load avatar from storage on mount
    useEffect(() => {
        const storedAvatar = storage.getAvatarUrl();
        if (storedAvatar) {
            setAvatarUrl(storedAvatar);
        }
        // Optionally fetch latest profile from API
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await userApi.getProfile();
            const profile = response.data;
            if (profile.avatarUrl) {
                setAvatarUrl(profile.avatarUrl);
                storage.setAvatarUrl(profile.avatarUrl);
            }
            if (profile.partnerAvatarUrl) {
                storage.setPartnerAvatarUrl(profile.partnerAvatarUrl);
            }
            if (profile.partnerName) {
                storage.setPartnerName(profile.partnerName);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handleAvatarSelect = async (file: File | null) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            notifications.show({
                title: 'Lỗi',
                message: 'Chỉ chấp nhận file JPEG, PNG hoặc WebP',
                color: 'red',
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            notifications.show({
                title: 'Lỗi',
                message: 'File quá lớn, tối đa 5MB',
                color: 'red',
            });
            return;
        }

        setUploading(true);
        try {
            const response = await userApi.uploadAvatar(file);
            const newAvatarUrl = response.data.avatarUrl;
            setAvatarUrl(newAvatarUrl);
            storage.setAvatarUrl(newAvatarUrl);
            notifications.show({
                title: 'Thành công',
                message: 'Đã cập nhật ảnh đại diện',
                color: 'green',
            });
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Không thể upload ảnh',
                color: 'red',
            });
        } finally {
            setUploading(false);
            resetRef.current?.();
        }
    };

    const handleLogout = () => {
        storage.clear();
        navigate('/');
    };

    return (
        <Stack gap="xl">
            {/* Profile Info */}
            <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-white)">
                <Stack align="center" gap="xs">
                    <Box pos="relative">
                        <Avatar
                            size={100}
                            radius={100}
                            color="primary"
                            variant="filled"
                            src={avatarUrl}
                        >
                            <IconUser size={50} />
                        </Avatar>
                        {uploading && (
                            <Overlay color="#000" backgroundOpacity={0.5} radius={100}>
                                <Group justify="center" align="center" h="100%">
                                    <Loader color="white" size="sm" />
                                </Group>
                            </Overlay>
                        )}
                        <FileButton
                            resetRef={resetRef}
                            onChange={handleAvatarSelect}
                            accept="image/png,image/jpeg,image/webp"
                        >
                            {(props) => (
                                <Button
                                    {...props}
                                    size="xs"
                                    radius="xl"
                                    variant="filled"
                                    color="gray"
                                    pos="absolute"
                                    bottom={0}
                                    right={0}
                                    p={6}
                                    disabled={uploading}
                                    style={{ minWidth: 'auto' }}
                                >
                                    <IconCamera size={16} />
                                </Button>
                            )}
                        </FileButton>
                    </Box>
                    <Title order={2}>{userName}</Title>
                    {partnerName ? (
                        <Group gap={6}>
                            <IconHeart size={16} color="var(--mantine-color-primary-5)" style={{ fill: 'var(--mantine-color-primary-5)' }} />
                            <Text c="primary.6" fw={500}>Đang kết nối với {partnerName}</Text>
                        </Group>
                    ) : (
                        <Text c="dimmed">Chưa ghép cặp</Text>
                    )}
                </Stack>
            </Paper>

            {/* Connection Info */}
            <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed" tt="uppercase" px="xs">Thông tin kết nối</Text>
                <Paper withBorder radius="md">
                    <Stack gap={0}>
                        <Group p="md" justify="space-between">
                            <Group gap="sm">
                                <ThemeIcon variant="light" color="primary"><IconKey size={18} /></ThemeIcon>
                                <Text size="sm">Mã ghép cặp</Text>
                            </Group>
                            <Text fw={500}>{pairCode || 'Chưa có'}</Text>
                        </Group>
                        <Divider />
                        <Group p="md" justify="space-between">
                            <Group gap="sm">
                                <ThemeIcon variant="light" color="red"><IconHeart size={18} /></ThemeIcon>
                                <Text size="sm">Người yêu</Text>
                            </Group>
                            <Text fw={500}>{partnerName || 'Chưa ghép cặp'}</Text>
                        </Group>
                    </Stack>
                </Paper>
            </Stack>

            {/* App Settings */}
            <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed" tt="uppercase" px="xs">Ứng dụng</Text>
                <Paper withBorder radius="md">
                    <Stack gap={0}>
                        <Group p="md" justify="space-between">
                            <Group gap="sm">
                                <ThemeIcon variant="light" color="blue"><IconInfoCircle size={18} /></ThemeIcon>
                                <Text size="sm">Phiên bản</Text>
                            </Group>
                            <Text size="sm" c="dimmed">1.0.1</Text>
                        </Group>
                        <Divider />
                        <Group p="md" justify="space-between">
                            <Group gap="sm">
                                <ThemeIcon variant="light" color="orange"><IconBell size={18} /></ThemeIcon>
                                <Text size="sm">Thông báo</Text>
                            </Group>
                            <Switch defaultChecked onLabel="ON" offLabel="OFF" color="primary" />
                        </Group>
                    </Stack>
                </Paper>
            </Stack>

            <Button
                variant="light"
                color="red"
                size="md"
                leftSection={<IconLogout size={20} />}
                onClick={open}
            >
                Đăng xuất
            </Button>

            <Modal opened={opened} onClose={close} title="Xác nhận" centered>
                <Text size="sm">Bạn có chắc chắn muốn đăng xuất?</Text>
                <Group justify="flex-end" mt="xl">
                    <Button variant="default" onClick={close}>Huỷ</Button>
                    <Button color="red" onClick={handleLogout}>Đăng xuất</Button>
                </Group>
            </Modal>
        </Stack>
    );
}
