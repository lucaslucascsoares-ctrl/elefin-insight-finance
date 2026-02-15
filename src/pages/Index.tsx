import { useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import DashboardHeader from '@/components/DashboardHeader';
import HeroSummary from '@/components/HeroSummary';
import SpendingAccordion from '@/components/SpendingAccordion';
import IdealComparison from '@/components/IdealComparison';
import InsightsAccordion from '@/components/InsightsAccordion';
import NewTransactionModal from '@/components/NewTransactionModal';
import FAB from '@/components/FAB';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/pages/Auth';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-2xl">🐘</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const isLoading = txLoading || catLoading;

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      <DashboardHeader onSignOut={signOut} />

      {isLoading ? (
        <div className="px-4 space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : (
        <>
          <HeroSummary transactions={transactions} />

          <Accordion type="multiple" defaultValue={['spending']} className="mt-2">
            <SpendingAccordion transactions={transactions} categories={categories} />
            <IdealComparison transactions={transactions} categories={categories} />
            <InsightsAccordion transactions={transactions} categories={categories} />
          </Accordion>
        </>
      )}

      <FAB onClick={() => setModalOpen(true)} />
      <NewTransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
      />
    </div>
  );
};

export default Index;
