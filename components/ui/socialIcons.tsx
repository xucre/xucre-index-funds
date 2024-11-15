'use client'
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import PublicIcon from '@mui/icons-material/Public';
import InstagramIcon from '@mui/icons-material/Instagram';
import GavelIcon from '@mui/icons-material/Gavel';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { SiDiscord } from "react-icons/si";
import React from 'react';
import { useTheme } from '@mui/material';

export default function SocialIcons({ discordUrl, emailUrl, twitterUrl, githubUrl, instagramUrl, governanceUrl, websiteUrl, gitbookUrl }) {
  const theme = useTheme();
  return (
    <>
      <ButtonGroup variant="text" aria-label="text button group" sx={{ mx: 'auto' }} color={theme.palette.mode === 'dark' ? 'inherit' : 'inherit'}>
        {emailUrl &&
          <IconButton aria-label="email" href={emailUrl} target="_blank" color={'inherit'}>
            <EmailIcon />
          </IconButton>
        }
        {twitterUrl &&
          <IconButton aria-label="twitter" href={twitterUrl} target="_blank" color={'inherit'}>
            <TwitterIcon />
          </IconButton>
        }
        {githubUrl &&
          <IconButton aria-label="github" href={githubUrl} target="_blank" color={'inherit'}>
            <GitHubIcon />
          </IconButton>
        }
        {instagramUrl &&
          <IconButton aria-label="instagram" href={instagramUrl} target="_blank" color={'inherit'}>
            <InstagramIcon />
          </IconButton>
        }
        {discordUrl &&
          <IconButton aria-label="discord" href={discordUrl} target="_blank" color={'inherit'}>
            <SiDiscord />
          </IconButton>
        }
        {governanceUrl &&
          <IconButton aria-label="governance" href={governanceUrl} target="_blank" color={'inherit'}>
            <GavelIcon />
          </IconButton>
        }
        {websiteUrl &&
          <IconButton aria-label="website" href={websiteUrl} target="_blank" color={'inherit'}>
            <PublicIcon />
          </IconButton>
        }
        {gitbookUrl &&
          <IconButton aria-label="gitbook" href={gitbookUrl} target="_blank" color={'inherit'}>
            <AutoStoriesIcon />
          </IconButton>
        }
      </ButtonGroup>
    </>

  )
}