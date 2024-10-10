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

export default function SocialIcons({ discordUrl, emailUrl, twitterUrl, githubUrl, instagramUrl, governanceUrl, websiteUrl, gitbookUrl }) {
  return (
    <>
      <ButtonGroup variant="text" aria-label="text button group" sx={{ mx: 'auto' }}>
        {emailUrl &&
          <IconButton aria-label="email" href={emailUrl} target="_blank">
            <EmailIcon />
          </IconButton>
        }
        {twitterUrl &&
          <IconButton aria-label="twitter" href={twitterUrl} target="_blank">
            <TwitterIcon />
          </IconButton>
        }
        {githubUrl &&
          <IconButton aria-label="github" href={githubUrl} target="_blank">
            <GitHubIcon />
          </IconButton>
        }
        {instagramUrl &&
          <IconButton aria-label="instagram" href={instagramUrl} target="_blank">
            <InstagramIcon />
          </IconButton>
        }
        {discordUrl &&
          <IconButton aria-label="discord" href={discordUrl} target="_blank">
            <SiDiscord />
          </IconButton>
        }
        {governanceUrl &&
          <IconButton aria-label="governance" href={governanceUrl} target="_blank">
            <GavelIcon />
          </IconButton>
        }
        {websiteUrl &&
          <IconButton aria-label="website" href={websiteUrl} target="_blank">
            <PublicIcon />
          </IconButton>
        }
        {gitbookUrl &&
          <IconButton aria-label="gitbook" href={gitbookUrl} target="_blank">
            <AutoStoriesIcon />
          </IconButton>
        }
      </ButtonGroup>
    </>

  )
}