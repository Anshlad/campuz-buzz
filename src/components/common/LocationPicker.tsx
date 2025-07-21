
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X, Loader2 } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationPickerProps {
  onLocationSelect: (location: Location | null) => void;
  placeholder?: string;
  className?: string;
}

// Mock location data - in a real app, this would come from a geocoding API
const MOCK_LOCATIONS: Location[] = [
  { id: '1', name: 'Main Library', address: 'University Campus, Building A' },
  { id: '2', name: 'Student Center', address: 'University Campus, Building B' },
  { id: '3', name: 'Engineering Building', address: 'University Campus, Building C' },
  { id: '4', name: 'Science Lab', address: 'University Campus, Building D' },
  { id: '5', name: 'Coffee Shop', address: 'Downtown, Main Street 123' },
  { id: '6', name: 'Study Room 1', address: 'Library, Floor 2' },
  { id: '7', name: 'Lecture Hall A', address: 'Academic Building, Floor 1' },
  { id: '8', name: 'Computer Lab', address: 'IT Building, Floor 3' },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  placeholder = "Add location...",
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const filteredLocations = MOCK_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setUseCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // In a real app, you'd reverse geocode these coordinates
        const currentLocation: Location = {
          id: 'current',
          name: 'Current Location',
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          coordinates: { lat: latitude, lng: longitude }
        };

        setSelectedLocation(currentLocation);
        onLocationSelect(currentLocation);
        setIsOpen(false);
        setIsLoading(false);
        setUseCurrentLocation(false);

        toast({
          title: "Location detected",
          description: "Your current location has been added."
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLoading(false);
        setUseCurrentLocation(false);
        
        toast({
          title: "Location access denied",
          description: "Please allow location access or select a location manually.",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
    setSearchTerm('');
    setIsOpen(false);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    onLocationSelect(null);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        {selectedLocation ? (
          <div className="flex items-center justify-between pl-10 pr-8 py-2 bg-muted rounded-md">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedLocation.name}</p>
              <p className="text-sm text-muted-foreground truncate">{selectedLocation.address}</p>
            </div>
            <EnhancedButton
              variant="ghost"
              size="sm"
              onClick={clearLocation}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </EnhancedButton>
          </div>
        ) : (
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pl-10"
          />
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && !selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-1 left-0 right-0 z-50"
          >
            <EnhancedCard className="max-h-64 overflow-hidden p-0">
              {/* Current Location Option */}
              <div className="p-2 border-b">
                <EnhancedButton
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={getCurrentLocation}
                  disabled={isLoading || useCurrentLocation}
                >
                  {isLoading || useCurrentLocation ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  {useCurrentLocation ? 'Getting location...' : 'Use current location'}
                </EnhancedButton>
              </div>

              {/* Search Results */}
              <div className="max-h-48 overflow-y-auto">
                {searchTerm && filteredLocations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No locations found for "{searchTerm}"</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <motion.button
                      key={location.id}
                      whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                      className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{location.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {location.address}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* No search term - show popular locations */}
              {!searchTerm && (
                <div className="max-h-48 overflow-y-auto">
                  <div className="p-2 border-b">
                    <p className="text-sm font-medium text-muted-foreground px-2">Popular locations</p>
                  </div>
                  {MOCK_LOCATIONS.slice(0, 5).map((location) => (
                    <motion.button
                      key={location.id}
                      whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                      className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{location.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {location.address}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </EnhancedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
