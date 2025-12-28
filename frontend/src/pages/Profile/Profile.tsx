import { useNavigate } from 'react-router-dom';
import {
    AppShell,
    Container,
    Title,
    Text,
    Button,
    Group,
    Stack,
    Avatar,
    ActionIcon,
    SimpleGrid,
    Paper,
    Switch,
    ThemeIcon,
    Divider,
    Modal
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconCalendar,
    IconUser,
    IconMoodSmile,
    IconArrowLeft,
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
        <AppShell
            header={{ height: 60 }}
            footer={{ height: 70 }}
            padding="md"
        >
            <AppShell.Header>
                <Container size="md" h="100%" px="md">
                    <Group h="100%" justify="space-between">
                        <Group>
                            <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/home')}>
                                <IconArrowLeft size={20} />
                            </ActionIcon>
                            <Title order={4}>Cài đặt</Title>
                        </Group>
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main pb={80}>
                <Container size="sm">
                    <Stack gap="xl">
                        {/* Profile Info */}
                        <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-dark-6)">
                            <Stack align="center" gap="xs">
                                <Avatar size={100} radius={100} color="pink" variant="filled">
                                    <IconUser size={50} />
                                </Avatar>
                                <Title order={2}>{userName}</Title>
                                {partnerName ? (
                                    <Group gap={6}>
                                        <IconHeart size={16} color="var(--mantine-color-pink-5)" style={{ fill: 'var(--mantine-color-pink-5)' }} />
                                        <Text c="pink.4" fw={500}>Đang kết nối với {partnerName}</Text>
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
                                            <ThemeIcon variant="light" color="pink"><IconKey size={18} /></ThemeIcon>
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
                                        <Switch defaultChecked onLabel="ON" offLabel="OFF" color="pink" />
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
                    </Stack>
                </Container>

                <Modal opened={opened} onClose={close} title="Xác nhận" centered>
                    <Text size="sm">Bạn có chắc chắn muốn đăng xuất?</Text>
                    <Group justify="flex-end" mt="xl">
                        <Button variant="default" onClick={close}>Huỷ</Button>
                        <Button color="red" onClick={handleLogout}>Đăng xuất</Button>
                    </Group>
                </Modal>
            </AppShell.Main>

            <AppShell.Footer p="md" style={{ zIndex: 200, display: 'flex' }}>
                <Container size="md" w="100%" h="100%">
                    <SimpleGrid cols={3} h="100%">
                        <Button
                            variant="subtle"
                            h="100%"
                            color="gray"
                            onClick={() => navigate('/home')}
                        >
                            <Stack gap={0} align="center">
                                <IconMoodSmile size={24} />
                                <Text size="xs">Cảm xúc</Text>
                            </Stack>
                        </Button>
                        <Button
                            variant="subtle"
                            h="100%"
                            color="gray"
                            onClick={() => navigate('/calendar')}
                        >
                            <Stack gap={0} align="center">
                                <IconCalendar size={24} />
                                <Text size="xs">Lịch sử</Text>
                            </Stack>
                        </Button>
                        <Button
                            variant="subtle"
                            h="100%"
                            color="pink"
                            onClick={() => { }} // Already active
                            className="nav-btn-active"
                        >
                            <Stack gap={0} align="center">
                                <IconUser size={24} />
                                <Text size="xs">Cài đặt</Text>
                            </Stack>
                        </Button>
                    </SimpleGrid>
                </Container>
            </AppShell.Footer>
        </AppShell>
    );
}
