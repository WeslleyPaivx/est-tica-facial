import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {Ad} from './Ad';
import {VIDEO} from './config';

// garante a Inter carregada antes do primeiro frame (render reproduzível)
const fonts = delayRender('Inter');
Promise.all(['400', '500'].map((w) => document.fonts.load(`${w} 40px Inter`, 'Atençãoé'))).then(() => continueRender(fonts), () => continueRender(fonts));

export const Root: React.FC = () => (
  <Composition id={VIDEO.id} component={Ad} width={VIDEO.width} height={VIDEO.height} fps={VIDEO.fps} durationInFrames={VIDEO.durationInFrames} defaultProps={{voiceover: false}} />
);
