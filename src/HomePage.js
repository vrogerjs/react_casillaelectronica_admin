import React, { useEffect } from 'react';
import {
  Mail as MailIcon,
  Menu as MenuIcon,
  InsertChart as ChartIcon,
  Map as MapIcon,
  Add as AddIcon,
  Quiz as QuizIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  MoveToInbox,
  Star,
  MailOutline,
  NotificationAdd,
} from '@mui/icons-material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import {
  Alert, AppBar, Box, CssBaseline, Drawer, Divider, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Snackbar, Toolbar,
  Typography, Grid
} from '@mui/material';
import { debounce } from 'gra-react-utils';
import lazyLoader from "./utils/LazyLoader";

import {
  Routes,
  Route, useLocation,
  useNavigate
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

function VDrawer(props) {
  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "drawer" }) };
  const drawer = useSelector((state) => state.drawer);
  return <Drawer variant="temporary"
    open={drawer}
    onClose={onClose}
    ModalProps={{
      keepMounted: true, // Better open performance on mobile.
    }}
    sx={{
      display: { xs: 'block', sm: 'none' },
      '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.width },
    }}>
    {props.children}
  </Drawer>
}

function VSnackbar() {
  const snack = useSelector((state) => state.snack);

  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "snack" }) };

  return <Snackbar open={!!snack}
    sx={{ bottom: 70 }}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    autoHideDuration={2000} onClose={onClose}>
    {<Alert severity="success" variant="filled" onClose={onClose} sx={{ width: '100%' }}>
      {snack ? snack.msg : ''}
    </Alert>
    }
  </Snackbar>;
}

function VAppBar(props) {

  const networkStatus = useSelector((state) => state.networkStatus);

  return <AppBar style={{ 'background': networkStatus.connected ? '' : 'red' }} {...props}
    position="fixed"
  >{props.children}</AppBar>;

}

const HomePage = ({ logOut, match }) => {

  const setO = React.useState({ title: 'Cuestionarios Discapacidad' })[1];

  const [perms, setPerms] = React.useState([]);

  const dispatch = useDispatch();

  const title = useSelector((state) => state.title);

  const handleDrawerToggle = () => {
    dispatch({ type: 'drawer' });
  };

  const items = [
    {
      perms: 'ADMIN_ALERTAS_AMBER', text: 'Notificación', icon: <ForwardToInboxIcon />, path: '/notificacion', items: [
        { text: 'Registro', icon: <MarkEmailReadIcon />, path: '/notificacion/create' },
        { text: 'Listado', icon: <MailOutline />, path: '/notificacion' },
      ]
    }, {
      perms: 'ADMIN_ALERTAS_AMBER', text: 'Bandeja', icon: <MailOutline />, path: '/bandeja', items: [
        { text: 'Pendientes', icon: <MailIcon />, path: '/bandeja/pendiente' },
        { text: 'Destacados', icon: <Star />, path: '/bandeja/destacado' },
        { text: 'Archivados', icon: <MoveToInbox />, path: '/bandeja/archivado' },
      ]
    },
    {
      text: 'Salir', icon: <LogoutIcon />, onClick: () => {
        logOut();
      }
    }
  ]

  const drawer = (
    <div className='bg-gore'>
      <Toolbar>
        <Grid container justifyContent="center">
          <Grid item>
            <Box
              textAlign="center"
              component="img"
              sx={{
                width: 75
              }}
              alt="Logo GORE Áncash."
              src={process.env.PUBLIC_URL + "/logo2018.png"}
            />
          </Grid>
        </Grid>
      </Toolbar>

      <Divider />
      <List className='sidebar-gore'>
        {items.filter((e) => {
          return e.perms ? perms.includes(e.perms) : true;
        }).map((item, index0) => (
          <React.Fragment key={'List_' + index0} >
            <ListItem>
              <ListItemButton onClick={item.onClick ? item.onClick : () => {
                handleDrawerToggle();
                navigate(item.path);
              }}>
                <ListItemIcon>
                  {item.icon || <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={item.text} />

              </ListItemButton>
            </ListItem>
            {item.items?.map((item, index) => (
              <ListItem key={'List_' + index0 + '_' + index} disablePadding style={{ paddingLeft: '40px' }}>
                <ListItemButton onClick={item.onClick ? item.onClick : () => {
                  handleDrawerToggle();
                  navigate(item.path);
                }}>
                  <ListItemIcon>
                    {item.icon || <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />

                </ListItemButton>
              </ListItem>
            ))}

          </React.Fragment>
        ))}
      </List>
    </div>
  );

  let location = useLocation();

  useEffect(() => {
    try {
      var s = localStorage.getItem("perms");
      if (s) {
        s = JSON.parse(s);
        setPerms(s);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const formRef = React.createRef();

  useEffect(() => {
    // const debouncedHandleResize = debounce((width, height) => {
    //   const header = document.querySelector('.MuiToolbar-root');
    //   const body = formRef.current;
    //   if (body)
    //     body.style.height = (height - header.offsetHeight * 0) + 'px';
    // });
    // debouncedHandleResize();
    // window.addEventListener('resize', debouncedHandleResize)
    // return _ => {
    //   window.removeEventListener('resize', debouncedHandleResize)
    // }
  }, [location, formRef]);

  const drawerWidth = 240;

  let navigate = useNavigate();

  // Notificacion
  const NotificacionList = lazyLoader(() => import('./screens/notificacion/List'));
  const NotificacionForm = lazyLoader(() => import('./screens/notificacion/Form')
    .then(module => ({ default: module.Form }))
  );

  // Lista de Pendientes - Archivados - Destacados
  const NotificacionListpendientes = lazyLoader(() => import('./screens/notificacion/Listpendientes'));
  const NotificacionListarchivados = lazyLoader(() => import('./screens/notificacion/Listarchivados'));
  const NotificacionListdestacados = lazyLoader(() => import('./screens/notificacion/Listdestacados'));

  // Ver mensaje
  const NotificacionListmensaje = lazyLoader(() => import('./screens/notificacion/Listmensaje'));

  // Desaparecido
  const DesaparecidoList = lazyLoader(() => import('./screens/desaparecido/List'));
  const DesaparecidoForm = lazyLoader(() => import('./screens/desaparecido/Form')
    .then(module => ({ default: module.Form }))
  );

  return (
    <Box
      sx={{ display: 'flex' }}>
      <CssBaseline />
      <VAppBar
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </VAppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <VDrawer

          onClose={handleDrawerToggle}
          width={drawerWidth}
        >
          {drawer}
        </VDrawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box ref={formRef}
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar className="_" />
        <Routes>

          {/* Notificación */}
          <Route path={`/notificacion`} element={<NotificacionList setO={setO} />} />
          <Route path={`/notificacion/create`} element={<NotificacionForm />} />
          <Route path={`/notificacion/:pid/edit`} element={<NotificacionForm />} />

          {/* Ver Lista de Pendientes */}
          <Route path={`/bandeja/pendiente`} element={<NotificacionListpendientes />} />
          <Route path={`/bandeja/destacado`} element={<NotificacionListdestacados />} />
          <Route path={`/bandeja/archivado`} element={<NotificacionListarchivados />} />

          {/* Ver notificacion */}
          <Route path={`/notificacion/ver/:pid`} element={<NotificacionListmensaje />} />

        </Routes>
      </Box>

      <VSnackbar />
    </Box>
  );

};

export default HomePage;