import React from 'react';
import Box from '@material-ui/core/Box';
import NanoleafLayout from 'nanoleaf-layout/lib/NanoleafLayout';
import theme from '../../../theme';

export default function NanoleafLayoutCard({ colorMode, color, layout, rotation }) {
  const getConicGradientPalette = () => {
    let colorString = String();

    const panels = Array.from(layout.positionData);

    panels.forEach(panel => {
      colorString += `${panel.color},`;
    });

    // finishing with starting color to create smooth transition
    colorString += panels[0].color;

    return `conic-gradient(${colorString})`;
  };

  return (
    <Box display="flex" style={{ width: '100%', background: colorMode === 'effect' ? getConicGradientPalette() : `#${color}`, borderRadius: '10px', justifyContent: 'center' }}>
      <Box display="flex" style={{ width: '98%', height: '98%', marginTop: '1%', backgroundColor: theme.palette.primary.main, borderRadius: '10px', justifyContent: 'center' }}>
        <NanoleafLayout data={layout} svgStyle={{ width: '75%', marginLeft: '4%', transform: `rotate(${rotation}deg)` }} />
      </Box>
    </Box>
  );
}
