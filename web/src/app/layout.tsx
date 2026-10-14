import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GastoCerto IA — Agente Pessoal de Gestão Financeira',
  description: 'Controle financeiro inteligente com Agente Conversacional Gemini e Tabela de Gastos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
