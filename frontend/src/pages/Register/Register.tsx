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
    Anchor,
    Stack,
    Center
} from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';
import { authApi } from '../../services/api';
import storage from '../../services/storage';

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Vui lòng nhập username');
            return;
        }
        if (username.length < 3) {
            setError('Username phải có ít nhất 3 ký tự');
            return;
        }
        if (!name.trim()) {
            setError('Vui lòng nhập tên hiển thị');
            return;
        }
        if (pin.length !== 6) {
            setError('PIN phải có đúng 6 số');
            return;
        }
        if (pin !== confirmPin) {
            setError('PIN xác nhận không khớp');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authApi.register(username.trim(), name.trim(), pin);
            const data = response.data;

            storage.setToken(data.token);
            storage.setUserId(data.userId);
            storage.setUserName(data.name);
            storage.setUsername(data.username);

            navigate('/onboarding');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Center mb={20}>
                <IconHeart size={50} color="var(--mantine-color-pink-6)" style={{ fill: 'var(--mantine-color-pink-2)' }} />
            </Center>

            <Title ta="center" className="font-sans" fw={900}>
                Đăng ký tài khoản
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Tạo tài khoản mới để bắt đầu 💑
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleRegister}>
                    <Stack>
                        <TextInput
                            label="Username"
                            placeholder="Tên đăng nhập (3-20 ký tự)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            maxLength={20}
                            required
                            autoComplete="username"
                        />

                        <TextInput
                            label="Tên hiển thị"
                            placeholder="Tên sẽ hiển thị cho người yêu"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            required
                            autoComplete="name"
                        />

                        <PasswordInput
                            label="PIN (6 số)"
                            placeholder="••••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            maxLength={6}
                            required
                            inputMode="numeric"
                            autoComplete="new-password"
                        />

                        <PasswordInput
                            label="Xác nhận PIN"
                            placeholder="••••••"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            maxLength={6}
                            required
                            inputMode="numeric"
                            autoComplete="new-password"
                        />

                        {error && (
                            <Text c="red" size="sm" ta="center">
                                {error}
                            </Text>
                        )}

                        <Button fullWidth mt="xl" type="submit" loading={loading}>
                            Tạo tài khoản
                        </Button>
                    </Stack>
                </form>
            </Paper>

            <Text ta="center" mt="md">
                Đã có tài khoản?{' '}
                <Anchor component={Link} to="/login" fw={700}>
                    Đăng nhập
                </Anchor>
            </Text>
        </Container>
    );
}
