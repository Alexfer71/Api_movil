import React, {
  useState, useEffect, useCallback,
  createContext, useContext,
} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, ActivityIndicator, Alert,
  StatusBar, RefreshControl, KeyboardAvoidingView,
  Platform, Dimensions,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
// 10.0.2.2 = localhost del PC desde emulador Android
// Cambia a tu IP local (ej: 192.168.x.x) para dispositivo físico
const API_URL = 'http://192.168.100.10/app_movil/api.php';

const { width: SW, height: SH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SW < 380;
const H_PADDING = IS_SMALL_SCREEN ? 14 : 18;
const BORDER_RADIUS = 16;
const CARD_RADIUS = 20;
const INPUT_HEIGHT = 52;
const BTN_HEIGHT = 52;

// Nivel de acceso mínimo para ser considerado ADMINISTRADOR
const NIVEL_ADMIN = 5;

// ─────────────────────────────────────────────────────────────────────────────
// COLORES Y TEMA
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  // Marca
  primary: '#1565C0',
  primaryDark: '#0D47A1',
  primaryLight: '#E3F2FD',
  accent: '#FFB300',

  // Estados
  success: '#2E7D32',
  danger: '#C62828',
  warning: '#EF6C00',
  info: '#0277BD',

  // Extras de apoyo
  purple: '#6A1B9A',
  teal: '#00695C',

  // Fondos
  bg: '#F4F7FB',
  bgSoft: '#EEF4FF',
  card: '#FFFFFF',
  cardAlt: '#F8FAFC',
  inputBg: '#FFFFFF',

  // Texto
  text: '#0F172A',
  textSoft: '#475569',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  white: '#FFFFFF',

  // Bordes y detalles
  border: '#D9E2EC',
  borderStrong: '#C2CEDB',
  divider: '#E6ECF2',
  shadow: 'rgba(15, 23, 42, 0.08)',

  // Chips / tabs / badges
  chipBg: '#EDF4FF',
  chipText: '#1565C0',
  tabInactive: '#7C8AA5',

  // Acciones rápidas
  edit: '#1565C0',
  delete: '#C62828',
};
const SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  android: {
    elevation: 3,
  },
  default: {},
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXTO AUTH
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTE HTTP
// ─────────────────────────────────────────────────────────────────────────────
async function api(op, params = {}, method = 'GET', body = null) {
  const qs  = new URLSearchParams({ op, ...params }).toString();
  const url = `${API_URL}?${qs}`;
  const opt = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opt.body = JSON.stringify(body);
  const res  = await fetch(url, opt);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const isAdmin = (u) => u && parseInt(u.nivel_acceso ?? 0) >= NIVEL_ADMIN;
const fmt$    = (v)  => `$${Number(v ?? 0).toFixed(2)}`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES REUTILIZABLES
// ─────────────────────────────────────────────────────────────────────────────

/** Barra superior */
function TopBar({ title, onBack, rightLabel, onRight, color = C.primary }) {
  return (
    <View style={[tb.wrap, { backgroundColor: color }]}>
      <View style={tb.overlay} />
      <View style={tb.bar}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={tb.iconBtn} activeOpacity={0.8}>
            <Text style={tb.iconTxt}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={tb.iconBtn} />
        )}

        <View style={tb.titleWrap}>
          <Text style={tb.title} numberOfLines={1}>{title}</Text>
        </View>

        {onRight ? (
          <TouchableOpacity onPress={onRight} style={tb.iconBtn} activeOpacity={0.8}>
            <Text style={tb.iconTxt}>{rightLabel ?? '+'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={tb.iconBtn} />
        )}
      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  wrap: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
    ...SHADOW,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING - 4,
    paddingTop: 12,
    paddingBottom: 14,
    minHeight: 64,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: {
    color: C.white,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  iconTxt: {
    color: C.white,
    fontSize: 21,
    fontWeight: '800',
  },
});


/** Tarjeta de lista genérica */
function ListCard({ title, subtitle, badge, badgeColor, onPress, icon }) {
  return (
    <TouchableOpacity style={lc.card} onPress={onPress} activeOpacity={0.85}>
      {icon ? (
        <View style={lc.iconBox}>
          <Text style={lc.icon}>{icon}</Text>
        </View>
      ) : null}

      <View style={lc.info}>
        <Text style={lc.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={lc.sub} numberOfLines={2}>{subtitle}</Text> : null}
      </View>

      {badge != null ? (
        <View style={[lc.badge, { backgroundColor: badgeColor ?? C.primary }]}>
          <Text style={lc.badgeTxt}>{badge}</Text>
        </View>
      ) : (
        <Text style={lc.arrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const lc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    marginHorizontal: H_PADDING,
    marginBottom: 10,
    borderRadius: CARD_RADIUS,
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
  sub: {
    fontSize: 12.5,
    color: C.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  badge: {
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },
  arrow: {
    color: C.textLight,
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 6,
  },
});


/** Input genérico */
function Field({ label, value, onChangeText, placeholder, keyboardType, secure, multiline }) {
  return (
    <View style={fi.wrap}>
      {label ? <Text style={fi.label}>{label}</Text> : null}

      <TextInput
        style={[fi.input, multiline && fi.inputMulti]}
        value={String(value ?? '')}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ''}
        placeholderTextColor={C.textLight}
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={!!secure}
        multiline={!!multiline}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const fi = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: C.textSoft,
    marginBottom: 6,
    fontWeight: '700',
    marginLeft: 2,
  },
  input: {
    minHeight: INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
    backgroundColor: C.inputBg,
  },
  inputMulti: {
    minHeight: 92,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});


/** Botón primario */
function Btn({ label, onPress, color, disabled, small }) {
  return (
    <TouchableOpacity
      style={[
        btn.base,
        { backgroundColor: color ?? C.primary },
        disabled && btn.dis,
        small && btn.small,
      ]}
      onPress={onPress}
      disabled={!!disabled}
      activeOpacity={0.88}
    >
      <Text style={[btn.txt, small && btn.smallTxt]}>{label}</Text>
    </TouchableOpacity>
  );
}

const btn = StyleSheet.create({
  base: {
    minHeight: BTN_HEIGHT,
    backgroundColor: C.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
    ...SHADOW,
  },
  dis: {
    opacity: 0.5,
  },
  txt: {
    color: C.white,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  small: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 0,
  },
  smallTxt: {
    fontSize: 13,
  },
});


/** Mensaje vacío */
const Empty = ({ msg }) => (
  <View style={empty.box}>
    <View style={empty.iconWrap}>
      <Text style={empty.icon}>📭</Text>
    </View>
    <Text style={empty.title}>No hay datos disponibles</Text>
    <Text style={empty.msg}>{msg ?? 'Sin registros'}</Text>
  </View>
);

const empty = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 42,
  },
  iconWrap: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: C.bgSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 34,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },
  msg: {
    color: C.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});


/** Indicador de carga */
const Loader = () => (
  <View style={loader.box}>
    <ActivityIndicator size="large" color={C.primary} />
    <Text style={loader.txt}>Cargando información...</Text>
  </View>
);

const loader = StyleSheet.create({
  box: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  txt: {
    marginTop: 12,
    color: C.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});


/** Chip de estado */
function StatusChip({ label, color }) {
  return (
    <View style={[sc.wrap, { backgroundColor: color + '18', borderColor: color + '33' }]}>
      <Text style={[sc.txt, { color }]}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  wrap: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  txt: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
});

const estadoColor = {
  pendiente: C.warning,
  pagado: C.success,
  cancelado: C.danger,
  emitida: C.primary,
  autorizada: C.success,
  anulada: C.danger,
};

// ─────────────────────────────────────────────────────────────────────────────
// PANTALLA LOGIN
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen() {
  const { signIn } = useAuth();
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    const lg = loginVal.trim();

    if (!lg) return setError('Ingrese su usuario o email');
    if (!password) return setError('Ingrese su contraseña');

    setLoading(true);
    try {
      const d = await api('usuario_login', {}, 'POST', { login: lg, password });
      await signIn(d.usuario);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={ls.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={ls.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={ls.hero}>
            <View style={ls.logoOuter}>
              <View style={ls.logoInner}>
                <Text style={ls.logoTxt}>🏢</Text>
              </View>
            </View>

            <Text style={ls.appName}>App Móvil</Text>
            <Text style={ls.appSub}>Sistema de Gestión Empresarial</Text>
            <Text style={ls.appMini}>
              Accede a tu panel para administrar la información de forma rápida y segura
            </Text>
          </View>

          <View style={ls.card}>
            <Text style={ls.cardEyebrow}>Bienvenido</Text>
            <Text style={ls.cardTitle}>Iniciar sesión</Text>
            <Text style={ls.cardSub}>
              Ingresa tus credenciales para continuar
            </Text>

            {!!error && (
              <View style={ls.errBox}>
                <Text style={ls.errIcon}>⚠️</Text>
                <Text style={ls.errTxt}>{error}</Text>
              </View>
            )}

            <Text style={ls.lbl}>Usuario o Email</Text>
            <View style={ls.inputRow}>
              <Text style={ls.inputIco}>👤</Text>
              <TextInput
                style={ls.input}
                value={loginVal}
                onChangeText={setLoginVal}
                placeholder="Ingrese su usuario"
                placeholderTextColor={C.textLight}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={ls.lbl}>Contraseña</Text>
            <View style={ls.inputRow}>
              <Text style={ls.inputIco}>🔒</Text>
              <TextInput
                style={ls.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={C.textLight}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[ls.loginBtn, loading && ls.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={ls.loginBtnTxt}>Ingresar al sistema</Text>
              )}
            </TouchableOpacity>

            <View style={ls.demoBox}>
              <Text style={ls.demoLabel}>Acceso de prueba</Text>
              <Text style={ls.demo}>
                Usuario: <Text style={ls.demoStrong}>admin</Text>
              </Text>
              <Text style={ls.demo}>
                Contraseña: <Text style={ls.demoStrong}>password</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ls = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.primaryDark,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 26,
    backgroundColor: C.primaryDark,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logoInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTxt: {
    fontSize: 34,
  },
  appName: {
    color: C.white,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  appSub: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  appMini: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12.5,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: C.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: C.text,
  },
  cardSub: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 18,
  },
  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  errIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  errTxt: {
    flex: 1,
    color: C.danger,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  lbl: {
    fontSize: 13,
    color: C.textSoft,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: C.cardAlt,
  },
  inputIco: {
    fontSize: 17,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: C.text,
  },
  loginBtn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    ...SHADOW,
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnTxt: {
    color: C.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  demoBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  demoLabel: {
    textAlign: 'center',
    color: C.textSoft,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demo: {
    textAlign: 'center',
    color: C.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  demoStrong: {
    color: C.primary,
    fontWeight: '800',
  },
});
// ─────────────────────────────────────────────────────────────────────────────
// HOOK GENÉRICO DE LISTA
// ─────────────────────────────────────────────────────────────────────────────
function useList(op, params = {}) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    try {
      const d = await api(op, params);
      setItems(Array.isArray(d) ? d : []);
    } catch (e) {
      Alert.alert('Error al cargar', e.message);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [op, key]);

  useEffect(() => { load(); }, [load]);
  return { items, loading, refresh, setRefresh, reload: load };
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVEGACIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
function MainNavigator() {
  const { usuario, signOut } = useAuth();
  const admin = isAdmin(usuario);

  const adminTabs = [
    { key:'dashboard',   label:'Inicio',     icon:'🏠' },
    { key:'empresas',    label:'Empresas',   icon:'🏢' },
    { key:'perfiles',    label:'Perfiles',   icon:'🪪' },
    { key:'usuarios',    label:'Usuarios',   icon:'👤' },
    { key:'categorias',  label:'Categ.',     icon:'🗂️' },
    { key:'proveedores', label:'Proveed.',   icon:'🚚' },
    { key:'clientes',    label:'Clientes',   icon:'👥' },
    { key:'productos',   label:'Productos',  icon:'📦' },
    { key:'formas_pago', label:'F.Pago',     icon:'💳' },
    { key:'ordenes',     label:'Órdenes',    icon:'🧾' },
    { key:'facturas',    label:'Facturas',   icon:'🧮' },
  ];

  const userTabs = [
    { key:'dashboard', label:'Inicio',    icon:'🏠' },
    { key:'clientes',  label:'Clientes',  icon:'👥' },
    { key:'productos', label:'Productos', icon:'📦' },
    { key:'ordenes',   label:'Órdenes',   icon:'🧾' },
    { key:'facturas',  label:'Facturas',  icon:'🧮' },
  ];

  const tabs = admin ? adminTabs : userTabs;

  const [active, setActive] = useState('dashboard');
  const [stack, setStack] = useState([]);

  const navigate = (screen, params) => setStack(s => [...s, { screen, params }]);
  const goBack = () => setStack(s => s.slice(0, -1));
  const resetStack = () => setStack([]);

  const current = stack.length > 0 ? stack[stack.length - 1] : null;

  function renderContent() {
    if (current) {
      const { screen, params } = current;
      const cp = { params, navigate, goBack, resetStack, usuario, admin };

      switch (screen) {
        case 'empresa_detalle': return <EmpresaDetalle {...cp} />;
        case 'perfil_detalle': return <PerfilDetalle {...cp} />;
        case 'usuario_detalle': return <UsuarioDetalle {...cp} />;
        case 'categoria_detalle': return <CategoriaDetalle {...cp} />;
        case 'proveedor_detalle': return <ProveedorDetalle {...cp} />;
        case 'cliente_detalle': return <ClienteDetalle {...cp} />;
        case 'producto_detalle': return <ProductoDetalle {...cp} />;
        case 'forma_pago_detalle': return <FormaPagoDetalle {...cp} />;
        case 'orden_detalle': return <OrdenDetalle {...cp} />;
        case 'factura_detalle': return <FacturaDetalle {...cp} />;
        default: return <Empty msg="Pantalla no encontrada" />;
      }
    }

    const p = { navigate, usuario, admin };

    switch (active) {
      case 'dashboard':   return <DashboardScreen {...p} signOut={signOut} />;
      case 'empresas':    return <EmpresasScreen {...p} />;
      case 'perfiles':    return <PerfilesScreen {...p} />;
      case 'usuarios':    return <UsuariosScreen {...p} />;
      case 'categorias':  return <CategoriasScreen {...p} />;
      case 'proveedores': return <ProveedoresScreen {...p} />;
      case 'clientes':    return <ClientesScreen {...p} />;
      case 'productos':   return <ProductosScreen {...p} />;
      case 'formas_pago': return <FormasPagoScreen {...p} />;
      case 'ordenes':     return <OrdenesScreen {...p} />;
      case 'facturas':    return <FacturasScreen {...p} />;
      default:            return <DashboardScreen {...p} signOut={signOut} />;
    }
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      <View style={{ flex:1 }}>
        {renderContent()}
      </View>

      {!current && (
        <View style={nav.wrap}>
          <View style={nav.tabBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={nav.tabScroll}
            >
              {tabs.map(t => {
                const sel = active === t.key;

                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[nav.tab, sel && nav.tabSel]}
                    onPress={() => {
                      resetStack();
                      setActive(t.key);
                    }}
                    activeOpacity={0.88}
                  >
                    <View style={[nav.iconWrap, sel && nav.iconWrapSel]}>
                      <Text style={nav.tabIcon}>{t.icon}</Text>
                    </View>

                    <Text style={[nav.tabLbl, sel && nav.tabLblSel]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const nav = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingBottom: 6,
    paddingTop: 4,
  },
  tabBar: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 6,
    ...SHADOW,
  },
  tabScroll: {
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 72,
    marginHorizontal: 2,
  },
  tabSel: {
    backgroundColor: C.primaryLight,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bgSoft,
  },
  iconWrapSel: {
    backgroundColor: C.white,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLbl: {
    fontSize: 10.5,
    color: C.tabInactive,
    marginTop: 6,
    fontWeight: '700',
  },
  tabLblSel: {
    color: C.primary,
    fontWeight: '800',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function DashboardScreen({ usuario, admin, signOut }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api('reporte_resumen', { id_empresa: usuario?.id_empresa ?? 1 });
      setData(r);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, [usuario]);

  useEffect(() => { load(); }, [load]);

  const cards = data ? [
    { label: 'Productos', value: data.total_productos ?? 0, icon: '📦', bg: C.primary, light: C.primaryLight },
    { label: 'Clientes', value: data.total_clientes ?? 0, icon: '👥', bg: C.success, light: '#EAF7EE' },
    { label: 'Proveedores', value: data.total_proveedores ?? 0, icon: '🚚', bg: C.purple, light: '#F4EAFE' },
    { label: 'Órdenes', value: data.total_ordenes ?? 0, icon: '🧾', bg: C.accent, light: '#FFF4D6' },
    { label: 'Ventas', value: fmt$(data.ventas_pagadas ?? 0), icon: '💰', bg: C.teal, light: '#E6F7F4' },
    { label: 'Stock Bajo', value: data.productos_stock_bajo ?? 0, icon: '⚠️', bg: C.danger, light: '#FDECEC' },
  ] : [];

  const quickActions = admin
    ? [
        { label: 'Nuevo producto', icon: '➕', color: C.primary },
        { label: 'Nuevo cliente', icon: '👤', color: C.success },
        { label: 'Nuevo proveedor', icon: '🏬', color: C.purple },
      ]
    : [
        { label: 'Mis clientes', icon: '👥', color: C.primary },
        { label: 'Productos', icon: '📦', color: C.success },
        { label: 'Órdenes', icon: '🧾', color: C.accent },
      ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={ds.hero}>
        <View style={ds.heroOverlay} />

        <View style={ds.heroTop}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={ds.welcome}>Bienvenido de nuevo</Text>
            <Text style={ds.name}>{usuario?.nombres ?? usuario?.username ?? 'Usuario'}</Text>

            <View style={ds.roleBadge}>
              <Text style={ds.roleText}>
                {admin ? 'Administrador' : (usuario?.perfil ?? 'Usuario')}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={signOut} style={ds.logout} activeOpacity={0.85}>
            <Text style={ds.logoutTxt}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={ds.companyBox}>
          <Text style={ds.companyLabel}>Empresa activa</Text>
          <Text style={ds.companyName}>{usuario?.empresa ?? 'No definida'}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={ds.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={() => { setRefresh(true); load(); }}
            colors={[C.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? <Loader /> : (
          <>
            <Text style={ds.sectionTitle}>Resumen general</Text>

            <View style={ds.grid}>
              {cards.map((c, i) => (
                <View key={i} style={ds.card}>
                  <View style={[ds.cardIconWrap, { backgroundColor: c.light }]}>
                    <Text style={ds.cardIcon}>{c.icon}</Text>
                  </View>

                  <Text style={ds.cardVal} numberOfLines={1}>{c.value}</Text>
                  <Text style={ds.cardLbl}>{c.label}</Text>

                  <View style={[ds.cardLine, { backgroundColor: c.bg }]} />
                </View>
              ))}
            </View>

            <Text style={ds.sectionTitle}>Accesos rápidos</Text>

            <View style={ds.quickGrid}>
              {quickActions.map((a, i) => (
                <TouchableOpacity key={i} style={ds.quickCard} activeOpacity={0.85}>
                  <View style={[ds.quickIconWrap, { backgroundColor: a.color + '18' }]}>
                    <Text style={ds.quickIcon}>{a.icon}</Text>
                  </View>
                  <Text style={ds.quickLbl}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={ds.infoBox}>
              <Text style={ds.infoTitle}>Información de sesión</Text>

              <View style={ds.infoRowWrap}>
                <Text style={ds.infoKey}>Empresa</Text>
                <Text style={ds.infoVal}>{usuario?.empresa ?? '—'}</Text>
              </View>

              <View style={ds.infoRowWrap}>
                <Text style={ds.infoKey}>Perfil</Text>
                <Text style={ds.infoVal}>{usuario?.perfil ?? '—'}</Text>
              </View>

              <View style={ds.infoRowWrap}>
                <Text style={ds.infoKey}>Email</Text>
                <Text style={ds.infoVal}>{usuario?.email ?? '—'}</Text>
              </View>

              <View style={ds.infoRowWrap}>
                <Text style={ds.infoKey}>Nivel</Text>
                <Text style={ds.infoVal}>{usuario?.nivel_acceso ?? '—'}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const ds = StyleSheet.create({
  hero: {
    backgroundColor: C.primaryDark,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    ...SHADOW,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcome: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontWeight: '600',
  },
  name: {
    color: C.white,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  roleText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },
  logout: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logoutTxt: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },
  companyBox: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  companyLabel: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 12,
    fontWeight: '700',
  },
  companyName: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  card: {
    width: (SW - 44) / 2,
    margin: 6,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW,
  },
  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardVal: {
    fontSize: 22,
    fontWeight: '900',
    color: C.text,
  },
  cardLbl: {
    fontSize: 12.5,
    color: C.textMuted,
    marginTop: 5,
  },
  cardLine: {
    height: 4,
    borderRadius: 999,
    marginTop: 14,
  },
  quickGrid: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  quickCard: {
    width: (SW - 44) / 3,
    margin: 6,
    backgroundColor: C.card,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickIcon: {
    fontSize: 20,
  },
  quickLbl: {
    fontSize: 12,
    color: C.textSoft,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  infoBox: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.text,
    marginBottom: 14,
  },
  infoRowWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  infoKey: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '700',
  },
  infoVal: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
    fontSize: 13,
    color: C.text,
    fontWeight: '800',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// EMPRESAS  (solo admin)
// ─────────────────────────────────────────────────────────────────────────────
function EmpresasScreen({ navigate, admin }) {
  const { items, loading, refresh, setRefresh, reload } = useList('empresas_listar');
  return (
    <View style={{ flex:1 }}>
      <TopBar title="Empresas" onRight={admin ? () => navigate('empresa_detalle',{modo:'nuevo'}) : null} />
      {loading ? <Loader /> : (
        <FlatList data={items} keyExtractor={i=>String(i.id_empresa)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin empresas" />}
          contentContainerStyle={{ paddingVertical:8 }}
          renderItem={({ item:it }) => (
            <ListCard icon="🏢" title={it.razon_social} subtitle={`RUC: ${it.ruc}`}
              badge={it.activo?'Activo':'Inactivo'} badgeColor={it.activo?C.success:C.danger}
              onPress={() => navigate('empresa_detalle',{modo:'editar',item:it})} />
          )} />
      )}
    </View>
  );
}
function EmpresaDetalle({ params, goBack }) {
  const edit = params?.modo === 'editar';
  const orig = params?.item ?? {};
  const [f, setF] = useState({
    razon_social: orig.razon_social ?? '',
    ruc:          orig.ruc          ?? '',
    direccion:    orig.direccion    ?? '',
    telefono:     orig.telefono     ?? '',
    email:        orig.email        ?? '',
  });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.razon_social || !f.ruc) return Alert.alert('Error','Razón social y RUC son requeridos');
    setSaving(true);
    try {
      edit
        ? await api('empresa_actualizar',{}, 'POST', { ...f, id_empresa:orig.id_empresa, activo:orig.activo??1 })
        : await api('empresa_insertar',  {}, 'POST', { ...f, activo:1 });
      goBack();
    } catch(e){ Alert.alert('Error',e.message); } finally{ setSaving(false); }
  }
  async function del() {
    Alert.alert('Eliminar','¿Seguro?',[{text:'Cancelar',style:'cancel'},{text:'Eliminar',style:'destructive',onPress:async()=>{
      try{ await api('empresa_eliminar',{},'POST',{id_empresa:orig.id_empresa}); goBack(); } catch(e){ Alert.alert('Error',e.message); }
    }}]);
  }
  return (
    <View style={{flex:1}}>
      <TopBar title={edit?'Editar Empresa':'Nueva Empresa'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Field label="Razón Social *" value={f.razon_social} onChangeText={v=>setF(p=>({...p,razon_social:v}))} />
        <Field label="RUC *"          value={f.ruc}          onChangeText={v=>setF(p=>({...p,ruc:v}))} keyboardType="numeric" />
        <Field label="Dirección"      value={f.direccion}    onChangeText={v=>setF(p=>({...p,direccion:v}))} />
        <Field label="Teléfono"       value={f.telefono}     onChangeText={v=>setF(p=>({...p,telefono:v}))} keyboardType="phone-pad" />
        <Field label="Email"          value={f.email}        onChangeText={v=>setF(p=>({...p,email:v}))} keyboardType="email-address" />
        <Btn label={saving?'Guardando...':(edit?'Actualizar':'Crear Empresa')} onPress={save} disabled={saving} />
        {edit && <Btn label="Eliminar Empresa" onPress={del} color={C.danger} />}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFILES  (solo admin)
// ─────────────────────────────────────────────────────────────────────────────
function PerfilesScreen({ navigate, admin }) {
  const { items, loading, refresh, setRefresh, reload } = useList('perfiles_listar');
  return (
    <View style={{flex:1}}>
      <TopBar title="Perfiles" onRight={admin ? ()=>navigate('perfil_detalle',{modo:'nuevo'}) : null} />
      {loading ? <Loader /> : (
        <FlatList data={items} keyExtractor={i=>String(i.id_perfil)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin perfiles" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="🎭" title={it.nombre} subtitle={it.descripcion}
              badge={`Nivel ${it.nivel_acceso}`} badgeColor={C.purple}
              onPress={()=>navigate('perfil_detalle',{modo:'editar',item:it})} />
          )} />
      )}
    </View>
  );
}
function PerfilDetalle({ params, goBack }) {
  const edit = params?.modo === 'editar';
  const orig = params?.item ?? {};
  const [f, setF] = useState({ nombre:orig.nombre??'', descripcion:orig.descripcion??'', nivel_acceso:String(orig.nivel_acceso??'1') });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.nombre) return Alert.alert('Error','Nombre requerido');
    setSaving(true);
    try {
      const body = { ...f, nivel_acceso:parseInt(f.nivel_acceso), activo:1 };
      edit
        ? await api('perfil_actualizar',{},'POST',{...body,id_perfil:orig.id_perfil})
        : await api('perfil_insertar',  {},'POST',body);
      goBack();
    } catch(e){ Alert.alert('Error',e.message); } finally{ setSaving(false); }
  }
  async function del() {
    Alert.alert('Eliminar','¿Seguro?',[{text:'Cancelar',style:'cancel'},{text:'Eliminar',style:'destructive',onPress:async()=>{
      try{ await api('perfil_eliminar',{},'POST',{id_perfil:orig.id_perfil}); goBack(); } catch(e){ Alert.alert('Error',e.message); }
    }}]);
  }
  return (
    <View style={{flex:1}}>
      <TopBar title={edit?'Editar Perfil':'Nuevo Perfil'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Field label="Nombre *"          value={f.nombre}       onChangeText={v=>setF(p=>({...p,nombre:v}))} />
        <Field label="Descripción"       value={f.descripcion}  onChangeText={v=>setF(p=>({...p,descripcion:v}))} multiline />
        <Field label="Nivel acceso (1-10)"value={f.nivel_acceso} onChangeText={v=>setF(p=>({...p,nivel_acceso:v}))} keyboardType="numeric" />
        <Btn label={saving?'Guardando...':(edit?'Actualizar':'Crear Perfil')} onPress={save} disabled={saving} />
        {edit && <Btn label="Eliminar Perfil" onPress={del} color={C.danger} />}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USUARIOS  (solo admin)
// ─────────────────────────────────────────────────────────────────────────────
function UsuariosScreen({ navigate, admin }) {
  const { items, loading, refresh, setRefresh, reload } = useList('usuarios_listar');
  return (
    <View style={{flex:1}}>
      <TopBar title="Usuarios" onRight={admin ? ()=>navigate('usuario_detalle',{modo:'nuevo'}) : null} />
      {loading ? <Loader /> : (
        <FlatList data={items} keyExtractor={i=>String(i.id_usuario)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin usuarios" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="👤"
              title={`${it.nombres} ${it.apellidos}`}
              subtitle={`@${it.username} · ${it.perfil}`}
              badge={it.activo?'Activo':'Inactivo'} badgeColor={it.activo?C.success:C.danger}
              onPress={()=>navigate('usuario_detalle',{modo:'editar',item:it})} />
          )} />
      )}
    </View>
  );
}
function UsuarioDetalle({ params, goBack }) {
  const edit = params?.modo === 'editar';
  const orig = params?.item ?? {};
  const [f, setF] = useState({
    username:   orig.username   ?? '',
    email:      orig.email      ?? '',
    nombres:    orig.nombres    ?? '',
    apellidos:  orig.apellidos  ?? '',
    password:   '',
    id_empresa: String(orig.id_empresa ?? '1'),
    id_perfil:  String(orig.id_perfil  ?? '1'),
    activo:     String(orig.activo ?? '1'),
  });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!edit && !f.password) return Alert.alert('Error','Contraseña requerida');
    setSaving(true);
    try {
      const body = { ...f, id_empresa:parseInt(f.id_empresa), id_perfil:parseInt(f.id_perfil), activo:parseInt(f.activo) };
      if (!f.password) delete body.password;
      edit
        ? await api('usuario_actualizar',{},'POST',{...body,id_usuario:orig.id_usuario})
        : await api('usuario_insertar',  {},'POST',body);
      goBack();
    } catch(e){ Alert.alert('Error',e.message); } finally{ setSaving(false); }
  }
  async function del() {
    Alert.alert('Eliminar','¿Seguro?',[{text:'Cancelar',style:'cancel'},{text:'Eliminar',style:'destructive',onPress:async()=>{
      try{ await api('usuario_eliminar',{},'POST',{id_usuario:orig.id_usuario}); goBack(); } catch(e){ Alert.alert('Error',e.message); }
    }}]);
  }
  return (
    <View style={{flex:1}}>
      <TopBar title={edit?'Editar Usuario':'Nuevo Usuario'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Field label="Nombres *"   value={f.nombres}   onChangeText={v=>setF(p=>({...p,nombres:v}))} />
        <Field label="Apellidos"   value={f.apellidos} onChangeText={v=>setF(p=>({...p,apellidos:v}))} />
        <Field label="Username *"  value={f.username}  onChangeText={v=>setF(p=>({...p,username:v}))} />
        <Field label="Email"       value={f.email}     onChangeText={v=>setF(p=>({...p,email:v}))} keyboardType="email-address" />
        <Field label={edit?'Nueva contraseña (vacío = no cambiar)':'Contraseña *'} value={f.password} onChangeText={v=>setF(p=>({...p,password:v}))} secure />
        <Field label="ID Empresa"  value={f.id_empresa}onChangeText={v=>setF(p=>({...p,id_empresa:v}))} keyboardType="numeric" />
        <Field label="ID Perfil"   value={f.id_perfil} onChangeText={v=>setF(p=>({...p,id_perfil:v}))}  keyboardType="numeric" />
        <Btn label={saving?'Guardando...':(edit?'Actualizar':'Crear Usuario')} onPress={save} disabled={saving} />
        {edit && <Btn label="Eliminar Usuario" onPress={del} color={C.danger} />}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS
// ─────────────────────────────────────────────────────────────────────────────
function CategoriasScreen({ navigate, admin, usuario }) {
  const { items, loading, refresh, setRefresh, reload } = useList('categorias_listar',{id_empresa:usuario?.id_empresa??1});
  return (
    <View style={{flex:1}}>
      <TopBar title="Categorías" onRight={admin ? ()=>navigate('categoria_detalle',{modo:'nuevo',id_empresa:usuario?.id_empresa??1}) : null} />
      {loading ? <Loader /> : (
        <FlatList data={items} keyExtractor={i=>String(i.id_categoria)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin categorías" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="🗂️" title={it.nombre} subtitle={it.descripcion}
              badge={it.activo?'Activa':'Inactiva'} badgeColor={it.activo?C.success:C.danger}
              onPress={()=>navigate('categoria_detalle',{modo:'editar',item:it})} />
          )} />
      )}
    </View>
  );
}
function CategoriaDetalle({ params, goBack, usuario }) {
  const edit = params?.modo === 'editar';
  const orig = params?.item ?? {};
  const [f, setF] = useState({ nombre:orig.nombre??'', descripcion:orig.descripcion??'', id_empresa:String(orig.id_empresa??params?.id_empresa??usuario?.id_empresa??1) });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.nombre) return Alert.alert('Error','Nombre requerido');
    setSaving(true);
    try {
      const body = { ...f, activo:1, id_empresa:parseInt(f.id_empresa) };
      edit
        ? await api('categoria_actualizar',{},'POST',{...body,id_categoria:orig.id_categoria})
        : await api('categoria_insertar',  {},'POST',body);
      goBack();
    } catch(e){ Alert.alert('Error',e.message); } finally{ setSaving(false); }
  }
  return (
    <View style={{flex:1}}>
      <TopBar title={edit?'Editar Categoría':'Nueva Categoría'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Field label="Nombre *"    value={f.nombre}      onChangeText={v=>setF(p=>({...p,nombre:v}))} />
        <Field label="Descripción" value={f.descripcion} onChangeText={v=>setF(p=>({...p,descripcion:v}))} multiline />
        <Btn label={saving?'Guardando...':(edit?'Actualizar':'Crear Categoría')} onPress={save} disabled={saving} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVEEDORES  (solo admin puede crear/editar)
// ─────────────────────────────────────────────────────────────────────────────
function ProveedoresScreen({ navigate, admin, usuario }) {
  const { items, loading, refresh, setRefresh, reload } = useList('proveedores_listar',{id_empresa:usuario?.id_empresa??1});
  return (
    <View style={{flex:1}}>
      <TopBar title="Proveedores" onRight={admin ? ()=>navigate('proveedor_detalle',{modo:'nuevo',id_empresa:usuario?.id_empresa??1}) : null} />
      {loading ? <Loader /> : (
        <FlatList data={items} keyExtractor={i=>String(i.id_proveedor)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin proveedores" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="🏭" title={it.razon_social} subtitle={it.email??it.telefono}
              badge={it.activo?'Activo':'Inactivo'} badgeColor={it.activo?C.success:C.danger}
              onPress={()=>navigate('proveedor_detalle',{modo:'editar',item:it})} />
          )} />
      )}
    </View>
  );
}
function ProveedorDetalle({ params, goBack, admin, usuario }) {
  const edit = params?.modo === 'editar';
  const orig = params?.item ?? {};
  const [f, setF] = useState({
    razon_social:orig.razon_social??'', ruc:orig.ruc??'', contacto:orig.contacto??'',
    email:orig.email??'', telefono:orig.telefono??'', direccion:orig.direccion??'',
    categoria:orig.categoria??'', id_empresa:String(orig.id_empresa??params?.id_empresa??usuario?.id_empresa??1),
  });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.razon_social) return Alert.alert('Error','Razón social requerida');
    setSaving(true);
    try {
      const body = { ...f, activo:1, id_empresa:parseInt(f.id_empresa) };
      edit
        ? await api('proveedor_actualizar',{},'POST',{...body,id_proveedor:orig.id_proveedor})
        : await api('proveedor_insertar',  {},'POST',body);
      goBack();
    } catch(e){ Alert.alert('Error',e.message); } finally{ setSaving(false); }
  }
  async function del() {
    Alert.alert('Eliminar','¿Seguro?',[{text:'Cancelar',style:'cancel'},{text:'Eliminar',style:'destructive',onPress:async()=>{
      try{ await api('proveedor_eliminar',{},'POST',{id_proveedor:orig.id_proveedor}); goBack(); } catch(e){ Alert.alert('Error',e.message); }
    }}]);
  }
  return (
    <View style={{flex:1}}>
      <TopBar title={edit?'Editar Proveedor':'Nuevo Proveedor'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Field label="Razón Social *" value={f.razon_social} onChangeText={v=>setF(p=>({...p,razon_social:v}))} />
        <Field label="RUC"            value={f.ruc}          onChangeText={v=>setF(p=>({...p,ruc:v}))} keyboardType="numeric" />
        <Field label="Contacto"       value={f.contacto}     onChangeText={v=>setF(p=>({...p,contacto:v}))} />
        <Field label="Email"          value={f.email}        onChangeText={v=>setF(p=>({...p,email:v}))} keyboardType="email-address" />
        <Field label="Teléfono"       value={f.telefono}     onChangeText={v=>setF(p=>({...p,telefono:v}))} keyboardType="phone-pad" />
        <Field label="Dirección"      value={f.direccion}    onChangeText={v=>setF(p=>({...p,direccion:v}))} />
        <Field label="Categoría"      value={f.categoria}    onChangeText={v=>setF(p=>({...p,categoria:v}))} />
        {admin && <Btn label={saving?'Guardando...':(edit?'Actualizar':'Crear Proveedor')} onPress={save} disabled={saving} />}
        {edit && admin && <Btn label="Eliminar Proveedor" onPress={del} color={C.danger} />}
        {!admin && <Text style={{color:C.textLight,textAlign:'center',marginTop:8}}>Solo lectura</Text>}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTES  (todos pueden crear, admin puede eliminar)
// ─────────────────────────────────────────────────────────────────────────────
function ClientesScreen({ navigate, usuario }) {
  const { items, loading, refresh, setRefresh, reload } = useList('clientes_listar',{id_empresa:usuario?.id_empresa??1});
  return (
    <View style={{flex:1}}>
      <TopBar title="Clientes" onRight={()=>navigate('cliente_detalle',{modo:'nuevo',id_empresa:usuario?.id_empresa??1})} />
      {loading ? <Loader /> : (
        <FlatList data={items} keyExtractor={i=>String(i.id_cliente)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin clientes" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="🤝"
              title={`${it.nombres} ${it.apellidos??''}`}
              subtitle={it.cedula_ruc??it.email}
              badge={it.activo?'Activo':'Inactivo'} badgeColor={it.activo?C.success:C.danger}
              onPress={()=>navigate('cliente_detalle',{modo:'editar',item:it})} />
          )} />
      )}
    </View>
  );
}
function ClienteDetalle({ params, goBack, admin, usuario }) {
  const edit = params?.modo === 'editar';
  const orig = params?.item ?? {};
  const [f, setF] = useState({
    nombres:orig.nombres??'', apellidos:orig.apellidos??'', cedula_ruc:orig.cedula_ruc??'',
    email:orig.email??'', telefono:orig.telefono??'', direccion:orig.direccion??'',
    tipo_cliente:orig.tipo_cliente??'natural', limite_credito:String(orig.limite_credito??'0'),
    id_empresa:String(orig.id_empresa??params?.id_empresa??usuario?.id_empresa??1),
  });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.nombres) return Alert.alert('Error','Nombres requeridos');
    setSaving(true);
    try {
      const body = { ...f, activo:1, id_empresa:parseInt(f.id_empresa), limite_credito:parseFloat(f.limite_credito) };
      edit
        ? await api('cliente_actualizar',{},'POST',{...body,id_cliente:orig.id_cliente})
        : await api('cliente_insertar',  {},'POST',body);
      goBack();
    } catch(e){ Alert.alert('Error',e.message); } finally{ setSaving(false); }
  }
  async function del() {
    Alert.alert('Eliminar','¿Seguro?',[{text:'Cancelar',style:'cancel'},{text:'Eliminar',style:'destructive',onPress:async()=>{
      try{ await api('cliente_eliminar',{},'POST',{id_cliente:orig.id_cliente}); goBack(); } catch(e){ Alert.alert('Error',e.message); }
    }}]);
  }
  return (
    <View style={{flex:1}}>
      <TopBar title={edit?'Editar Cliente':'Nuevo Cliente'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Field label="Nombres *"        value={f.nombres}        onChangeText={v=>setF(p=>({...p,nombres:v}))} />
        <Field label="Apellidos"        value={f.apellidos}      onChangeText={v=>setF(p=>({...p,apellidos:v}))} />
        <Field label="Cédula / RUC"     value={f.cedula_ruc}     onChangeText={v=>setF(p=>({...p,cedula_ruc:v}))} keyboardType="numeric" />
        <Field label="Email"            value={f.email}          onChangeText={v=>setF(p=>({...p,email:v}))} keyboardType="email-address" />
        <Field label="Teléfono"         value={f.telefono}       onChangeText={v=>setF(p=>({...p,telefono:v}))} keyboardType="phone-pad" />
        <Field label="Dirección"        value={f.direccion}      onChangeText={v=>setF(p=>({...p,direccion:v}))} />
        <Field label="Límite crédito"   value={f.limite_credito} onChangeText={v=>setF(p=>({...p,limite_credito:v}))} keyboardType="numeric" />
        <Btn label={saving?'Guardando...':(edit?'Actualizar':'Crear Cliente')} onPress={save} disabled={saving} />
        {edit && admin && <Btn label="Eliminar Cliente" onPress={del} color={C.danger} />}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────────────────────────────────────────
function ProductosScreen({ navigate, admin, usuario }) {
  const { items, loading, refresh, setRefresh, reload } = useList('productos_listar',{id_empresa:usuario?.id_empresa??1});
  return (
    <View style={{flex:1}}>
      <TopBar title="Productos" onRight={admin ? ()=>navigate('producto_detalle',{modo:'nuevo',id_empresa:usuario?.id_empresa??1}) : null} />
      {loading ? <Loader /> : (
        <FlatList data={items} keyExtractor={i=>String(i.id_producto)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin productos" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="📦"
              title={it.nombre}
              subtitle={`${it.codigo} · Stock: ${it.stock} · ${fmt$(it.precio_venta)}`}
              badge={it.stock<=it.stock_minimo?'⚠️ Bajo':'OK'}
              badgeColor={it.stock<=it.stock_minimo?C.danger:C.success}
              onPress={()=>navigate('producto_detalle',{modo:'editar',item:it})} />
          )} />
      )}
    </View>
  );
}
function ProductoDetalle({ params, goBack, admin, usuario }) {
  const edit = params?.modo === 'editar';
  const orig = params?.item ?? {};
  const [f, setF] = useState({
    nombre:orig.nombre??'', codigo:orig.codigo??'', descripcion:orig.descripcion??'',
    precio_compra:String(orig.precio_compra??'0'), precio_venta:String(orig.precio_venta??'0'),
    stock:String(orig.stock??'0'), stock_minimo:String(orig.stock_minimo??'0'),
    unidad_medida:orig.unidad_medida??'UNIDAD',
    id_empresa:String(orig.id_empresa??params?.id_empresa??usuario?.id_empresa??1),
    id_categoria:String(orig.id_categoria??''), id_proveedor:String(orig.id_proveedor??''),
  });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.nombre||!f.codigo) return Alert.alert('Error','Nombre y código requeridos');
    setSaving(true);
    try {
      const body = {
        ...f, activo:1,
        id_empresa:parseInt(f.id_empresa),
        id_categoria:f.id_categoria?parseInt(f.id_categoria):null,
        id_proveedor:f.id_proveedor?parseInt(f.id_proveedor):null,
        precio_compra:parseFloat(f.precio_compra), precio_venta:parseFloat(f.precio_venta),
        stock:parseInt(f.stock), stock_minimo:parseInt(f.stock_minimo),
      };
      edit
        ? await api('producto_actualizar',{},'POST',{...body,id_producto:orig.id_producto})
        : await api('producto_insertar',  {},'POST',body);
      goBack();
    } catch(e){ Alert.alert('Error',e.message); } finally{ setSaving(false); }
  }
  async function del() {
    Alert.alert('Eliminar','¿Seguro?',[{text:'Cancelar',style:'cancel'},{text:'Eliminar',style:'destructive',onPress:async()=>{
      try{ await api('producto_eliminar',{},'POST',{id_producto:orig.id_producto}); goBack(); } catch(e){ Alert.alert('Error',e.message); }
    }}]);
  }
  return (
    <View style={{flex:1}}>
      <TopBar title={edit?'Editar Producto':'Nuevo Producto'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Field label="Nombre *"         value={f.nombre}        onChangeText={v=>setF(p=>({...p,nombre:v}))} />
        <Field label="Código *"         value={f.codigo}        onChangeText={v=>setF(p=>({...p,codigo:v}))} />
        <Field label="Descripción"      value={f.descripcion}   onChangeText={v=>setF(p=>({...p,descripcion:v}))} multiline />
        <Field label="Precio compra"    value={f.precio_compra} onChangeText={v=>setF(p=>({...p,precio_compra:v}))} keyboardType="numeric" />
        <Field label="Precio venta"     value={f.precio_venta}  onChangeText={v=>setF(p=>({...p,precio_venta:v}))}  keyboardType="numeric" />
        <Field label="Stock actual"     value={f.stock}         onChangeText={v=>setF(p=>({...p,stock:v}))}         keyboardType="numeric" />
        <Field label="Stock mínimo"     value={f.stock_minimo}  onChangeText={v=>setF(p=>({...p,stock_minimo:v}))}  keyboardType="numeric" />
        <Field label="Unidad de medida" value={f.unidad_medida} onChangeText={v=>setF(p=>({...p,unidad_medida:v}))} />
        <Field label="ID Categoría"     value={f.id_categoria}  onChangeText={v=>setF(p=>({...p,id_categoria:v}))}  keyboardType="numeric" />
        <Field label="ID Proveedor"     value={f.id_proveedor}  onChangeText={v=>setF(p=>({...p,id_proveedor:v}))}  keyboardType="numeric" />
        {admin && <Btn label={saving?'Guardando...':(edit?'Actualizar':'Crear Producto')} onPress={save} disabled={saving} />}
        {edit && admin && <Btn label="Eliminar Producto" onPress={del} color={C.danger} />}
        {!admin && <Text style={{color:C.textLight,textAlign:'center',marginTop:8}}>Solo lectura — consulte al administrador para modificar</Text>}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAS DE PAGO  (solo admin puede CRUD)
// ─────────────────────────────────────────────────────────────────────────────
function FormasPagoScreen({ navigate, admin }) {
  const { items, loading, refresh, setRefresh, reload } = useList('formas_pago_listar');
  return (
    <View style={{flex:1}}>
      <TopBar title="Formas de Pago" onRight={admin ? ()=>navigate('forma_pago_detalle',{modo:'nuevo'}) : null} />
      {loading ? <Loader /> : (
        <FlatList data={items} keyExtractor={i=>String(i.id_forma_pago)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin formas de pago" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="💳" title={it.nombre} subtitle={it.descripcion}
              badge={it.activo?'Activa':'Inactiva'} badgeColor={it.activo?C.success:C.danger}
              onPress={()=>navigate('forma_pago_detalle',{modo:'editar',item:it})} />
          )} />
      )}
    </View>
  );
}
function FormaPagoDetalle({ params, goBack, admin }) {
  const edit = params?.modo === 'editar';
  const orig = params?.item ?? {};
  const [f, setF] = useState({ nombre:orig.nombre??'', descripcion:orig.descripcion??'' });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.nombre) return Alert.alert('Error','Nombre requerido');
    setSaving(true);
    try {
      const body = { ...f, activo:1 };
      edit
        ? await api('forma_pago_actualizar',{},'POST',{...body,id_forma_pago:orig.id_forma_pago})
        : await api('forma_pago_insertar',  {},'POST',body);
      goBack();
    } catch(e){ Alert.alert('Error',e.message); } finally{ setSaving(false); }
  }
  async function del() {
    Alert.alert('Eliminar','¿Seguro?',[{text:'Cancelar',style:'cancel'},{text:'Eliminar',style:'destructive',onPress:async()=>{
      try{ await api('forma_pago_eliminar',{},'POST',{id_forma_pago:orig.id_forma_pago}); goBack(); } catch(e){ Alert.alert('Error',e.message); }
    }}]);
  }
  return (
    <View style={{flex:1}}>
      <TopBar title={edit?'Editar F. de Pago':'Nueva F. de Pago'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <Field label="Nombre *"    value={f.nombre}      onChangeText={v=>setF(p=>({...p,nombre:v}))} />
        <Field label="Descripción" value={f.descripcion} onChangeText={v=>setF(p=>({...p,descripcion:v}))} multiline />
        {admin && <Btn label={saving?'Guardando...':(edit?'Actualizar':'Crear')} onPress={save} disabled={saving} />}
        {edit && admin && <Btn label="Eliminar" onPress={del} color={C.danger} />}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÓRDENES
// ─────────────────────────────────────────────────────────────────────────────
function OrdenesScreen({ navigate, admin, usuario }) {
  const { items, loading, refresh, setRefresh, reload } = useList('ordenes_listar',{id_empresa:usuario?.id_empresa??1});
  // usuario normal solo ve SUS órdenes
  const visibles = admin ? items : items.filter(o => parseInt(o.id_usuario) === parseInt(usuario?.id_usuario));
  return (
    <View style={{flex:1}}>
      <TopBar title="Órdenes" />
      {loading ? <Loader /> : (
        <FlatList data={visibles} keyExtractor={i=>String(i.id_orden)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin órdenes" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="🛒"
              title={it.numero_orden}
              subtitle={`${it.cliente_nombres} ${it.cliente_apellidos??''} · ${fmt$(it.total)}`}
              badge={it.estado} badgeColor={estadoColor[it.estado]??C.primary}
              onPress={()=>navigate('orden_detalle',{modo:'ver',item:it})} />
          )} />
      )}
    </View>
  );
}
function OrdenDetalle({ params, goBack, admin }) {
  const orig = params?.item ?? {};
  const [orden,   setOrden]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orig.id_orden) {
      api('orden_obtener',{id:orig.id_orden})
        .then(setOrden)
        .catch(e=>Alert.alert('Error',e.message))
        .finally(()=>setLoading(false));
    }
  },[orig.id_orden]);

  async function cambiarEstado(estado) {
    try {
      await api('orden_cambiar_estado',{},'POST',{id_orden:orig.id_orden,estado});
      const u = await api('orden_obtener',{id:orig.id_orden});
      setOrden(u);
    } catch(e){ Alert.alert('Error',e.message); }
  }

  if (loading) return <View style={{flex:1}}><TopBar title="Orden" onBack={goBack}/><Loader /></View>;
  const d = orden ?? orig;

  return (
    <View style={{flex:1}}>
      <TopBar title={d.numero_orden??'Orden'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>
        <View style={od.section}>
          <Text style={od.sTitle}>📋 Información</Text>
          <Text style={od.row}>Cliente: <Text style={od.val}>{d.cliente_nombres} {d.cliente_apellidos}</Text></Text>
          <Text style={od.row}>Forma pago: <Text style={od.val}>{d.forma_pago_nombre}</Text></Text>
          <Text style={od.row}>Subtotal: <Text style={od.val}>{fmt$(d.subtotal)}</Text></Text>
          <Text style={od.row}>Descuento: <Text style={od.val}>{fmt$(d.descuento)}</Text></Text>
          <Text style={od.row}>IVA: <Text style={od.val}>{fmt$(d.iva)}</Text></Text>
          <Text style={[od.row,{marginTop:6}]}>TOTAL: <Text style={[od.val,{fontSize:18,color:C.success}]}>{fmt$(d.total)}</Text></Text>
          <View style={{marginTop:8}}><StatusChip label={d.estado?.toUpperCase()??''} color={estadoColor[d.estado]??C.primary} /></View>
        </View>

        {Array.isArray(d.items) && d.items.length > 0 && (
          <View style={od.section}>
            <Text style={od.sTitle}>📦 Ítems</Text>
            {d.items.map((it,i)=>(
              <View key={i} style={od.item}>
                <Text style={od.itemName}>{it.producto_nombre}</Text>
                <Text style={od.itemSub}>{it.cantidad} x {fmt$(it.precio_unitario)} = {fmt$(it.subtotal)}</Text>
              </View>
            ))}
          </View>
        )}

        {admin && (
          <View style={od.section}>
            <Text style={od.sTitle}>🔄 Cambiar Estado</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:8}}>
              {['pendiente','pagado','cancelado'].map(e=>(
                <Btn key={e} label={e.charAt(0).toUpperCase()+e.slice(1)}
                  color={estadoColor[e]??C.primary} onPress={()=>cambiarEstado(e)} small />
              ))}
            </View>
          </View>
        )}

        {d.notas && (
          <View style={od.section}>
            <Text style={od.sTitle}>📝 Notas</Text>
            <Text style={od.row}>{d.notas}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
const od = StyleSheet.create({
  section:  {backgroundColor:C.white,borderRadius:14,padding:16,marginBottom:12,elevation:2},
  sTitle:   {fontSize:15,fontWeight:'700',color:C.textDark,marginBottom:10},
  row:      {fontSize:13,color:C.textMid,marginBottom:4},
  val:      {color:C.textDark,fontWeight:'600'},
  item:     {borderTopWidth:1,borderTopColor:C.border,paddingTop:8,marginTop:8},
  itemName: {fontSize:13,fontWeight:'600',color:C.textDark},
  itemSub:  {fontSize:12,color:C.textMid,marginTop:2},
});

// ─────────────────────────────────────────────────────────────────────────────
// FACTURAS
// ─────────────────────────────────────────────────────────────────────────────
function FacturasScreen({ navigate, admin, usuario }) {
  const { items, loading, refresh, setRefresh, reload } = useList('facturas_listar',{id_empresa:usuario?.id_empresa??1});
  // usuario normal solo ve SUS facturas
  const visibles = admin ? items : items.filter(f => parseInt(f.id_usuario) === parseInt(usuario?.id_usuario));
  return (
    <View style={{flex:1}}>
      <TopBar title="Facturas" />
      {loading ? <Loader /> : (
        <FlatList data={visibles} keyExtractor={i=>String(i.id_factura)}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);reload();}} colors={[C.primary]} />}
          ListEmptyComponent={<Empty msg="Sin facturas" />}
          contentContainerStyle={{paddingVertical:8}}
          renderItem={({item:it})=>(
            <ListCard icon="🧾"
              title={it.numero_factura}
              subtitle={`${it.cliente_nombres} · ${fmt$(it.total)}`}
              badge={it.estado} badgeColor={estadoColor[it.estado]??C.primary}
              onPress={()=>navigate('factura_detalle',{modo:'ver',item:it})} />
          )} />
      )}
    </View>
  );
}
function FacturaDetalle({ params, goBack, admin }) {
  const orig = params?.item ?? {};
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orig.id_factura) {
      api('factura_obtener',{id:orig.id_factura})
        .then(setFactura)
        .catch(e=>Alert.alert('Error',e.message))
        .finally(()=>setLoading(false));
    }
  },[orig.id_factura]);

  async function anular() {
    Alert.alert('Anular Factura','¿Está seguro? Esta acción no se puede deshacer.',[
      {text:'Cancelar',style:'cancel'},
      {text:'Anular',style:'destructive',onPress:async()=>{
        try {
          await api('factura_anular',{},'POST',{id_factura:orig.id_factura});
          const u = await api('factura_obtener',{id:orig.id_factura});
          setFactura(u);
        } catch(e){ Alert.alert('Error',e.message); }
      }},
    ]);
  }

  if (loading) return <View style={{flex:1}}><TopBar title="Factura" onBack={goBack}/><Loader /></View>;
  const d = factura ?? orig;

  return (
    <View style={{flex:1}}>
      <TopBar title={d.numero_factura??'Factura'} onBack={goBack} />
      <ScrollView contentContainerStyle={{padding:16}}>

        <View style={od.section}>
          <Text style={od.sTitle}>🏢 Emisor</Text>
          <Text style={od.row}>{d.empresa_nombre}</Text>
          <Text style={od.row}>RUC: {d.empresa_ruc}</Text>
          <Text style={od.row}>{d.empresa_direccion}</Text>
        </View>

        <View style={od.section}>
          <Text style={od.sTitle}>🤝 Cliente</Text>
          <Text style={od.row}>{d.cliente_nombres} {d.cliente_apellidos}</Text>
          <Text style={od.row}>CI/RUC: {d.cedula_ruc}</Text>
        </View>

        <View style={od.section}>
          <Text style={od.sTitle}>💰 Valores</Text>
          <Text style={od.row}>Subtotal 0%: <Text style={od.val}>{fmt$(d.subtotal_0)}</Text></Text>
          <Text style={od.row}>Subtotal IVA: <Text style={od.val}>{fmt$(d.subtotal_iva)}</Text></Text>
          <Text style={od.row}>IVA {d.iva_pct}%: <Text style={od.val}>{fmt$(d.iva_valor)}</Text></Text>
          <Text style={od.row}>Descuento: <Text style={od.val}>{fmt$(d.descuento)}</Text></Text>
          <Text style={[od.row,{marginTop:6}]}>TOTAL: <Text style={[od.val,{fontSize:18,color:C.success}]}>{fmt$(d.total)}</Text></Text>
          <View style={{marginTop:8}}>
            <StatusChip label={d.estado?.toUpperCase()??''} color={estadoColor[d.estado]??C.primary} />
          </View>
        </View>

        {Array.isArray(d.items) && d.items.length > 0 && (
          <View style={od.section}>
            <Text style={od.sTitle}>📦 Ítems</Text>
            {d.items.map((it,i)=>(
              <View key={i} style={od.item}>
                <Text style={od.itemName}>{it.descripcion}</Text>
                <Text style={od.itemSub}>{it.cantidad} x {fmt$(it.precio_unitario)} = {fmt$(it.subtotal)}</Text>
              </View>
            ))}
          </View>
        )}

        {admin && d.estado !== 'anulada' && (
          <Btn label="Anular Factura" onPress={anular} color={C.danger} />
        )}

        {d.observacion && (
          <View style={od.section}>
            <Text style={od.sTitle}>📝 Observación</Text>
            <Text style={od.row}>{d.observacion}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH PROVIDER
// ─────────────────────────────────────────────────────────────────────────────
function AuthProvider({ children }) {
  const [usuario,  setUsuario]  = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('usuario')
      .then(raw => { if (raw) setUsuario(JSON.parse(raw)); })
      .finally(() => setChecking(false));
  }, []);

  async function signIn(user) {
    await AsyncStorage.setItem('usuario', JSON.stringify(user));
    setUsuario(user);
  }

  async function signOut() {
    Alert.alert('Cerrar sesión','¿Está seguro que desea salir?',[
      { text:'Cancelar', style:'cancel' },
      { text:'Salir', style:'destructive', onPress: async () => {
        await AsyncStorage.removeItem('usuario');
        setUsuario(null);
      }},
    ]);
  }

  if (checking) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:C.white }}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ color:C.textLight, marginTop:12 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ usuario, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppRoot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppRoot() {
  const { usuario } = useAuth();
  return usuario ? <MainNavigator /> : <LoginScreen />;
}