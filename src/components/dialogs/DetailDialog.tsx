import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export const DetailDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  icon,
}: DetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0 space-y-3">
          {icon && (
            <div className="p-3 rounded-xl bg-primary/10 w-fit">
              {icon}
            </div>
          )}
          <DialogTitle className="text-xl font-display font-bold text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface InfoItemProps {
  label: string;
  value: string | ReactNode;
  icon?: ReactNode;
}

export const InfoItem = ({ label, value, icon }: InfoItemProps) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

interface ActionButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'destructive';
  children: ReactNode;
}

export const ActionButton = ({ onClick, variant = 'primary', children }: ActionButtonProps) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    success: 'bg-success text-success-foreground hover:bg-success/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${variants[variant]}`}
    >
      {children}
    </button>
  );
};
