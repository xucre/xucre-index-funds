
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/navigation';
;

export default function SettingsButton({ }) {
  const router = useRouter();
  const handleClick = () => {
    router.replace('/settings')
  }

  return (
    <IconButton aria-label="settings" onClick={handleClick} >
      <SettingsIcon />
    </IconButton>

  )
}