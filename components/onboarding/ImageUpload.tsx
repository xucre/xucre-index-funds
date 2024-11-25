import React, { useRef, useState } from 'react';
import { Button, Avatar, Box, Paper, Link, Stack, styled } from '@mui/material';
import { upload } from '@vercel/blob/client';
import OpaqueCard from '../ui/OpaqueCard';
import SquareCard from '../ui/SquareCard';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';

interface ImageUploadProps {
  imageUpload: (url: string) => void;
  imageUrl?: string;
}


const ImageUpload: React.FC<ImageUploadProps> = ({ imageUpload, imageUrl }) => {
  const {language} = useLanguage();
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      try {
        const result = await upload(file.name , file , { access: 'public', handleUploadUrl: '/api/identification/upload', });
        const url = result.url;
        setCurrentImageUrl(url);
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
            sx={{ width: 150, height: 150, cursor: 'pointer' }}
            onClick={handleClick}
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
          <SquareCard sx={{m:2, height: 150, width: 150, alignItems: 'center', justifyContent: 'center', display: 'flex'}}><Link onClick={handleClick}>{languageData[language].Edit.image_upload}</Link></SquareCard>
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </>
      )}
    </Box>
  );
};

export default ImageUpload;