import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    TextInput,
    PasswordInput,
    Button,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Anchor,
    Stack,
    Center
} from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';
import { authApi } from '../../services/api';
import storage from '../../services/storage';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Vui lòng nhập username');
            return;
        }
        if (pin.length !== 6) {
            setError('PIN phải có 6 số');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authApi.login(username.trim(), pin);
            const data = response.data;

            storage.setToken(data.token);
            storage.setUserId(data.userId);
            storage.setUserName(data.name);
            storage.setUsername(data.username);

            // Redirect based on pairing status
            if (data.isPaired) {
                navigate('/home');
            } else {
                navigate('/onboarding');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Center mb={20}>
                <IconHeart size={50} color="var(--mantine-color-primary-6)" style={{ fill: 'var(--mantine-color-primary-1)' }} />
            </Center>

            <Title ta="center" fw={900} style={{ letterSpacing: '-0.5px' }}>
                MakeUsBetter
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Chào mừng bạn quay lại 💑
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleLogin}>
                    <Stack>
                        <TextInput
                            label="Username"
                            placeholder="Nhập username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            required
                            autoComplete="username"
                        />

                        <PasswordInput
                            label="PIN"
                            placeholder="••••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            maxLength={6}
                            required
                            inputMode="numeric"
                            autoComplete="current-password"
                        />

                        {error && (
                            <Text c="red" size="sm" ta="center">
                                {error}
                            </Text>
                        )}

                        <Button fullWidth mt="xl" type="submit" loading={loading}>
                            Đăng nhập
                        </Button>
                    </Stack>
                </form>
            </Paper>

            <Text ta="center" mt="md">
                Chưa có tài khoản?{' '}
                <Anchor component={Link} to="/register" fw={700}>
                    Đăng ký ngay
                </Anchor>
            </Text>
        </Container>
    );
}
