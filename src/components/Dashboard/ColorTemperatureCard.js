import React, { } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import OpacityIcon from '@material-ui/icons/Opacity';
import Chip from '@material-ui/core/Chip';
import Slider from '@material-ui/core/Slider';
import CardWrapper from './CardWrapper';

const useStyles = makeStyles((theme) => ({
  chip: {
    marginBottom: theme.spacing(8),
  },
}));

export default function ColorTemperatureCard({
  ctValue,
  updateDeviceCt,
  updateCtValue }) {
  const classes = useStyles();

  return (
    <CardWrapper wrappedComponent={(
      <div>
        <CardContent>
          <Chip
            icon={<OpacityIcon />}
            label="Color Temperature"
            color="secondary"
            className={classes.chip}
          />
          <Slider
            value={ctValue}
            onChangeCommitted={updateDeviceCt}
            onChange={updateCtValue}
            aria-labelledby="continuous-slider"
            valueLabelDisplay="on"
            min={0}
            max={100}
            marks={[
              { value: 0, label: '0' },
              { value: 20, label: '20' },
              { value: 40, label: '40' },
              { value: 60, label: '60' },
              { value: 80, label: '80' },
              { value: 100, label: '100' },
            ]}
            color="secondary"
          />
        </CardContent>
      </div>
    )}
    />
  );
}