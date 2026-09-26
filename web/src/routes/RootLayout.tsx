import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from '../shared/components/Header';

export function RootLayout() {
  return (
    <>
      <Header />
      <main className="container main">
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  );
}
