import { LoginForm } from '../features/auth/components/LoginForm/LoginForm';
import { Header } from '../shared/components/Header/Header';

export default function Home() {
    return (
        <>
            <Header />
            <main>
              <LoginForm/>
            </main>
        </>
    );
}
  