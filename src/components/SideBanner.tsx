import { useEffect, useState } from 'react';
import anime from 'animejs';
import styles from '../styles/sideBanner.module.css';

export default function SideBanner() {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => {
    setTheme(
      theme === 'light' ? 'dark' : 'light'
    );
    const timeline = anime.timeline({
      duration: 750,
      easing: "easeOutExpo"
    });

    morphTo(timeline, theme);
  }

  const morphTo = (timeline: anime.AnimeTimelineInstance, theme: string) => {
    timeline
    .add({
      targets: ".circle",
      d: [{ value: theme === 'dark' ? circlePath : moonPath }]
    })
    .add(
      {
        targets: "#darkMode",
        rotate: theme === 'dark' ? 40 : 320
      },
      "-=700"
    )
    .add(
      {
        targets: ".scene",
        backgroundColor: theme === 'dark' ? "#f1f1f1" : "#333"
      },
      "-=700"
    );
  }

  useEffect(() => {
    document.getElementById('root')?.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const moonPath =
    "M18 27.5C18 42.6878 27.5 55 27.5 55C12.3122 55 0 42.6878 0 27.5C0 12.3122 12.3122 0 27.5 0C27.5 0 18 12.3122 18 27.5Z";
  const circlePath =
    "M55 27.5C55 42.6878 42.6878 55 27.5 55C12.3122 55 0 42.6878 0 27.5C0 12.3122 12.3122 0 27.5 0C42.6878 0 55 12.3122 55 27.5Z";

  return (
    <div className={styles.banner}>
      <img src='hawk-logo-white.svg' alt='logo' className={styles.logo} />
      <svg id="darkMode" className={styles.toggle} width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={toggleTheme}>
        <path className="circle" d="M55 27.5C55 42.6878 42.6878 55 27.5 55C12.3122 55 0 42.6878 0 27.5C0 12.3122 12.3122 0 27.5 0C42.6878 0 55 12.3122 55 27.5Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
