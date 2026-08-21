import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import Scene from './Scene';
import './styles.css';

class SectionData {
  constructor({ label, section, details, buttonText, buttonLink, image = '' }) {
    this.label = label;
    this.section = section;
    this.details = details;
    this.buttonText = buttonText;
    this.buttonLink = buttonLink;
    this.image = image;
  }
}

export const SectionEnum = Object.freeze({
  INTRO: Symbol('intro'),
  XR: Symbol('xr'),
  WEB: Symbol('web'),
  GAMES: Symbol('games'),
  MOBILE: Symbol('mobile'),
});

const linkMap = new Map([
  [
    SectionEnum.INTRO,
    new SectionData({
      label: 'Intro',
      section: 'Hi, I\'m Mayan Shoshani',
      details: 'My Name is Mayan. I\'m currently a software engineer and designer who enjoys building interesting software, I consider myself a generalist with a special interest in 3D, I have worked on everything from video games, virtual and augmented reality applications, front end and back end web development, and mobile apps. I\'ve worked with small startups and fortune 500 compants to make all kinds of interesting new experiences',
      buttonText: 'Enter Portfolio',
      buttonLink: 'https://sites.google.com/view/shoshani-cv',
      image: 'https://raw.githubusercontent.com/shoshanimayan/shoshanimayan.github.io/master/_images/circle-cropped.png'
    })
  ],
  [
    SectionEnum.XR,
    new SectionData({
      label: 'XR Development',
      section: 'XR Development',
      details: 'I\'ve Been working in XR since 2019, building VR and AR Mixed reality apps for headsets,mobile, and web. I\'ve worked on use cases such as education, medical, and enterprise. I mainly work with Unity, but have experience with threejs webxr and unreal engine.',
      buttonText: 'View XR Projects',
      buttonLink: 'https://sites.google.com/view/shoshani-cv/virtual-reality-augmented-reality-projects',
      image: 'https://raw.githubusercontent.com/shoshanimayan/shoshanimayan.github.io/master/_images/vr-1.png'
    })
  ],
  [
    SectionEnum.WEB,
    new SectionData({
      label: 'Web Development',
      section: 'Web Development',
      details: 'I started working in Webdev in 2021, designing and building React front ends, these days I also work on 3D visualizations and data visualizations with threejs. I have some backend experience with AWS, Python Django, and Node js as well.',
      buttonText: 'View Web Projects',
      buttonLink: 'https://sites.google.com/view/shoshani-cv/general-software-projects#h.nrlivr3ww3pn',
      image: 'https://raw.githubusercontent.com/shoshanimayan/shoshanimayan.github.io/master/_images/web-1.png'
    })
  ],
  [
    SectionEnum.GAMES,
    new SectionData({
      label: 'Game Development',
      section: 'Game Development',
      details: 'I\'ve been a a hobbyist game developer since I was in college, and have continued to work on my own game projects and participate in game jams, working with game engines like Unity, Godot and Unreal Engine.',
      buttonText: 'View Game Projects',
      buttonLink: 'https://sites.google.com/view/shoshani-cv/game-portfolio',
      image: 'https://raw.githubusercontent.com/shoshanimayan/shoshanimayan.github.io/master/_images/game-1.png'
    })
  ],
  [
    SectionEnum.MOBILE,
    new SectionData({
      label: 'Mobile Development',
      section: 'Mobile Development',
      details: 'I have worked professionally as mobile developer with about 2 years of experience, working on enterprise front ends for professional mobile apps. working Natively with Android and Kotlin, React native and typescript, with some swift ios experience',
      buttonText: 'View Mobile Projects',
      buttonLink: 'https://sites.google.com/view/shoshani-cv/general-software-projects#h.npybu2ujnrbm',
      image: 'https://raw.githubusercontent.com/shoshanimayan/shoshanimayan.github.io/master/_images/mobile-1.png'
    })
  ]
]);

export default function App() {
  const viewRef = useRef();
  const [selected, setSelected] = useState(SectionEnum.INTRO);
  
  const [isLoaded, setIsLoaded] = useState(false);

  const [displayedData, setDisplayedData] = useState(() => linkMap.get(SectionEnum.INTRO));
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectSection = (enumKey) => {
    if (enumKey === selected) return;

    setSelected(enumKey);
    setIsFading(true);

    setTimeout(() => {
      const newData = linkMap.get(enumKey);
      setDisplayedData(newData);
      setIsFading(false);
    }, 250);
  };

  const currentData = displayedData || new SectionData({
    label: '',
    section: 'Section',
    details: 'This text area will update later depending on your active selection above.',
    buttonText: 'Enter Experience',
    buttonLink: '#',
    image: ''
  });

  return (
    <div className="app-container">
      
      <header className="top-links">
        <a href="https://github.com/shoshanimayan" target="_blank" rel="noreferrer">
          <img src="https://raw.githubusercontent.com/shoshanimayan/shoshanimayan.github.io/master/_images/GitHub-Mark-Light-64px.png" alt="github" />
        </a>
        <a href="https://www.linkedin.com/in/mayan-shoshani/" target="_blank" rel="noreferrer">
          <img src="https://raw.githubusercontent.com/shoshanimayan/shoshanimayan.github.io/master/_images/LinkedIn-Logo-64x64.png" alt="Linkedin" />
        </a>
      </header>

      <main className="r3f-canvas-area">
        <div className="canvas-ui-overlay">          
          <div className={`ui-panel panel-left slide-left ${isLoaded ? 'slide-in' : ''}`}>
            <h3 className='sub-header'>Instructions</h3>
            <p>Drag anywhere in the center to rotate the cube.</p>
            <p>Use Navigation panel to navigate topics.</p>
          </div>
          <div ref={viewRef} className="ui-3d-container"></div>
          <div className={`ui-panel panel-right slide-right ${isLoaded ? 'slide-in' : ''}`}>
            <h3 className='sub-header'>Navigation</h3>
            <ul className="nav-list">
              {Array.from(linkMap.entries()).map(([enumKey, data]) => {
                const isActive = selected === enumKey;
                return (
                  <li key={enumKey.description}>
                    <button
                      className={`nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectSection(enumKey)}
                    >
                      {data.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={`ui-panel panel-bottom fade-panel ${isFading ? 'faded' : ''}`}>
            <h2>{currentData.section}</h2>
            <p>{currentData.details}</p>
          </div>
        </div>
        <Canvas className="global-canvas" camera={{ position: [0, 0, 4], fov: 45 }}>
          <View track={viewRef}>
            <Scene imageUrl={linkMap.get(selected)?.image} sectionType={selected}/>
          </View>
        </Canvas>
      </main>
      <footer className="main-entry-area">
        <button 
          className="entry-button"
          onClick={() => window.location.href = currentData.buttonLink}
        >
          {currentData.buttonText}
        </button>
      </footer>

    </div>
  );
}