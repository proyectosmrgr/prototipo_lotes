// data.jsx — Generador de datos mock peruanos + persistencia localStorage
// Asociación de Lotes — datos abundantes y realistas

const STORAGE_KEY = 'aslotes_db_v1';

// —— RNG determinístico (seed) para datos consistentes entre recargas ——
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMBRES_M = ['José', 'Juan', 'Luis', 'Carlos', 'Miguel', 'Jorge', 'Pedro', 'Ricardo', 'Manuel', 'Víctor', 'Hugo', 'Javier', 'Daniel', 'Fernando', 'Roberto', 'Eduardo', 'Marco', 'César', 'Raúl', 'Alberto', 'Diego', 'Sergio', 'Andrés', 'Mario', 'Walter', 'Rodrigo', 'Pablo', 'Iván', 'Óscar', 'Felipe'];
const NOMBRES_F = ['María', 'Rosa', 'Ana', 'Carmen', 'Lucía', 'Patricia', 'Elena', 'Carla', 'Sandra', 'Luisa', 'Mónica', 'Beatriz', 'Isabel', 'Yolanda', 'Norma', 'Silvia', 'Gloria', 'Teresa', 'Verónica', 'Liliana', 'Claudia', 'Pilar', 'Susana', 'Margarita', 'Inés', 'Hilda', 'Olga', 'Vilma', 'Nelly', 'Mercedes'];
const APELLIDOS = ['Quispe', 'Mamani', 'Huamán', 'Flores', 'Vargas', 'Torres', 'Rojas', 'García', 'Castillo', 'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Gutiérrez', 'Cruz', 'Morales', 'Cabrera', 'Vega', 'Salazar', 'Ramos', 'Castro', 'Vásquez', 'Espinoza', 'Romero', 'Carrasco', 'Cárdenas', 'Aguilar', 'Paredes', 'Bautista', 'Reyes', 'Núñez', 'Medina', 'Lara', 'Vidal', 'Peña', 'Cordero', 'Pacheco', 'Soto', 'Yupanqui', 'Condori', 'Choque', 'Apaza', 'Sucasaire', 'Ccama', 'Llanos', 'Hinostroza', 'Velásquez', 'Bermúdez', 'Tello', 'Zúñiga'];
const CALLES = ['Av. Los Próceres', 'Jr. Las Flores', 'Calle Los Olivos', 'Av. Las Palmeras', 'Jr. Cusco', 'Calle Tacna', 'Av. La Cantuta', 'Jr. Lima', 'Calle Bolognesi', 'Av. Túpac Amaru', 'Pasaje San Martín', 'Calle Grau'];
const DISTRITOS = ['Pachacámac', 'Lurín', 'Cieneguilla', 'Carabayllo', 'Puente Piedra'];
const ESTADOS_SOCIO = ['Activo', 'Activo', 'Activo', 'Activo', 'Activo', 'Activo', 'Activo', 'Moroso', 'Moroso', 'Suspendido'];
const ESTADOS_LOTE = ['Ocupado', 'Ocupado', 'Ocupado', 'Ocupado', 'Disponible', 'Reservado', 'Moroso'];

const CONCEPTOS_PAGO = [
  { id: 'cuota', label: 'Cuota mensual', monto: 80 },
  { id: 'mantenimiento', label: 'Mantenimiento', monto: 45 },
  { id: 'extraordinaria', label: 'Cuota extraordinaria', monto: 150 },
  { id: 'penalidad', label: 'Penalidad por mora', monto: 25 },
  { id: 'agua', label: 'Cuota de agua', monto: 35 },
  { id: 'seguridad', label: 'Vigilancia y serenazgo', monto: 30 },
];

const METODOS_PAGO = ['Efectivo', 'BCP Transferencia', 'Yape', 'Plin', 'BBVA Depósito', 'Interbank'];

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

// —— Generación de manzanas y lotes ——
// 8 manzanas (A–H), cada una con 12 lotes en grilla 4×3
const MANZANAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const LOTES_POR_MZ = 12;

function generarLotes(rand) {
  const lotes = [];
  MANZANAS.forEach((mz) => {
    for (let i = 1; i <= LOTES_POR_MZ; i++) {
      const num = String(i).padStart(2, '0');
      const estado = ESTADOS_LOTE[Math.floor(rand() * ESTADOS_LOTE.length)];
      const tamano = 120 + Math.floor(rand() * 280); // m²
      lotes.push({
        id: `L${mz}${num}`,
        codigo: `MZ-${mz} L-${num}`,
        manzana: mz,
        numero: i,
        estado,
        tamano,
        socio_id: null,
        precio: tamano * 350 + Math.floor(rand() * 5000),
      });
    }
  });
  return lotes;
}

function generarSocios(rand, lotes) {
  const socios = [];
  const total = 540;
  for (let i = 1; i <= total; i++) {
    const esM = rand() < 0.6;
    const nombre = esM ? NOMBRES_M[Math.floor(rand() * NOMBRES_M.length)] : NOMBRES_F[Math.floor(rand() * NOMBRES_F.length)];
    const nombre2 = rand() < 0.4 ? (esM ? NOMBRES_M : NOMBRES_F)[Math.floor(rand() * 30)] : '';
    const apP = APELLIDOS[Math.floor(rand() * APELLIDOS.length)];
    const apM = APELLIDOS[Math.floor(rand() * APELLIDOS.length)];
    const dni = String(40000000 + Math.floor(rand() * 50000000));
    const tel = `9${String(Math.floor(rand() * 99999999)).padStart(8, '0')}`;
    const distrito = DISTRITOS[Math.floor(rand() * DISTRITOS.length)];
    const calle = CALLES[Math.floor(rand() * CALLES.length)];
    const numCalle = Math.floor(rand() * 800) + 100;
    const estado = ESTADOS_SOCIO[Math.floor(rand() * ESTADOS_SOCIO.length)];
    const yearIngreso = 2018 + Math.floor(rand() * 7);
    const monthIngreso = Math.floor(rand() * 12);
    const dayIngreso = Math.floor(rand() * 28) + 1;

    socios.push({
      id: i,
      codigo: `SOC-${String(i).padStart(4, '0')}`,
      dni,
      nombres: nombre + (nombre2 ? ` ${nombre2}` : ''),
      apellido_paterno: apP,
      apellido_materno: apM,
      nombre_completo: `${nombre}${nombre2 ? ` ${nombre2}` : ''} ${apP} ${apM}`,
      telefono: tel,
      email: `${nombre.toLowerCase().replace(/[áéíóú]/g, c => 'aeiou'['áéíóú'.indexOf(c)])}.${apP.toLowerCase().replace(/[áéíóú]/g, c => 'aeiou'['áéíóú'.indexOf(c)])}@correo.pe`,
      direccion: `${calle} ${numCalle}, ${distrito}`,
      distrito,
      estado,
      genero: esM ? 'M' : 'F',
      fecha_ingreso: `${yearIngreso}-${String(monthIngreso + 1).padStart(2, '0')}-${String(dayIngreso).padStart(2, '0')}`,
      lote_id: null,
      ocupacion: ['Comerciante', 'Empleado', 'Independiente', 'Jubilado', 'Construcción', 'Transportista', 'Docente'][Math.floor(rand() * 7)],
    });
  }

  // Asignar lotes a socios (los ocupados)
  const ocupados = lotes.filter(l => l.estado === 'Ocupado' || l.estado === 'Moroso');
  ocupados.forEach((lote, idx) => {
    if (idx < socios.length) {
      socios[idx].lote_id = lote.id;
      lote.socio_id = socios[idx].id;
      if (lote.estado === 'Moroso') socios[idx].estado = 'Moroso';
    }
  });
  return socios;
}

function generarPagos(rand, socios) {
  const pagos = [];
  let pagoId = 1;
  const hoy = new Date();
  const inicioAño = new Date(hoy.getFullYear(), 0, 1);

  socios.forEach((socio) => {
    if (!socio.lote_id) return;
    // Genera pagos retrospectivos de los últimos 18 meses
    for (let mesAtras = 18; mesAtras >= 0; mesAtras--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - mesAtras, Math.floor(rand() * 15) + 1);
      if (fecha > hoy) continue;

      // Cuota mensual obligatoria
      const concepto = CONCEPTOS_PAGO[0];
      let estado = 'Pagado';
      let metodo = METODOS_PAGO[Math.floor(rand() * METODOS_PAGO.length)];
      let fechaPago = fecha.toISOString().slice(0, 10);

      // Morosidad: si el socio es moroso, los últimos 2-4 meses sin pagar
      if (socio.estado === 'Moroso' && mesAtras < 4) {
        estado = mesAtras === 0 ? 'Pendiente' : 'Vencido';
        metodo = '—';
        fechaPago = null;
      } else if (rand() < 0.05 && mesAtras < 6) {
        estado = mesAtras === 0 ? 'Pendiente' : 'Vencido';
        metodo = '—';
        fechaPago = null;
      }

      pagos.push({
        id: pagoId++,
        socio_id: socio.id,
        concepto: concepto.label,
        concepto_id: concepto.id,
        monto: concepto.monto,
        periodo: `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`,
        fecha_emision: new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().slice(0, 10),
        fecha_vencimiento: new Date(fecha.getFullYear(), fecha.getMonth(), 15).toISOString().slice(0, 10),
        fecha_pago: fechaPago,
        estado,
        metodo,
        comprobante: `00${100000 + pagoId}`,
      });

      // Pagos adicionales aleatorios (mantenimiento, agua, etc.)
      if (rand() < 0.25 && mesAtras < 12) {
        const conceptoExtra = CONCEPTOS_PAGO[1 + Math.floor(rand() * (CONCEPTOS_PAGO.length - 1))];
        const estadoExtra = rand() < 0.8 ? 'Pagado' : (mesAtras === 0 ? 'Pendiente' : 'Vencido');
        pagos.push({
          id: pagoId++,
          socio_id: socio.id,
          concepto: conceptoExtra.label,
          concepto_id: conceptoExtra.id,
          monto: conceptoExtra.monto + Math.floor(rand() * 20),
          periodo: `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`,
          fecha_emision: new Date(fecha.getFullYear(), fecha.getMonth(), Math.floor(rand() * 5) + 1).toISOString().slice(0, 10),
          fecha_vencimiento: new Date(fecha.getFullYear(), fecha.getMonth(), 20).toISOString().slice(0, 10),
          fecha_pago: estadoExtra === 'Pagado' ? new Date(fecha.getFullYear(), fecha.getMonth(), Math.floor(rand() * 20) + 1).toISOString().slice(0, 10) : null,
          estado: estadoExtra,
          metodo: estadoExtra === 'Pagado' ? METODOS_PAGO[Math.floor(rand() * METODOS_PAGO.length)] : '—',
          comprobante: `00${100000 + pagoId}`,
        });
      }
    }
  });

  return pagos.sort((a, b) => b.id - a.id);
}

function generarActividad(rand, socios, pagos) {
  const acts = [];
  let id = 1;
  const hoy = new Date();
  const tipos = [
    { t: 'pago', icon: 'creditcard', verb: 'registró un pago' },
    { t: 'socio', icon: 'user-plus', verb: 'se incorporó como socio' },
    { t: 'lote', icon: 'map', verb: 'asignación de lote actualizada' },
    { t: 'aviso', icon: 'bell', verb: 'envió aviso de morosidad' },
  ];
  for (let i = 0; i < 18; i++) {
    const minsAgo = i * (30 + Math.floor(rand() * 180));
    const fecha = new Date(hoy.getTime() - minsAgo * 60000);
    const socio = socios[Math.floor(rand() * 80)];
    const tipo = tipos[Math.floor(rand() * tipos.length)];
    acts.push({
      id: id++,
      tipo: tipo.t,
      icon: tipo.icon,
      texto: `${socio.nombre_completo} ${tipo.verb}`,
      fecha: fecha.toISOString(),
    });
  }
  return acts;
}

// —— Inicialización ——
function initDB() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  if (saved) {
    try {
      const db = JSON.parse(saved);
      if (db && db.version === 1) return db;
    } catch (_) {}
  }
  const rand = mulberry32(20251128);
  const lotes = generarLotes(rand);
  const socios = generarSocios(rand, lotes);
  const pagos = generarPagos(rand, socios);
  const actividad = generarActividad(rand, socios, pagos);
  const db = { version: 1, lotes, socios, pagos, actividad, asociacion: { nombre: 'Las Lomas de Pachacámac', subtitulo: 'Asociación de Vivienda' } };
  saveDB(db);
  return db;
}

function saveDB(db) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (_) {}
}

function resetDB() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}

// —— Helpers de formato ——
function fmtSoles(n) {
  return 'S/ ' + new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function fmtNum(n) {
  return new Intl.NumberFormat('es-PE').format(n);
}
function fmtFecha(iso, opts = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (opts.relative) {
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'ahora';
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    const dias = Math.floor(h / 24);
    if (dias < 30) return `hace ${dias} d`;
  }
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDNI(dni) {
  return dni;
}
function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
}

// —— Cálculos agregados ——
function calcKPIs(db) {
  const totalSocios = db.socios.length;
  const morosos = db.socios.filter(s => s.estado === 'Moroso').length;
  const activos = db.socios.filter(s => s.estado === 'Activo').length;
  const pagosPendientes = db.pagos.filter(p => p.estado === 'Pendiente' || p.estado === 'Vencido');
  const pagosRealizadosMes = db.pagos.filter(p => {
    if (p.estado !== 'Pagado' || !p.fecha_pago) return false;
    const d = new Date(p.fecha_pago);
    const hoy = new Date();
    return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
  });
  const ingresoMes = pagosRealizadosMes.reduce((s, p) => s + p.monto, 0);
  const deudaTotal = pagosPendientes.reduce((s, p) => s + p.monto, 0);
  const hoy = new Date();
  const nuevosSocios = db.socios.filter(s => {
    const d = new Date(s.fecha_ingreso);
    return (hoy - d) < 90 * 24 * 60 * 60 * 1000;
  }).length;
  return {
    totalSocios, morosos, activos, nuevosSocios,
    pagosPendientes: pagosPendientes.length,
    pagosRealizadosMes: pagosRealizadosMes.length,
    ingresoMes, deudaTotal,
    asistenciasMes: 287, // mock
  };
}

function pagosUltimos12Meses(db) {
  const hoy = new Date();
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const m = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const monto = db.pagos
      .filter(p => p.estado === 'Pagado' && p.fecha_pago && new Date(p.fecha_pago).getMonth() === m.getMonth() && new Date(p.fecha_pago).getFullYear() === m.getFullYear())
      .reduce((s, p) => s + p.monto, 0);
    const deuda = db.pagos
      .filter(p => p.estado !== 'Pagado' && new Date(p.fecha_emision).getMonth() === m.getMonth() && new Date(p.fecha_emision).getFullYear() === m.getFullYear())
      .reduce((s, p) => s + p.monto, 0);
    data.push({ mes: MESES[m.getMonth()], year: m.getFullYear(), ingreso: monto, deuda });
  }
  return data;
}

function distribucionEstadoLotes(db) {
  const counts = { Ocupado: 0, Disponible: 0, Reservado: 0, Moroso: 0 };
  db.lotes.forEach(l => { counts[l.estado] = (counts[l.estado] || 0) + 1; });
  return counts;
}

// Export to global window so other Babel scripts can use these
Object.assign(window, {
  initDB, saveDB, resetDB,
  fmtSoles, fmtNum, fmtFecha, fmtDNI, iniciales,
  calcKPIs, pagosUltimos12Meses, distribucionEstadoLotes,
  MESES, MANZANAS, LOTES_POR_MZ, CONCEPTOS_PAGO, METODOS_PAGO, ESTADOS_LOTE,
});
