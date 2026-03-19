import { useEffect, useState } from 'react';
import { createTimeline, Timeline } from 'animejs';
import styles from './SideBar.module.css';

export default function SideBar() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') ?? 'light');

  const toggleTheme = () => {
    setTheme(
      theme === 'light' ? 'dark' : 'light'
    );
  }

  useEffect(() => {
    document.getElementById('root')?.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const timeline = createTimeline({ defaults: {
      duration: 750,
      ease: 'outExpo'
    }});

    morphTo(timeline, theme);
  }, [theme]);

  const moonPath =
    "M18 27.5C18 42.6878 27.5 55 27.5 55C12.3122 55 0 42.6878 0 27.5C0 12.3122 12.3122 0 27.5 0C27.5 0 18 12.3122 18 27.5Z";
  const circlePath =
    "M55 27.5C55 42.6878 42.6878 55 27.5 55C12.3122 55 0 42.6878 0 27.5C0 12.3122 12.3122 0 27.5 0C42.6878 0 55 12.3122 55 27.5Z";

  const morphTo = (timeline: Timeline, theme: string) => {
    timeline
    .add(
      ".circle", {
        d: theme === 'dark' ? moonPath : circlePath
      }
    )
    .add(
      "#darkMode", {
        rotate: theme === 'dark' ? 320 : 40
      },
      "-=700"
    );
  }

  return (
    <div className={styles.banner}>
      <img src='/hawk-logo-white.svg' alt='logo' className={styles.logo} />
      <svg id="darkMode" className={styles.toggle} viewBox="0 0 55 55" preserveAspectRatio='xMidYMid meet' fill="none" xmlns="http://www.w3.org/2000/svg" onClick={toggleTheme}>
        <path className="circle" d="M55 27.5C55 42.6878 42.6878 55 27.5 55C12.3122 55 0 42.6878 0 27.5C0 12.3122 12.3122 0 27.5 0C42.6878 0 55 12.3122 55 27.5Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
