import { useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Ruler,
  Settings as SettingsIcon,
  ShieldCheck,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminPanel';
import { canAccessAdminShell } from '@/lib/adminAccess';

interface DashboardHeaderProps {
  onSignOut: () => void;
  onNewTransaction: () => void;
}

const DashboardHeader = ({ onSignOut, onNewTransaction }: DashboardHeaderProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const canCheckAdmin = canAccessAdminShell(user?.email);
  const adminStatus = useAdminStatus(canCheckAdmin);

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

      onNewTransaction();
    }, 300);
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Painel do mês',
      onClick: () => {
        setSheetOpen(false);
        goToMonthPanel();
      },
    },
    { icon: PlusCircle, label: 'Nova Movimentação', onClick: handleNewTransaction },
    { icon: Ruler, label: 'Régua de Gastos', onClick: () => scrollToElement('ideal-section') },
    {
      icon: SettingsIcon,
      label: 'Configurações',
      onClick: () => {
        setSheetOpen(false);
        navigate('/settings');
      },
    },
  ];

  const adminMenuItem = canCheckAdmin || adminStatus.data?.isAdmin
    ? {
        icon: ShieldCheck,
        label: 'Painel Admin',
        onClick: () => {
          setSheetOpen(false);
          navigate('/admin');
        },
      }
    : null;

  return (
    <header className="sticky top-0 z-20 overflow-x-hidden border-b border-slate-200/70 bg-[rgba(255,255,255,0.9)] px-3.5 py-3.5 backdrop-blur-xl min-[380px]:px-4 dark:border-[#263731] dark:bg-[linear-gradient(180deg,rgba(11,18,16,0.95),rgba(17,26,23,0.9))]">
      <div className="mx-auto grid min-w-0 max-w-[100vw] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2.5 sm:max-w-lg min-[380px]:gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={goToMonthPanel}
            className="min-w-0 text-left"
            aria-label="Voltar ao painel do mês"
          >
            <span className="block truncate text-[1.3rem] font-bold tracking-[-0.03em] text-foreground min-[380px]:text-[1.45rem]">elefin</span>
          </button>
        </div>

        <ThemeToggle compact />

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menu principal"
              className="h-9 w-9 rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.06)] hover:bg-slate-50 hover:text-slate-700 min-[380px]:h-10 min-[380px]:w-10 dark:border-[#314740] dark:bg-[#16211D] dark:text-[#B8CBC3] dark:shadow-[0_12px_24px_rgba(3,10,8,0.26)] dark:hover:bg-[#1B2823] dark:hover:text-[#E6F2EE]"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[72vw] max-w-[248px] overflow-y-auto border-l border-slate-200/80 bg-[rgba(255,255,255,0.96)] px-0 backdrop-blur-xl dark:border-[#263731] dark:bg-[linear-gradient(180deg,rgba(11,18,16,0.98),rgba(17,26,23,0.98))]"
          >
            <SheetHeader className="border-b border-slate-200/70 px-5 pb-5 pt-5 text-left dark:border-[#263731]">
              <SheetTitle className="text-left text-lg font-semibold tracking-[-0.02em] text-foreground">elefin</SheetTitle>
            </SheetHeader>

            <nav className="mt-4 flex flex-col gap-1 px-2.5">
              {[...menuItems, ...(adminMenuItem ? [adminMenuItem] : [])].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex w-full min-w-0 items-center gap-2.5 rounded-2xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-100/90 dark:hover:bg-[#1B2823]"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-[#1F2D28] dark:text-[#B8CBC3]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                </button>
              ))}

              <div className="my-3 h-px bg-slate-200 dark:bg-[#263731]" />

              <button
                onClick={() => {
                  setSheetOpen(false);
                  onSignOut();
                }}
                className="flex w-full min-w-0 items-center gap-2.5 rounded-2xl px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-destructive dark:bg-rose-950/40">
                  <LogOut className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-left">Sair</span>
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default DashboardHeader;
