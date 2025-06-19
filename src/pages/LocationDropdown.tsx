import type { ChangeEvent } from 'react';

interface LocationDropdownProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
}

export default function LocationDropdown({ currentLocation, onLocationChange }: LocationDropdownProps) {
  const locations = ['NTM', 'Ogle', 'NSC', 'NDT', 'NBD', 'STC'];

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onLocationChange(e.target.value);
  };

  return (
    <div>
      <select 
        value={currentLocation} 
        onChange={handleChange}
        style={{
          padding: '5px',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}
      >
        {locations.map(location => (
          <option key={location} value={location}>{location}</option>
        ))}
      </select>
    </div>
  );
}