import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FABProps {
  onClick: () => void;
}

const FAB = ({ onClick }: FABProps) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-lg justify-end">
        <Button
          onClick={onClick}
          className="pointer-events-auto h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default FAB;
