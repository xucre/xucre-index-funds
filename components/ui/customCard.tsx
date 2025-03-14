'use client'
import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Color from "color"; // v3.2.1

const CardActionAreaActionArea = styled(CardActionArea)(() => ({
  borderRadius: 16,
  transition: "0.2s",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const StyledCard = styled(Card)(({ color }) => ({
  minWidth: 256,
  borderRadius: 16,
  boxShadow: "none",
  "&:hover": {
    boxShadow: `0 6px 12px 0 ${Color(color).rotate(-12).darken(0.2).fade(0.5)}`,
  },
}));

const CardContentContent = styled(CardContent)(({ color }) => {
  return {
    backgroundColor: color,
    padding: "1rem 1.5rem 1.5rem",
  };
});

const TypographyTitle = styled(Typography)(() => ({
  //fontFamily: "Keania One",
  fontSize: "1.5rem",
  color: "#fff",
  textTransform: "uppercase",
}));

const TypographySubtitle = styled(Typography)(() => ({
  //fontFamily: "Montserrat",
  color: "#fff",
  opacity: 0.87,
  marginTop: "1.2rem",
  fontWeight: 500,
  fontSize: 14,
}));

const CustomCard = ({
  color,
  image,
  title,
  sourceLogo,
  subtitle,
  onclick
}: {
  color: string;
  image: string;
  title: string;
  sourceLogo: string;
  subtitle: string;
  onclick: () => void;
}) => (
  <CardActionAreaActionArea onClick={onclick}>
    <StyledCard color={color}>
      <CardMedia
        image={image}
        sx={{
          width: "100%",
          height: 0,
          paddingBottom: "75%",
          backgroundColor: "rgba(0,0,0,0.08)",
        }}
      />
      <CardContentContent color={color}>
        <Stack direction={'row'} spacing={2}>
          {/*<Avatar src={sourceLogo} sx={{ width: 24, height: 24 }} />*/}
          <TypographyTitle variant={"h2"}>{title}</TypographyTitle>
        </Stack>

        <TypographySubtitle>{subtitle}</TypographySubtitle>
      </CardContentContent>
    </StyledCard>
  </CardActionAreaActionArea>
);
export default CustomCard;
