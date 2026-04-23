import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FABProps {
  onClick: () => void;
}

const FAB = ({ onClick }: FABProps) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-lg justify-end">
        <Button
          onClick={onClick}
          className="pointer-events-auto h-12 w-12 rounded-full shadow-[0_12px_28px_rgba(92,134,109,0.22)] min-[380px]:h-14 min-[380px]:w-14"
          size="icon"
        >
          <Plus className="h-5 w-5 min-[380px]:h-6 min-[380px]:w-6" />
        </Button>
      </div>
    </div>
  );
};

export default FAB;
