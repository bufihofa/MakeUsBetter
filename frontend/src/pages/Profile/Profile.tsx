import { useNavigate } from 'react-router-dom';
import {
    Container,
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
    Modal
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconUser,
    IconHeart,
    IconLogout,
    IconBell,
    IconInfoCircle,
    IconKey
} from '@tabler/icons-react';
import storage from '../../services/storage';

export default function Profile() {
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);

    const userName = storage.getUserName() || 'Bạn';
    const partnerName = storage.getPartnerName();
    const pairCode = storage.getPairCode();

    const handleLogout = () => {
        storage.clear();
        navigate('/');
    };

    return (
        <Stack gap="xl">
            {/* Profile Info */}
            <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-white)">
                <Stack align="center" gap="xs">
                    <Avatar size={100} radius={100} color="primary" variant="filled">
                        <IconUser size={50} />
                    </Avatar>
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
                            <Text size="sm" c="dimmed">1.0.0</Text>
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
