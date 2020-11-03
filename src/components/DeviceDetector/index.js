import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import { NanoleafClient } from 'nanoleaf-client';
import { Typography } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';
import CustomStepper from './CustomStepper';
import StepTwo from './StepTwo';
import { updateConfig, getConfig } from '../../services/config-service';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100vh',
    display: 'flex',
  },
  grid: {
    marginTop: -theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100vw',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    background: theme.palette.button.redGradient,
  },
  grayText: {
    color: theme.palette.primary.light,
  },
  whiteText: {
    color: theme.palette.primary.contrastText,
  },
  redText: {
    color: theme.palette.error.main,
  },
  connectingProgress: {
    width: '100%',
    marginTop: theme.spacing(3),
    height: theme.spacing(0.5),
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function DeviceDetector() {
  const classes = useStyles();
  const history = useHistory();

  const [state, setState] = useState({
    selectedDevice: {},
    activeStep: 0,
    savedDeviceConfig: null,
    authorizationFailed: false,
    isForceStayOnThisScreen: (history.location.state)
      ? history.location.state.isForceStayOnDetector : false,
    showSavedDeviceError: false,
    isSavedDeviceConnecting: false,
  });

  const goToDashboard = (location, token, uuid) => {
    history.push({
      pathname: '/dashboard',
      search: `?location=${location}&token=${token}&uuid=${uuid}`,
    });
  };

  const tryUseSavedDevice = (config, setConfigState = false) => {
    const { location, token, deviceId } = config;
    const tempNanoleafClient = new NanoleafClient(new URL(location).hostname, token);
    if (setConfigState) {
      setState({ ...state,
        isSavedDeviceConnecting: true,
        savedDeviceConfig: config });
    } else {
      setState({ ...state, isSavedDeviceConnecting: true });
    }

    tempNanoleafClient.identify().then(() => {
      setState(prevState => ({ ...prevState, isSavedDeviceConnecting: false }));
      goToDashboard(location, token, deviceId);
    }).catch(() => {
      setState(prevState => ({ ...prevState,
        showSavedDeviceError: true,
        isSavedDeviceConnecting: false }));
    });
  };

  const tryUseSavedConfig = () => {
    getConfig().then((config) => {
      if (!state.isForceStayOnThisScreen && config) {
        tryUseSavedDevice(config, true);
      } else if (config) {
        setState({ ...state, savedDeviceConfig: config });
      }
    });
  };

  useEffect(() => {
    tryUseSavedConfig();
  }, []);

  const goToDiscoveryStep = () => {
    setState({
      ...state,
      activeStep: state.activeStep + 1,
    });
  };

  const selectDevice = device => {
    setState({
      ...state,
      selectedDevice: device,
      activeStep: state.activeStep + 1,
    });
  };

  const handleCloseSavedDeviceError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setState({ ...state, showSavedDeviceError: false });
  };

  const authorize = () => {
    const client = new NanoleafClient(new URL(state.selectedDevice.location).hostname);

    client.authorize().then(token => {
      updateConfig({ ...state.selectedDevice, token }).then(() => {
        goToDashboard(state.selectedDevice.location, token, state.selectedDevice.deviceId);
      });
    }, () => {
      setState({
        ...state,
        authorizationFailed: true,
      });
    });
  };

  return (
    <Container component="main" className={classes.container}>
      <Grid container justify="center">
        <Grid item xs={12}>
          <CustomStepper activeStep={state.activeStep} />
        </Grid>
        {state.activeStep === 0 && (
          state.isSavedDeviceConnecting
            ? (
              <Grid item className={classes.grid} xs={4}>
                <Typography className={classes.whiteText}>Connecting to saved device</Typography>
                <LinearProgress className={classes.connectingProgress} color="secondary" />
              </Grid>
            )
            : (
              <Grid item className={classes.grid} xs={4}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={goToDiscoveryStep}
                >
                  Select Device
                </Button>
              </Grid>
            )
        )}
        {state.activeStep === 1 && (
          <StepTwo
            selectDevice={selectDevice}
            savedDevice={state.savedDeviceConfig}
            useSavedDevice={() => {
              tryUseSavedDevice(state.savedDeviceConfig);
            }}
            isSavedDeviceConnecting={state.isSavedDeviceConnecting}
          />
        )}
        {state.activeStep === 2 && (
          <Grid item className={classes.grid} xs={4}>
            <Typography className={classes.whiteText}>
              Hold the on/off button for 5-7 seconds until the white LED starts
              flashing in a pattern, then authorize.
            </Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={authorize}
            >
              Authorize
            </Button>
            { state.authorizationFailed && (
            <Typography className={classes.redText}>
              Authorization failed. Make sure the white LED is blinking.
            </Typography>
            )}
          </Grid>
        )}
      </Grid>
      <Snackbar
        open={state.showSavedDeviceError}
        autoHideDuration={6000}
        onClose={handleCloseSavedDeviceError}
      >
        <Alert onClose={handleCloseSavedDeviceError} severity="error">
          We couldn&apos;t connect to the saved device!
          Make sure device is online or try discovering new device.
        </Alert>
      </Snackbar>
    </Container>
  );
}
