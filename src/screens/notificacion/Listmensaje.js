import React, { useState, useEffect, useRef } from 'react';
import { Button, Toolbar, Grid, CardContent, Card } from '@mui/material';
import { ArrowBackIos, InsertDriveFile } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Typography from '@mui/material/Typography';

const List = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const networkStatus = useSelector((state) => state.networkStatus);

  const componentRef = useRef();

  const { pid } = useParams();

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {

  }, {});

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get(process.env.REACT_APP_PATH + '/notificacion/' + pid).then((result) => {
          console.log(JSON.stringify(result));
          result.apellidoNombre = result.persona.apellidoNombre;
          set(result);
        });
      }
    }
  }, [pid]);

  const { height, width } = useResize(React);

  useEffect(() => {
    const header = document.querySelector('.MuiToolbar-root');
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    const nav = document.querySelector('nav');
    const toolbarTable = document.querySelector('.Toolbar-table');
    const tablePagination = document.querySelector('.MuiTablePagination-root');

    if (tableContainer) {
      tableContainer.style.width = (width - nav.offsetWidth) + 'px';
      tableContainer.style.height = (height - header.offsetHeight
        - toolbarTable.offsetHeight - tablePagination.offsetHeight) + 'px';
    }
  }, [height, width]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Ver Notificación.' });
  }, []);

  const onClickBack = () => {
    navigate('/bandeja/pendiente');
  }

  function fechaHora(timestamp) {
    const fecha = new Date(timestamp);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Card>
        <CardContent>
          <Toolbar className="Toolbar-table" direction="row" >
            <Grid container spacing={2}>
              <Grid item xs={12} md={10}>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} variant="contained" onClick={onClickBack} color="primary" startIcon={<ArrowBackIos />}>
                  Atrás
                </Button>
              </Grid>
            </Grid>
          </Toolbar>
          <Card ref={componentRef} sx={{ minWidth: 275 }} className='mt-4'>
            <CardContent>
              <Typography gutterBottom component="div" fontSize={'25px'} className='text-center fw-bold pt-2 mb-0' sx={{ textTransform: 'uppercase', color: 'red' }}>
                NOTIFICACIÓN
              </Typography>
              <Grid container>

                <Grid item xs={12} sm={12} md={6} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    Nº de Notificación :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.nroNotificacion}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    Nº de Expediente :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.nroExpediente}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    FECHA :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {fechaHora(o.fechaRegistro)} {o.horaEmision}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    REMITENTE :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.remitente}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    DESTINATARIO :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.apellidoNombre}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={12} md={12} className='p-3' sx={{ backgroundColor: '#a8a8a8', marginY: '1em' }}>
                  <Typography gutterBottom component="div" fontSize={'20px'} className='text-center fw-bold' sx={{ textTransform: 'uppercase' }}>
                    CONTENIDO DE LA NOTIFICACIÓN
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    Folios :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.folios}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    Asunto :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.asunto}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', textAlign: 'left' }}>
                    Descripción :
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem' }}>
                  <Typography gutterBottom component="div" fontSize={'15px'} sx={{ color: '#0f62ac', textAlign: 'justify' }}>
                    {o.descripcion}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    Documento :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    <a href={`https://web.regionancash.gob.pe/fs/temp/${o.urlDocumento}`} target="_blank" rel="noopener noreferrer">
                      <InsertDriveFile />
                    </a>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  );

};

export default List;