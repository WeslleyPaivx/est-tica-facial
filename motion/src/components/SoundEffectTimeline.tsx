import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO, SFX_CUES, SFX_FRAMES} from '../config';

// Trilha + efeitos sincronizados por frame (cues em config.ts). Narração opcional: public/audio/voice.wav.
export const SoundEffectTimeline: React.FC<{voiceover: boolean}> = ({voiceover}) => (
  <>
    <Audio src={staticFile(AUDIO.music)} volume={voiceover ? AUDIO.musicVolumeUnderVoice : AUDIO.musicVolume} />
    {voiceover && <Audio src={staticFile(AUDIO.voice)} volume={AUDIO.voiceVolume} />}
    {SFX_CUES.map((cue, i) => (
      <Sequence key={i} from={cue.frame} durationInFrames={SFX_FRAMES[cue.sfx] + 2} layout="none">
        <Audio src={staticFile(`audio/${cue.sfx}.wav`)} volume={cue.volume * AUDIO.sfxMaster} />
      </Sequence>
    ))}
  </>
);
