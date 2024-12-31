import React, { useRef, useState } from 'react';
import { Button, Avatar, Box, Paper, Link, Stack, styled, Badge } from '@mui/material';
import { upload } from '@vercel/blob/client';
import OpaqueCard from '../ui/OpaqueCard';
import SquareCard from '../ui/SquareCard';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import CloseIcon from '@mui/icons-material/Close';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface ImageUploadProps {
  imageUpload: (url: string) => void;
  imageUrl?: string;
}

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const ImageUpload: React.FC<ImageUploadProps> = ({ imageUpload, imageUrl }) => {
  const {language} = useLanguage();
  const [open, setOpen] = useState(false);
  //const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl || '');

  const currentImageUrl = imageUrl || '';
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleView = () => {
    setOpen(true);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      try {
        const result = await upload(file.name , file , { access: 'public', handleUploadUrl: '/api/identification/upload', });
        const url = result.url;
        //setCurrentImageUrl(url);
        imageUpload(url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <Box>
      {currentImageUrl ? (
        <>
        
          <Avatar
            src={currentImageUrl}
            variant='square'
            alt={languageData[language].Edit.image_upload}
            sx={{ width: 200, height: 200, cursor: 'pointer', img: { objectPosition: '0px 0px', objectFit: 'contain' } }}
            onClick={handleView}
          />
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </>
      ) : (
        <>
          <SquareCard sx={{m:2, height: 200, width: 200, alignItems: 'center', justifyContent: 'center', display: 'flex'}}><Link onClick={handleClick}>{languageData[language].Edit.image_upload}</Link></SquareCard>
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[
          { src: currentImageUrl },
        ]}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </Box>
  );
};

export default ImageUpload;