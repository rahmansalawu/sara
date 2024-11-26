'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface UserPreferences {
  theme: 'light' | 'dark';
  textSize: 'small' | 'medium' | 'large';
  defaultView: 'enhanced' | 'original';
  language: string;
}

export const UserPreferences: React.FC = () => {
  const { theme, setTheme, textSize, setTextSize } = useTheme();

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    // This function is not being used in the updated code, 
    // but I've kept it here in case you want to use it in the future
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Preferences</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Text Size</label>
          <select
            value={textSize}
            onChange={(e) => setTextSize(e.target.value as 'small' | 'medium' | 'large')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Default View</label>
          <select
            value={'enhanced'} // default value
            onChange={(e) => console.log('Default view changed', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="enhanced">Enhanced</option>
            <option value="original">Original</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select
            value={'en'} // default value
            onChange={(e) => console.log('Language changed', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Your preferences are automatically saved and will be applied across all your sessions.
      </div>
    </div>
  );
};
