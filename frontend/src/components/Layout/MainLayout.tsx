import { AppShell, Container, Group, Text, Button, Stack, ActionIcon, Avatar, Transition } from '@mantine/core';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { IconMoodSmile, IconCalendar, IconUser, IconSettings } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import storage from '../../services/storage';
import fcmService from '../../services/fcm';

export function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('home');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const path = location.pathname;
        if (path.includes('home')) setActiveTab('home');
        else if (path.includes('calendar')) setActiveTab('calendar');
        else if (path.includes('profile')) setActiveTab('profile');

        // Initialize FCM logic (check permissions matches user pref)
        fcmService.init();
    }, [location]);

    return (
        <AppShell
            header={{ height: 60 }}
            footer={{ height: 80 }} // Increased footer height for better touch targets
            padding="0" // We'll handle padding in the content container
            style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
            }}
        >
            <AppShell.Header bg="white" withBorder={false} style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                <Container size="md" h="100%" px="md">
                    <Group h="100%" justify="space-between">
                        <Group>
                            <Avatar
                                color="primary"
                                radius="xl"
                                variant="light"
                                src={storage.getAvatarUrl()}
                            >
                                {(storage.getUserName() || 'B').charAt(0).toUpperCase()}
                            </Avatar>
                            <Stack gap={0}>
                                <Text size="sm" fw={700} c="dark.8">{storage.getUserName() || 'Bạn'}</Text>
                                <Text size="xs" c="dimmed">MakeUsBetter</Text>
                            </Stack>
                        </Group>
                        {/* Optional: Add header actions here if needed */}
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main>
                {/* Simple Fade Transition */}
                <div
                    key={location.pathname}
                    style={{
                        animation: 'fadeIn 0.3s ease-in-out',
                        minHeight: 'calc(100vh - 140px)', // Account for header/footer
                        paddingTop: 'var(--mantine-spacing-md)',
                        paddingBottom: 'var(--mantine-spacing-xl)',
                    }}
                >
                    <Container size="sm" px="md">
                        <Outlet />
                    </Container>
                </div>
            </AppShell.Main>

            <AppShell.Footer bg="white" withBorder={false} style={{
                borderTop: '1px solid var(--mantine-color-gray-2)',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
            }}>
                <Container size="md" h="100%" px="xs">
                    <Group h="100%" justify="space-around" align="center">
                        <NavButton
                            icon={IconMoodSmile}
                            label="Cảm xúc"
                            active={activeTab === 'home'}
                            onClick={() => navigate('/home')}
                        />
                        <NavButton
                            icon={IconCalendar}
                            label="Lịch sử"
                            active={activeTab === 'calendar'}
                            onClick={() => navigate('/calendar')}
                        />
                        <NavButton
                            icon={IconUser}
                            label="Cài đặt"
                            active={activeTab === 'profile'}
                            onClick={() => navigate('/profile')}
                        />
                    </Group>
                </Container>
            </AppShell.Footer>
        </AppShell>
    );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <Button
            variant="subtle"
            color={active ? 'primary' : 'gray'}
            onClick={onClick}
            h="100%"
            py="xs"
            style={{
                flex: 1,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                backgroundColor: active ? 'var(--mantine-color-primary-0)' : 'transparent',
            }}
        >
            <Stack gap={4} align="center">
                <Icon size={24} stroke={active ? 2.5 : 1.5} />
                <Text size="xs" fw={active ? 600 : 500}>{label}</Text>
            </Stack>
        </Button>
    )
}

// Add global style for fade in if not present (although we can just use inline styles or existing global css)
// We will rely on inline style animation name, but ensure keyframes exist in global css or index.css
