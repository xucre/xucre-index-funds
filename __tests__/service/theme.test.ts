import { getTextColor, mode, primaryColor } from '../../service/theme';
import { Theme } from '@mui/material';

describe('Theme Service', () => {
  describe('getTextColor', () => {
    it('should return black when theme mode is light', () => {
      const theme: Theme = { palette: { mode: 'light' } } as Theme;
      expect(getTextColor(theme)).toBe('black');
    });

    it('should return white when theme mode is dark', () => {
      const theme: Theme = { palette: { mode: 'dark' } } as Theme;
      expect(getTextColor(theme)).toBe('white');
    });
  });

  describe('Constants', () => {
    it('should have mode set to dark', () => {
      expect(mode).toBe('dark');
    });

    it('should have primaryColor set to #D4E815', () => {
      expect(primaryColor).toBe('#D4E815');
    });
  });
});