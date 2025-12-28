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
    IconRotate,
} from '@tabler/icons-react';
import Cropper from 'react-easy-crop';
import { Slider } from '@mantine/core';
import getCroppedImg from '../../utils/cropImage';
import storage from '../../services/storage';
import { userApi } from '../../services/api';

import { App as CapacitorApp } from '@capacitor/app';
import fcmService from '../../services/fcm';

export default function Profile() {
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);
    const [cropModalOpened, { open: openCropModal, close: closeCropModal }] = useDisclosure(false);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [notiEnabled, setNotiEnabled] = useState(false);
    const resetRef = useRef<() => void>(null);

    // Crop state
    const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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
        checkNotiStatus();

        // Check permission on app resume (coming back from settings)
        const listener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                checkNotiStatus();
            }
        });

        return () => {
            listener.then(remove => remove.remove());
        };
    }, []);

    const checkNotiStatus = async () => {
        const prefEnabled = storage.getNotificationEnabled();
        const perms = await fcmService.checkPermissions();

        // If system permission is denied, switch must be off regardless of preference
        if (perms.receive === 'denied') {
            setNotiEnabled(false);
        } else {
            // If granted or prompt, respect user preference
            // But if prompt, it means we probably haven't enabled it effectively yet if pref was true?
            // Actually if status is prompt, we haven't asked.
            // If pref is true, we expect it to be enabled.
            // But let's just sync with pref for now, as init() handles the prompt logic.
            setNotiEnabled(prefEnabled);
        }
    };

    const handleNotiToggle = async (checked: boolean) => {
        if (checked) {
            const success = await fcmService.enableNotifications();
            if (success) {
                setNotiEnabled(true);
            } else {
                setNotiEnabled(false);
                const perms = await fcmService.checkPermissions();
                if (perms.receive === 'denied') {
                    notifications.show({
                        title: 'Cần cấp quyền',
                        message: 'Vui lòng bật thông báo cho ứng dụng trong Cài đặt',
                        color: 'orange',
                    });
                }
            }
        } else {
            await fcmService.disableNotifications();
            setNotiEnabled(false);
        }
    };

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

        const objectUrl = URL.createObjectURL(file);
        setTempImgSrc(objectUrl);
        setZoom(1);
        setRotation(0);
        setCrop({ x: 0, y: 0 });
        openCropModal();

        // Reset input immediately so same file can be selected again if cancelled
        if (resetRef.current) resetRef.current();
    };

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSaveCrop = async () => {
        if (!tempImgSrc || !croppedAreaPixels) return;

        setUploading(true);
        try {
            const croppedBlob = await getCroppedImg(tempImgSrc, croppedAreaPixels, rotation);
            if (!croppedBlob) throw new Error('Không thể crop ảnh');

            // Create a File object from Blob
            const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

            const response = await userApi.uploadAvatar(file);
            const newAvatarUrl = response.data.avatarUrl;
            setAvatarUrl(newAvatarUrl);
            storage.setAvatarUrl(newAvatarUrl);
            notifications.show({
                title: 'Thành công',
                message: 'Đã cập nhật ảnh đại diện',
                color: 'green',
            });
            closeCropModal();
        } catch (error: any) {
            console.error(error);
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Không thể upload ảnh',
                color: 'red',
            });
        } finally {
            setUploading(false);
            // Cleanup URL
            if (tempImgSrc) {
                URL.revokeObjectURL(tempImgSrc);
                setTempImgSrc(null);
            }
        }
    };

    const handleCancelCrop = () => {
        closeCropModal();
        if (tempImgSrc) {
            URL.revokeObjectURL(tempImgSrc);
            setTempImgSrc(null);
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
                            <Switch
                                checked={notiEnabled}
                                onChange={(e) => handleNotiToggle(e.currentTarget.checked)}
                                onLabel="ON"
                                offLabel="OFF"
                                color="primary"
                            />
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

            <Modal
                opened={cropModalOpened}
                onClose={handleCancelCrop}
                title="Chỉnh sửa ảnh đại diện"
                size="lg"
                centered
            >
                <Stack>
                    <Box h={400} pos="relative">
                        {tempImgSrc && (
                            <Cropper
                                image={tempImgSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                cropShape="round"
                                showGrid={false}
                            />
                        )}
                    </Box>

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Thu phóng</Text>
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={setZoom}
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Xoay</Text>
                        <Slider
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            onChange={setRotation}
                        />
                    </Stack>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={handleCancelCrop} disabled={uploading}>
                            Huỷ
                        </Button>
                        <Button onClick={handleSaveCrop} loading={uploading}>
                            Lưu ảnh
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack >
    );
}
