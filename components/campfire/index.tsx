'use client'
import { playStoreAddress } from "@/service/constants";
import { Avatar, Box, Button, CircularProgress, Fab, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import anime from 'animejs/lib/anime.es.js';
import './campfire.css';
import { getTextColor } from "@/service/theme";
// components/LoadingIndicator.tsx
function CampfireLogs({ setIsLocked }: { setIsLocked: Function }) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const textColor = getTextColor(theme);


  let fireNodes1 = document.querySelectorAll("#fireNodes1 .cf-flame");
  let fireNodes2 = document.querySelectorAll("#fireNodes2 .cf-flame");
  let fireNodes3 = document.querySelectorAll("#fireNodes1 .cf-flame");
  let baseFire = document.querySelectorAll("#base-fire .cf-flame");

  function animateBaseFire() {
    anime({
      targets: baseFire,
      delay: anime.stagger(300),
      translateY: function () { return anime.random(0, -10); },
      keyframes: [
        { scale: .8 },
        { scale: .825 },
        { scale: .9 },
        { scale: .925 },
        { scale: 1 }
      ],
      duration: 300,
      easing: 'easeInOutSine',
      loop: true,
    })
  }

  function animateFlame1() {
    anime({
      targets: fireNodes1,
      delay: anime.stagger(100),
      translateY: function () { return anime.random(0, 300); },
      rotate: 30,
      opacity: function () { return anime.random(.5, 1); },
      translateX: function () { return anime.random(0, -60); },
      scale: 0,
      skew: function () { return anime.random(0, 10); },
      loop: true,
      easing: "easeInOutSine",
    })
  }

  function animateFlame2() {
    anime({
      targets: fireNodes2,
      delay: anime.stagger(400),
      translateX: function () { return anime.random(-30, 0); },
      translateY: function () { return anime.random(0, -260); },
      //translateY: function(){return anime.random(-260, -160);},
      //translateX: function(){return anime.random(0, -30);},
      scale: 0,
      rotate: function () { return anime.random(0, 60); },
      skew: function () {
        return anime.random(0, 30);
      },
      loop: true,
      easing: "easeInOutSine"
    })
  }

  function animateFlame3() {
    anime({
      targets: fireNodes3,
      delay: anime.stagger(500),
      translateY: function () { return anime.random(-300, -200); },
      opacity: function () { return anime.random(0, 1); },
      translateX: function () { return anime.random(-50, 50); },
      scale: 0,
      rotate: function () { return anime.random(0, -30); },
      skew: function () { return anime.random(0, 20); },
      loop: true,
      easing: "easeInOutSine",
    })
  }

  animateFlame1();
  animateFlame2();
  animateFlame3();
  animateBaseFire();

  return (
    <div className="parentContainer">
      <div className="cf-container">
        <div className="cf-flame-container" id="fireNodes1">
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
        </div>
        <div className="cf-flame-container" id="fireNodes2">
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
        </div>
        <div className="cf-flame-container" id="base-fire">
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
          <div className="cf-flame"></div>
        </div>
        <div className="cf-log-container">
          <div className="cf-log"></div>
          <div className="cf-log"></div>
        </div>
      </div>
      <div className="cf-corner">
        <Button variant="contained" color="primary" onDoubleClick={() => setIsLocked(false)} sx={{ opacity: 0 }}>Unlock</Button>
      </div>

    </div>
  );
};

export default function Campfire({ setIsLocked }: { setIsLocked: Function }) {

  return (
    <Box height={'75vh'}>
      <CampfireLogs setIsLocked={setIsLocked} />
      <Typography textAlign={'center'}>&#9786; Use the secret code to unlock</Typography>
    </Box>
  );
}