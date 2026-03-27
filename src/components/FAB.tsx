import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FABProps {
  onClick: () => void;
}

const FAB = ({ onClick }: FABProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default FAB;
