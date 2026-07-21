export const voltageVertexShader = /* glsl */ `
  attribute float aProgress;
  uniform float uTime;
  
  varying float vProgress;
  varying vec3 vPosition;

  void main() {
    vProgress = aProgress;
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const voltageFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uVoltagePulse;
  
  varying float vProgress;
  varying vec3 vPosition;

  void main() {
    // Calculate conductive voltage pulse traveling along line length
    float pulseSpeed = uTime * 2.5;
    float wave = sin(vProgress * 12.0 - pulseSpeed + uVoltagePulse) * 0.5 + 0.5;
    wave = pow(wave, 4.0); // Sharpen electrical wave peak

    // Base champagne gold color with bright electrical wave highlight
    vec3 baseColor = uColor * 0.6;
    vec3 pulseColor = vec3(1.0, 0.92, 0.7) * (wave * 1.5);
    vec3 finalColor = baseColor + pulseColor;

    float alpha = 0.35 + wave * 0.55;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
