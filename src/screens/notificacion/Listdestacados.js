import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../../db';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, CardContent, Card, Typography
} from '@mui/material';
import { Autorenew, InsertDriveFile, MoveToInbox, PersonSearch, PictureAsPdf, Star, TaskAlt } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const List = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const networkStatus = useSelector((state) => state.networkStatus);

  const pad = (num, places) => String(num).padStart(places, '0')

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClickRow = (event, code) => {
    const selectedIndex = selected.indexOf(code);

    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, code);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const emptyRows = result.data && result.data.length;

  const onPageChange = (
    event, page
  ) => {
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const sessionDatadirectory = localStorage.getItem('directory');
      console.log("sessionDatadirectory", sessionDatadirectory);
      let result = "";
      if (sessionDatadirectory !== undefined && sessionDatadirectory > 0) {
        result = await http.get(process.env.REACT_APP_PATH + '/notificacion/' + page + '/' + state.rowsPerPage + '?estado=2&uid=' + sessionDatadirectory);
      } else {
        result = await http.get(process.env.REACT_APP_PATH + '/notificacion/all/' + page + '/' + state.rowsPerPage);
      }
      data.size = result.size;
      data.data = data.data.concat(result.content);
    }
    setResult(data);
  };

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
    dispatch({ type: 'title', title: 'Notificaciones Destacadas' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const [o, { defaultProps }] = useFormState(useState, {}, {});

  const createOnClick = () => {
    navigate('/desaparecido/create');
  };

  const editOnClick = () => {
    navigate('/desaparecido/' + selected[0] + '/edit');
  }

  const verNotificacionOnClick = () => {
    navigate('/notificacion/ver/' + selected[0]);
  }

  const onClickDestacar = () => {
    dispatch({
      type: "confirm", msg: 'Desea destacar la notificación seleccionada?', cb: (e) => {
        if (e) {
          http.get(process.env.REACT_APP_PATH + '/notificacion/change/' + selected[0] + '?estado=2').then(e => {
            navigate('/bandeja/pendiente');
            dispatch({ type: "snack", msg: 'Notificación Destacado.!' });
          });
        }
      }
    });
  };

  const onClickArchivar = () => {
    dispatch({
      type: "confirm", msg: 'Desea archivar la notificación seleccionada?', cb: (e) => {
        if (e) {
          http.get(process.env.REACT_APP_PATH + '/notificacion/change/' + selected[0] + '?estado=3').then(e => {
            navigate('/bandeja/pendiente');
            dispatch({ type: "snack", msg: 'Notificación archivada.!' });
          });
        }
      }
    });
  };


  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Card>
        <CardContent sx={{ padding: '0px' }}>
          <Toolbar className="Toolbar-table" direction="row" >
            <Grid container spacing={2} sx={{ marginY: '1em !important' }}>
              <Grid item xs={12} sm={12} md={3}>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<PictureAsPdf />} onClick={verNotificacionOnClick} variant="contained" color="primary">Ver Notificación</Button>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} onClick={onClickArchivar} startIcon={<MoveToInbox />} variant="contained" color="primary">Archivar</Button>
              </Grid>
            </Grid>
          </Toolbar>
          <TableContainer sx={{ maxWidth: '100%', mx: 'auto', maxHeight: '540px' }}>
            <Table stickyHeader aria-label="sticky table" className='mt-5'>
              <TableHead>
                <TableRow>
                  <StyledTableCell padding="checkbox" className='bg-gore border-table'>
                    <Checkbox
                      style={{ color: 'white' }}
                      indeterminate={selected.length > 0 && selected.length < result.data.length}
                      checked={result && result.data.length > 0 && selected.length === result.data.length}
                      onChange={onChangeAllRow}
                      inputProps={{
                        'aria-label': 'select all desserts',
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '20%', maxWidth: '20%' }} className='bg-gore border-table'>Emisor
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '65%', maxWidth: '65%' }} className='bg-gore border-table'>Asunto
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '10%', maxWidth: '10%' }} className='bg-gore border-table'>Hora
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: '10%', maxWidth: '10%' }} className='bg-gore border-table'>Documento
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(result && result.data && result.data.length ? result.data : [])
                  .map((row, index) => {
                    const isItemSelected = isSelected(toID(row));
                    return (
                      <StyledTableRow
                        style={{ backgroundColor: (1) ? '' : (index % 2 === 0 ? '#f1f19c' : '#ffffbb') }}
                        hover
                        onClick={(event) => onClickRow(event, toID(row))}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={index + ' ' + toID(row)}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox" className='border-table'>
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                          />
                        </TableCell>
                        <TableCell style={{ width: '10%', maxWidth: '10%' }} className='border-table' align="center">
                          {row.remitente}
                        </TableCell>
                        <TableCell style={{ minWidth: '70%', maxWidth: '70%' }}>
                          <Typography style={{ fontWeight: 'bold' }}>
                            {row.asunto}
                          </Typography>
                          <Typography style={{ fontSize: '12px' }}>
                            {row.descripcion}
                          </Typography>
                        </TableCell>
                        <TableCell style={{ minWidth: '10%', maxWidth: '10%' }} className='border-table' align="center">
                          {pad(row.fechaRegistro[2], 2)}/{pad(row.fechaRegistro[1], 2)}/{row.fechaRegistro[0]}
                          <br></br>
                          {row.horaEmision}
                        </TableCell>
                        <TableCell style={{ minWidth: '10%', maxWidth: '10%' }} className='border-table text-center'>
                          <a href={`https://web.regionancash.gob.pe/fs/temp/${row.urlDocumento}`} target="_blank" rel="noopener noreferrer">
                            <InsertDriveFile />
                          </a>
                        </TableCell>

                      </StyledTableRow >
                    );
                  })}
                {(!emptyRows) && (
                  <TableRow style={{ height: 53 }}>
                    <TableCell colSpan={7} >
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={result.size}
            rowsPerPage={state.rowsPerPage}
            page={state.page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </CardContent>
      </Card>
    </>
  );

};

export default List;