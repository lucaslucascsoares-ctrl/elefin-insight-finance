import { useState } from 'react';
import { Menu, LogOut, LayoutDashboard, PlusCircle, Ruler, HelpCircle, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLocation, useNavigate } from 'react-router-dom';

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
    (location.pathname === '/projection' ? 'Projeção de Gastos' : 'Painel do Mês');

  const scrollToElement = (id: string) => {
    setSheetOpen(false);
    setTimeout(() => {
      if (location.pathname !== '/') {
        navigate('/');
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, location.pathname === '/' ? 300 : 500);
  };

  const scrollToHelp = () => {
    setSheetOpen(false);
    setTimeout(() => {
      if (location.pathname !== '/') {
        navigate('/');
      }
      document.getElementById('help-section')?.scrollIntoView({ behavior: 'smooth' });
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
      label: 'Painel do Mês',
      onClick: () => {
        setSheetOpen(false);
        if (location.pathname === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        navigate('/');
      },
    },
    { icon: PlusCircle, label: 'Nova Movimentação', onClick: handleNewTransaction },
    {
      icon: WalletCards,
      label: 'Projeção de Gastos',
      onClick: () => {
        setSheetOpen(false);
        navigate('/projection');
      },
    },
    { icon: Ruler, label: 'Régua de Gastos', onClick: () => scrollToElement('ideal-section') },
    { icon: HelpCircle, label: 'Precisa de Ajuda?', onClick: scrollToHelp },
  ];

  return (
    <header className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-foreground">elefin</span>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-medium text-muted-foreground">{headerTitle}</h1>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>elefin</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </button>
            ))}
            <div className="my-2 h-px bg-border" />
            <button
              onClick={() => {
                setSheetOpen(false);
                onSignOut();
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default DashboardHeader;
