import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import { useHistory } from 'react-router-dom';
import AppsIcon from '@material-ui/icons/Apps';
import Slider from '@material-ui/core/Slider';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import CardActions from '@material-ui/core/CardActions';
import { CardHeader, Divider } from '@material-ui/core';
import { ChromePicker } from 'react-color';
import { NanoleafClient } from 'nanoleaf-client';
import NanoleafLayout from 'nanoleaf-layout/lib/NanoleafLayout';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  media: {
    height: 240,
  },
  colorCard: {
    height: 300,
  },
  toolbar: theme.mixins.toolbar,
  alignCenter: {
    alignItems: 'center',
    display: 'inline',
  },
}));

const TabPanel = ({ children, tabValue, index, ...other }) => (
  <Typography
    component="div"
    role="tabpanel"
    hidden={tabValue !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
  >
    {tabValue === index && <Box p={3}>{children}</Box>}
  </Typography>
);

const a11yProps = (index) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

export default function Dashboard() {
  const classes = useStyles();
  const history = useHistory();

  const query = new URLSearchParams(history.location.search);
  const token = query.get('token');
  const location = query.get('location');

  if (!(token && location)) history.push('');

  const [state, setState] = useState({
    checkedA: true,
    brightness: 30,
    ctValue: 1200,
    tabValue: 0,
    nanoleafClient: new NanoleafClient(new URL(location).hostname, token),
    layout: {
      numPanels: 0,
      sideLength: 0,
      positionData: [],
    },
    color: '#ff0000',
  });

  useEffect(() => {
    state.nanoleafClient.getInfo().then(response => {
      if (response.state) {
        setState({
          ...state,
          brightness: response.state.brightness.value,
          ctValue: response.state.ct.value,
          layout: response.panelLayout.layout,
        });
      }
    });
  }, []);

  const changeTabs = (_event, tabValue) => {
    setState({ ...state, tabValue });
  };

  const updateDeviceBrightness = (_event, brightness) => {
    state.nanoleafClient.setBrightness(brightness);
  };

  const updateBrightnessValue = (_event, brightness) => {
    setState({ ...state, brightness });
  };

  const updateDeviceCt = (_event, ctValue) => {
    state.nanoleafClient.setColorTemperature(ctValue);
  };

  const updateCtValue = (_event, ctValue) => {
    setState({ ...state, ctValue });
  };

  const updateColor = (color) => {
    setState({ ...state, color });
  };

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={classes.appBar}
        onClick={() => {
          history.push('/', { isForceDetectNew: true });
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            ElectroLeaf
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.toolbar} />
        <List>
          <ListItem button>
            <ListItemIcon>
              <AppsIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary="General" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <ChangeHistoryIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Devices" />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <Card>
                <NanoleafLayout data={state.layout} svgStyle={{ height: '400px' }} />
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Card>
                <Tabs
                  value={state.tabValue}
                  onChange={changeTabs}
                  aria-label="simple tabs example"
                  centered
                >
                  <Tab label="RGB" {...a11yProps(0)} />
                  <Tab label="Hex" {...a11yProps(1)} />
                  <Tab label="HSL" {...a11yProps(2)} />
                </Tabs>
                <CardContent className={classes.colorCard}>
                  <TabPanel tabValue={state.tabValue} index={0}>
                    <ChromePicker
                      disableAlpha
                      onChange={updateColor}
                      color={state.color}
                    />
                  </TabPanel>
                  <TabPanel tabValue={state.tabValue} index={1}>
                    Item Two
                  </TabPanel>
                  <TabPanel tabValue={state.tabValue} index={2}>
                    Item Three
                  </TabPanel>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} lg={3}>
              <Card>
                <CardHeader
                  title="Brightness"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Slider
                    value={state.brightness}
                    onChangeCommitted={updateDeviceBrightness}
                    onChange={updateBrightnessValue}
                    aria-labelledby="continuous-slider"
                    marks={[
                      { value: 0, label: '0' },
                      { value: 100, label: '100' },
                    ]}
                  />
                </CardContent>
                <Divider />
                <CardActions className={classes.alignCenter}>
                  <Typography align="center" variant="h6" color="textSecondary">
                    {state.brightness}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={3} lg={3}>
              <Card>
                <CardHeader
                  title="Color Temperature"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Slider
                    value={state.ctValue}
                    onChangeCommitted={updateDeviceCt}
                    onChange={updateCtValue}
                    aria-labelledby="continuous-slider"
                    min={1200}
                    max={6500}
                    marks={[
                      { value: 1200, label: '1200' },
                      { value: 6500, label: '6500' },
                    ]}
                  />
                </CardContent>
                <Divider />
                <CardActions className={classes.alignCenter}>
                  <Typography align="center" variant="h6" color="textSecondary">
                    {state.ctValue}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={3} lg={3}>
              <Card>
                <CardHeader
                  title="Theme"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                  >
                    Word of the Day
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions className={classes.alignCenter}>
                  <Typography align="center" variant="h6" color="textSecondary">
                    Pink
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={3} lg={3}>
              <Card>
                <CardHeader
                  title="Status"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                  >
                    Word of the Day
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions className={classes.alignCenter}>
                  <Typography align="center" variant="h6" color="textSecondary">
                    OK
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}
