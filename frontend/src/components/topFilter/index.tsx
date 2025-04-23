'use client';

import { useState } from 'react';
import {
  Search,
  Menu,
  List,
  Grid,
  Columns,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FilterComponent() {
  const [viewMode, setViewMode] = useState<
    'list' | 'grid' | 'columns' | 'large-grid'
  >('grid');
  const [sortOption, setSortOption] = useState('Price low to high');

  const totalResults = 9819;

  return (
    <div className="w-full px-6 bg-black">
      <div className="flex flex-col sm:flex-row items-center gap-3 py-4">
        <div className="flex items-center gap-2 sm:w-auto w-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="font-medium">Live</span>
          </div>
          <span className="text-gray-500 ml-2">
            {totalResults.toLocaleString()} results
          </span>
        </div>

        <div className="relative flex-1 sm:mx-2 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10 bg-gray-50 border-gray-200"
            placeholder="Search by name or trait"
          />
        </div>

        <div className="flex items-center gap-2 sm:w-auto w-full justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-between"
              >
                {sortOption}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setSortOption('Price low to high')}
              >
                Price low to high
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption('Price high to low')}
              >
                Price high to low
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption('Recently listed')}
              >
                Recently listed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption('Recently created')}
              >
                Recently created
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none ${viewMode === 'grid' ? '' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none ${viewMode === 'columns' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('columns')}
            >
              <Columns className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none ${viewMode === 'large-grid' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('large-grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
