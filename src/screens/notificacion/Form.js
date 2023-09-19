import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { db } from '../../db';
import { Send as SendIcon, Add as AddIcon, Keyboard } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button, Card, CardContent, Fab, MenuItem, Stack, InputAdornment, TextField, Grid, Typography, InputLabel } from '@mui/material';
import FileUpload from "react-material-file-upload";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';
import Select from 'react-select';

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [dependencias, setDependencias] = useState([]);

  const [personas, setPersonas] = useState([]);

  const [file, setFile] = useState(null);

  const pad = (num, places) => String(num).padStart(places, '0')

  const [selectedDependencia, setSelectedDependencia] = useState(null);

  const [selectedPersona, setSelectedPersona] = useState(null);

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {
    hola: "hola"
  }, {});

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Actualizar' : 'Registrar') + ' Dependencia' });
    [].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
  }, []);

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get(process.env.REACT_APP_PATH + '/notificacion/' + pid).then((result) => {
          console.log(JSON.stringify(result));
          result.fechaHoraNotificacion = result.fechaRegistro + ' ' + result.horaEmision;
          set(result);

          setSelectedDependencia({
            value: result.dependencia.id,
            label: result.dependencia.name,
          });

          setSelectedPersona({
            value: result.persona.id,
            label: result.persona.apellidoNombre,
          });

        });
      }
    }
  }, [pid]);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - header.offsetHeight - toolBar.offsetHeight) + 'px';
      toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Gestión de Notificaciónes.' });
    fetchData()
  }, []);

  const fetchData = async (page) => {

    if (networkStatus.connected) {
      const resultD = await (http.get('https://web.regionancash.gob.pe/admin/directory/api/dependency/0/0'));
      setDependencias(resultD.data);

      const response = await (http.get('https://web.regionancash.gob.pe/admin/rh/api/employee/0/0'));
      const activos = response.data.filter(item => item.status && item.status.name === "ACTIVO");
      setPersonas(activos);
    }
  };

  const onClickCancel = () => {
    navigate(-1);
  }

  const onChangeDependencia = (selectedOption) => {
    if (selectedOption) {
      const selectedDependencia = dependencias.find(
        (item) => item.id === selectedOption.value
      );
      o.dependencia = {
        id: selectedDependencia.id,
        name: selectedDependencia.fullName,
        abreviatura: selectedDependencia.type.abreviatura,
      };
      setSelectedDependencia(selectedOption);
    }
  };


  const onChangePersona = (selectedOption) => {
    if (selectedOption) {
      const selectedPerson = personas.find(
        (item) => item.people.id === selectedOption.value
      );
      o.persona = {
        id: selectedPerson.people.id,
        apellidoNombre: selectedPerson.people.fullName,
        nroDocumento: selectedPerson.people.code,
        direccion: selectedPerson.people.address,
        email: selectedPerson.people.mail,
        celular: selectedPerson.people.phone
      };
      setSelectedPersona(selectedOption);
    }
  };

  const onClickSave = async () => {
    const form = formRef.current;
    onChangeDependencia();
    onChangePersona();


    // return false;

    // if (0 || form != null && validate(form)) {

    const sessionData = localStorage.getItem('user_nicename');
    if (sessionData) {
      o.remitente = sessionData;

      const dateTime = new Date(o.fechaHoraNotificacion);
      // const fechaRegistro = `${dateTime.getDate()}-${dateTime.getMonth() + 1}-${dateTime.getFullYear()}`;
      // const horaEmision = `${dateTime.getHours()}:${dateTime.getMinutes()}`;

      const day = dateTime.getDate().toString().padStart(2, '0'); // Añade un cero adelante si es necesario
      const month = (dateTime.getMonth() + 1).toString().padStart(2, '0'); // Añade un cero adelante si es necesario
      const year = dateTime.getFullYear().toString();

      const fechaRegistro = `${year}-${month}-${day}`;

      const hours = dateTime.getHours();
      const minutes = dateTime.getMinutes().toString().padStart(2, '0');

      let formattedHours;
      if (hours === 0) {
        formattedHours = '00';
      } else if (hours > 0 && hours <= 12) {
        formattedHours = hours.toString().padStart(2, '0');
      } else {
        formattedHours = (hours - 12).toString().padStart(2, '0');
      }
      const horaEmision = `${formattedHours}:${minutes}:00`;

      let resultD = await http.get(process.env.REACT_APP_PATH + '/dependencia/' + o.dependencia.id);
      if (!resultD) {
        let resultDep = await http.post(process.env.REACT_APP_PATH + '/dependencia', o.dependencia);
      }

      let resultP = await http.get(process.env.REACT_APP_PATH + '/persona/' + o.persona.id);
      if (!resultP) {
        let resultPer = await http.post(process.env.REACT_APP_PATH + '/persona', o.persona);
      }

      if (file) {
        const formData = new FormData();
        formData.append('file', file[0]);
        formData.append('filename', file[0].name);

        http.post('https://web.regionancash.gob.pe/api/file/upload', formData, (h) => { delete h.Authorization; return h; }).then(async (result) => {
          o.urlDocumento = result.tempFile;
        });
      }



      var o2 = { ...o, dependencia: { id: o.dependencia.id }, persona: { id: o.persona.id }, fechaRegistro: fechaRegistro, horaEmision: horaEmision };


      http.post(process.env.REACT_APP_PATH + '/notificacion', o2).then(async (result) => {
        if (!o2._id) {
          if (result.id) {
            dispatch({ type: "snack", msg: 'Registro grabado!' });
            navigate('/notificacion', { replace: true });
          }
          else {
            navigate(-1);
          }
        }
      });

    } else {
      console.log("inicia sesion");
    }
    return false;
    // } else {
    //   dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    // }
  };

  const onSubmit = data => console.log(data);

  const theme = createTheme({
    components: {
      // Name of the component ⚛️
      MuiInput: {
        defaultProps: {
          required: true
        }
      },
    },
  });

  function onChangeFechaHoraNotificacion(v) {
    o.fechaHoraNotificacion = v;
    set(o => ({ ...o, fechaHoraNotificacion: v }));
  }

  function getActions() {
    return <>
      <Button variant="contained" onClick={onClickCancel} color="error">
        Cancelar
      </Button>
      <Button disabled={o.old && !o.confirm} variant="contained" onClick={onClickSave} color="success" endIcon={<SendIcon />}>
        Grabar
      </Button>
    </>
  }

  function getContent() {

    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Card className='mt-1 bs-black'>
            <CardContent>
              <Typography gutterBottom variant="h5" className='text-center fw-bold color-gore'>
                DATOS DE LA NOTIFICACIÓN
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Nro Notificación: "
                    placeholder="Ingrese el número de la Notificación."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("nroNotificacion")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Nro Expediente: "
                    placeholder="Ingrese el número de Expediente."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("nroExpediente")}
                  />
                </Grid>

                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    required
                    label="Fecha y Hora de la Notificación:"
                    value={o.fechaHoraNotificacion || ''}
                    onChange={onChangeFechaHoraNotificacion}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <InputLabel variant="standard" sx={{ fontSize: '14px' }}>
                    Seleccione la Dependencia: *
                  </InputLabel>
                  <Select
                    required
                    isClearable
                    id="standard-name"
                    placeholder="Seleccione la Dependencia: "
                    options={dependencias.map((item) => ({
                      value: item.id,
                      label: item.fullName,
                    }))}
                    onChange={onChangeDependencia}
                    value={selectedDependencia}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <InputLabel variant="standard" sx={{ fontSize: '14px' }}>
                    Seleccione el Funcionario: *
                  </InputLabel>
                  <Select
                    required
                    isClearable
                    id="standard-name"
                    placeholder="Seleccione el Funcionario: "
                    options={personas.map((item) => ({
                      value: item.people.id,
                      label: item.people.fullName,
                    }))}
                    onChange={onChangePersona}
                    value={selectedPersona}
                  />
                </Grid>


                <Grid item xs={12} md={9} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese el Asunto: "
                    placeholder="Asunto"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("asunto")}
                  />
                </Grid>
                <Grid item xs={12} md={3} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    type={'number'}
                    sx={{ fontWeight: 'bold' }}
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Folios: "
                    placeholder="Ingrese los Folios."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("folios")}
                  />
                </Grid>

                <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    multiline
                    size="medium"
                    rows={4}
                    id="standard-name"
                    label="Ingrese la descripción: "
                    placeholder="Descripción"
                    {...defaultProps("descripcion")}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <FileUpload value={file} onChange={setFile} />
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#0f62ac' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>
      </form>
    </ThemeProvider></LocalizationProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}