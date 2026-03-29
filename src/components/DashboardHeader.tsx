import { useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Ruler,
  Settings as SettingsIcon,
  WalletCards,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface DashboardHeaderProps {
  onSignOut: () => void;
  onNewTransaction?: () => void;
  title?: string;
}

const DashboardHeader = ({ onSignOut, onNewTransaction, title }: DashboardHeaderProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const headerTitle =
    title ??
    (location.pathname === '/projection'
      ? 'Projecao de Gastos'
      : location.pathname === '/settings'
        ? 'Configuracoes'
        : 'Painel do mes');

  const goToMonthPanel = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate('/');
  };

  const scrollToElement = (id: string) => {
    setSheetOpen(false);

    setTimeout(() => {
      if (location.pathname !== '/') {
        navigate('/');
      }

      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, location.pathname === '/' ? 300 : 500);
  };

  const handleNewTransaction = () => {
    setSheetOpen(false);

    setTimeout(() => {
      if (location.pathname !== '/') {
        navigate('/');
        return;
      }

      onNewTransaction?.();
    }, 300);
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Painel do mes',
      onClick: () => {
        setSheetOpen(false);
        goToMonthPanel();
      },
    },
    { icon: PlusCircle, label: 'Nova Movimentacao', onClick: handleNewTransaction },
    {
      icon: WalletCards,
      label: 'Projecao de Gastos',
      onClick: () => {
        setSheetOpen(false);
        navigate('/projection');
      },
    },
    { icon: Ruler, label: 'Regua de Gastos', onClick: () => scrollToElement('ideal-section') },
    {
      icon: SettingsIcon,
      label: 'Configuracoes',
      onClick: () => {
        setSheetOpen(false);
        navigate('/settings');
      },
    },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[rgba(255,255,255,0.9)] px-4 py-4 backdrop-blur-xl dark:border-[#263731] dark:bg-[linear-gradient(180deg,rgba(11,18,16,0.95),rgba(17,26,23,0.9))]">
      <div className="mx-auto grid max-w-lg grid-cols-[1fr_auto_auto] items-center gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={goToMonthPanel}
            className="min-w-0 text-left"
            aria-label="Voltar ao painel do mes"
          >
            <span className="block text-[1.02rem] font-semibold tracking-[-0.02em] text-foreground">elefin</span>
          </button>

          <div className="mt-1 truncate text-[1rem] font-semibold tracking-[-0.02em] text-slate-700 dark:text-[#E6F2EE]">
            {headerTitle}
          </div>
        </div>

        <ThemeToggle compact />

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menu principal"
              className="h-10 w-10 rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.06)] hover:bg-slate-50 hover:text-slate-700 dark:border-[#314740] dark:bg-[#16211D] dark:text-[#B8CBC3] dark:shadow-[0_12px_24px_rgba(3,10,8,0.26)] dark:hover:bg-[#1B2823] dark:hover:text-[#E6F2EE]"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-80 border-l border-slate-200/80 bg-[rgba(255,255,255,0.96)] px-0 backdrop-blur-xl dark:border-[#263731] dark:bg-[linear-gradient(180deg,rgba(11,18,16,0.98),rgba(17,26,23,0.98))]"
          >
            <SheetHeader className="border-b border-slate-200/70 px-5 pb-5 pt-5 text-left dark:border-[#263731]">
              <SheetTitle className="text-left text-lg font-semibold tracking-[-0.02em] text-foreground">elefin</SheetTitle>
            </SheetHeader>

            <nav className="mt-4 flex flex-col gap-1 px-3">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-100/90 dark:hover:bg-[#1B2823]"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-[#1F2D28] dark:text-[#B8CBC3]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </button>
              ))}

              <div className="my-3 h-px bg-slate-200 dark:bg-[#263731]" />

              <button
                onClick={() => {
                  setSheetOpen(false);
                  onSignOut();
                }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-destructive dark:bg-rose-950/40">
                  <LogOut className="h-4 w-4" />
                </span>
                Sair
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default DashboardHeader;
