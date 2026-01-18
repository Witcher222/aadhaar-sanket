import { useState } from 'react';
import { Search, MapPin, Users, TrendingUp, FileText, ArrowRight } from 'lucide-react';
import { DetailDialog, InfoItem } from './DetailDialog';
import { useNavigate } from 'react-router-dom';

interface SearchResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
}

const mockSearchResults = [
  {
    id: 1,
    type: 'district',
    title: 'Mumbai Suburban',
    description: 'Maharashtra - High migration zone',
    stats: { population: '11.2M', growth: '+4.2%' },
    route: '/stress-map',
  },
  {
    id: 2,
    type: 'metric',
    title: 'Migration Velocity Index',
    description: 'Current value: High (8.2)',
    stats: { trend: 'Increasing', updated: 'Just now' },
    route: '/trends',
  },
  {
    id: 3,
    type: 'state',
    title: 'Karnataka',
    description: 'Top destination for tech sector migration',
    stats: { inflow: '892K', sectors: 'IT, Services' },
    route: '/migration',
  },
  {
    id: 4,
    type: 'report',
    title: 'Q4 2025 Migration Report',
    description: 'Comprehensive analysis of interstate movement',
    stats: { pages: '48', date: 'Dec 2025' },
    route: '/data-quality',
  },
];

export const SearchResultsDialog = ({ open, onOpenChange, searchQuery }: SearchResultsDialogProps) => {
  const navigate = useNavigate();

  const filteredResults = searchQuery.length > 0
    ? mockSearchResults.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockSearchResults;

  const handleResultClick = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'district':
        return <MapPin className="w-4 h-4 text-primary" />;
      case 'metric':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'state':
        return <Users className="w-4 h-4 text-info" />;
      case 'report':
        return <FileText className="w-4 h-4 text-warning" />;
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Results"
      description={`Found ${filteredResults.length} results${searchQuery ? ` for "${searchQuery}"` : ''}`}
      icon={<Search className="w-5 h-5 text-primary" />}
    >
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredResults.map((result) => (
          <button
            key={result.id}
            onClick={() => handleResultClick(result.route)}
            className="w-full p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-card">{getTypeIcon(result.type)}</div>
                <div>
                  <p className="font-medium text-foreground">{result.title}</p>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {Object.entries(result.stats).map(([key, value]) => (
                      <span key={key} className="text-xs text-muted-foreground">
                        <span className="capitalize">{key}:</span>{' '}
                        <span className="font-medium text-foreground">{value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </DetailDialog>
  );
};
