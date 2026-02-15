import { useState } from 'react';
import { Menu, LogOut, LayoutDashboard, PlusCircle, Ruler, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface DashboardHeaderProps {
  onSignOut: () => void;
  onNewTransaction: () => void;
}

const DashboardHeader = ({ onSignOut, onNewTransaction }: DashboardHeaderProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const scrollToAndOpen = (accordionValue: string) => {
    setSheetOpen(false);
    setTimeout(() => {
    const item = document.getElementById(`accordion-${accordionValue}`);
      const trigger = item?.querySelector('button');
      if (trigger) {
        trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const isExpanded = trigger.getAttribute('data-state') === 'open';
        if (!isExpanded) (trigger as HTMLElement).click();
      }
    }, 300);
  };

  const scrollToHelp = () => {
    setSheetOpen(false);
    setTimeout(() => {
      document.getElementById('help-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleNewTransaction = () => {
    setSheetOpen(false);
    setTimeout(() => onNewTransaction(), 300);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel do Mês', onClick: () => { setSheetOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { icon: PlusCircle, label: 'Nova Movimentação', onClick: handleNewTransaction },
    { icon: Ruler, label: 'Régua de Gastos', onClick: () => scrollToAndOpen('ideal') },
    { icon: HelpCircle, label: 'Precisa de Ajuda?', onClick: scrollToHelp },
  ];

  return (
    <header className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🐘</span>
        <span className="text-xl font-bold tracking-tight text-foreground">elefin</span>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-medium text-muted-foreground">Painel do Mês</h1>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="text-xl">🐘</span> elefin
            </SheetTitle>
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
              onClick={() => { setSheetOpen(false); onSignOut(); }}
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
