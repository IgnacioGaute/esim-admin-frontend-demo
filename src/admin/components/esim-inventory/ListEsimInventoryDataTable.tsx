import { useState, useMemo } from 'react';
import {
  Button,
  Dialog,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Divider,
  IconButton,
  Grid,
  Checkbox,
  TextField,
  CircularProgress,
  Link,
  Tooltip,
  Fade,
  alpha,
  LinearProgress,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Close as CloseIcon,
  SimCard,
  Search,
  ArrowForward,
  CheckCircle,
  Share,
  CalendarToday,
  Inventory2,
  EmailOutlined,
  ReplayOutlined,
  TaskAltOutlined,
} from '@mui/icons-material';
import { formatterDateDDMMYYYY } from '@/shared/helpers/handligDateHelper';
import { IEsimInventoryItem } from '@/admin/utils/interfaces/esim-inventory.interface';

interface Product {
  flag: string;
  name: string;
  amount: number;
  quantity: number;
  productId: string;
  description: string;
}

interface ExpandedBundle {
  productId: string;
  name: string;
  flag: string;
  description: string;
  status: 'Disponible' | 'Compartido';
  sharedEmail?: string;
  sharedDate?: Date | string;
  sharedId?: string;
  isFirstInGroup?: boolean;
  index: number;
}

type StatusFilter = 'Todos' | 'Disponible' | 'Compartido';

interface Props {
  loading?: boolean;
  data: IEsimInventoryItem[];
  onShare: (bundles: Product[], email: string, esimInventoryId: string) => Promise<void>;
  onResend: (inventoryId: string, sharedId: string, email: string) => Promise<void>;
}

const btnSx = {
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 2,
  px: 2.5,
  py: 1,
  transition: 'all 0.2s ease',
  '&:hover': { transform: 'translateY(-1px)' },
} as const;

const NAVY = '#1C3680';
const ITEMS_PER_PAGE = 9;

// ── helpers ───────────────────────────────────────────────────────────────────
function getBundleStats(item: IEsimInventoryItem) {
  const total = (item.order?.products || []).reduce(
    (s: number, p: any) => s + (p?.quantity || 0),
    0,
  );
  let shared = 0;
  item.shared?.forEach((s) => { shared += s.product_name.length; });
  return { total, shared, available: total - shared };
}

// ── SummaryTile ───────────────────────────────────────────────────────────────
const SummaryTile = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 120,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2.5,
      py: 2,
      borderRadius: 2.5,
      backgroundColor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(color, 0.1),
        flexShrink: 0,
      }}
    >
      <Box sx={{ color }}>{icon}</Box>
    </Box>
    <Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ lineHeight: 1.2, letterSpacing: '-0.03em', color: 'text.primary' }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

// ── EsimInventoryCard ─────────────────────────────────────────────────────────
interface CardProps {
  item: IEsimInventoryItem;
  onClick: () => void;
}

const EsimInventoryCard = ({ item, onClick }: CardProps) => {
  const { total, shared, available } = getBundleStats(item);
  const pct = total > 0 ? (shared / total) * 100 : 0;

  // status
  const allAvailable = shared === 0;
  const allShared = available === 0 && total > 0;
  const statusLabel = allAvailable ? 'Disponible' : allShared ? 'Compartido' : 'Parcial';
  const statusDot = allAvailable ? '#10b981' : allShared ? '#94a3b8' : '#f59e0b';

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 40px ${alpha(NAVY, 0.12)}`,
          borderColor: alpha(NAVY, 0.2),
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: '20px !important', display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>

        {/* Row 1: icon + status badge */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              backgroundColor: alpha(NAVY, 0.07),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SimCard sx={{ color: NAVY, fontSize: 22 }} />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1.2,
              py: 0.45,
              borderRadius: 10,
              backgroundColor: alpha(statusDot, 0.1),
              border: `1px solid ${alpha(statusDot, 0.25)}`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: statusDot,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" fontWeight={600} sx={{ color: statusDot, lineHeight: 1 }}>
              {statusLabel}
            </Typography>
          </Box>
        </Box>

        {/* Row 2: amount */}
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ letterSpacing: '-0.04em', lineHeight: 1, color: 'text.primary', mb: 0.5 }}
        >
          ${item.order?.total ?? '—'}
          <Typography
            component="span"
            variant="caption"
            sx={{ fontWeight: 500, color: 'text.disabled', ml: 0.75, fontSize: '0.75rem' }}
          >
            USD
          </Typography>
        </Typography>
        <Box display="flex" alignItems="center" gap={0.6} mb={2.5}>
          <CalendarToday sx={{ fontSize: 12, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled">
            {formatterDateDDMMYYYY(item.created_at)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Row 3: stats numbers */}
        <Box display="flex" gap={0} mb={2}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ letterSpacing: '-0.03em', lineHeight: 1.2, color: available > 0 ? '#10b981' : 'text.disabled' }}
            >
              {available}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              disponibles
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1.5 }} />

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ letterSpacing: '-0.03em', lineHeight: 1.2, color: shared > 0 ? NAVY : 'text.disabled' }}
            >
              {shared}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              compartidas
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1.5 }} />

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ letterSpacing: '-0.03em', lineHeight: 1.2, color: 'text.primary' }}
            >
              {total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              totales
            </Typography>
          </Box>
        </Box>

        {/* Row 4: progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
            <Typography variant="caption" color="text.disabled" fontSize="0.7rem">
              Uso
            </Typography>
            <Typography variant="caption" fontWeight={600} color="text.secondary" fontSize="0.7rem">
              {Math.round(pct)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 5,
              borderRadius: 3,
              backgroundColor: (t) => alpha(t.palette.divider, 1.5),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: allShared ? '#94a3b8' : NAVY,
              },
            }}
          />
        </Box>

        {/* Row 5: CTA */}
        <Box display="flex" justifyContent="flex-end" mt="auto">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
              color: NAVY,
              fontWeight: 600,
              fontSize: '0.78rem',
              opacity: 0.8,
              transition: 'opacity 0.15s',
              '&:hover': { opacity: 1 },
            }}
          >
            Ver detalles
            <ArrowForward sx={{ fontSize: 14 }} />
          </Box>
        </Box>

      </CardContent>
    </Card>
  );
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <Box
    sx={{
      height: 240,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: 'background.paper',
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: (t) =>
          `linear-gradient(90deg, transparent 20%, ${alpha(t.palette.divider, 0.6)} 50%, transparent 80%)`,
        backgroundSize: '200% 100%',
        animation: 'sweep 1.4s infinite',
      },
      '@keyframes sweep': {
        '0%': { backgroundPosition: '200% 0' },
        '100%': { backgroundPosition: '-200% 0' },
      },
    }}
  />
);

// ── Componente principal ──────────────────────────────────────────────────────
export const ListEsimInventoryDataTable = ({
  loading = false,
  data,
  onShare,
  onResend,
}: Props) => {
  // ── modal state ────────────────────────────────────────────────────────────
  const [openModal, setOpenModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentItemId, setCurrentItemId] = useState('');
  const [currentItem, setCurrentItem] = useState<IEsimInventoryItem | null>(null);
  const [selectedBundles, setSelectedBundles] = useState<Set<number>>(new Set());
  const [shareEmail, setShareEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Disponible');
  const [isSharing, setIsSharing] = useState(false);
  const [openResendModal, setOpenResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendEmailError, setResendEmailError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [selectedBundleForResend, setSelectedBundleForResend] = useState<{
    inventoryId: string;
    sharedId: string;
    previousEmail: string;
  } | null>(null);

  // ── search + pagination ────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);

  // ── aggregate stats ────────────────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    let totalAvail = 0, totalShared = 0;
    data.forEach((item) => {
      const s = getBundleStats(item);
      totalAvail += s.available;
      totalShared += s.shared;
    });
    return { count: data.length, totalAvail, totalShared };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data;
    const q = searchText.toLowerCase();
    return data.filter((item) => {
      const total = String(item.order?.total ?? '');
      const date = formatterDateDDMMYYYY(item.created_at);
      return total.includes(q) || date.toLowerCase().includes(q);
    });
  }, [data, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, page]);

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleOpenModal = (
    orderProducts: Product[],
    itemId: string,
    item?: IEsimInventoryItem,
    initialFilter: StatusFilter = 'Disponible',
  ) => {
    setProducts(orderProducts || []);
    setCurrentItemId(itemId);
    setCurrentItem(item || null);
    setSelectedBundles(new Set());
    setStatusFilter(initialFilter);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setProducts([]);
    setCurrentItemId('');
    setCurrentItem(null);
    setSelectedBundles(new Set());
    setStatusFilter('Disponible');
  };

  const filteredBundles = useMemo(() => {
    if (!products.length) return [];

    const getSharedInstances = (productId: string) => {
      if (!currentItem?.shared?.length) return [];
      const instances: { email: string; date: Date | string; sharedId: string }[] = [];
      currentItem.shared.forEach((si) => {
        si.product_name.filter((id) => id === productId).forEach(() => {
          instances.push({ email: si.shared_email, date: si.shared_at, sharedId: si.id });
        });
      });
      return instances;
    };

    const expanded: ExpandedBundle[] = [];
    let gi = 0;
    const shown = new Set<string>();

    products.forEach((product) => {
      const instances = getSharedInstances(product.productId);
      for (let i = 0; i < product.quantity; i++) {
        const isShared = i < instances.length;
        const b: ExpandedBundle = {
          productId: product.productId,
          name: product.name,
          flag: product.flag,
          description: product.description,
          status: isShared ? 'Compartido' : 'Disponible',
          index: gi++,
        };
        if (isShared && instances[i]) {
          b.sharedEmail = instances[i].email;
          b.sharedDate = instances[i].date;
          b.sharedId = instances[i].sharedId;
          b.isFirstInGroup = !shown.has(b.sharedId!);
          if (b.sharedId) shown.add(b.sharedId);
        }
        expanded.push(b);
      }
    });

    return statusFilter === 'Todos' ? expanded : expanded.filter((b) => b.status === statusFilter);
  }, [products, currentItem, statusFilter]);

  const handleToggleBundle = (index: number) => {
    const b = filteredBundles[index];
    if (!b || b.status === 'Compartido') return;
    setSelectedBundles((prev) => {
      const next = new Set(prev);
      next.has(b.index) ? next.delete(b.index) : next.add(b.index);
      return next;
    });
  };

  const getSelectedProductsList = (): Product[] => {
    const map = new Map<string, number>();
    filteredBundles.forEach((b) => {
      if (selectedBundles.has(b.index) && b.status === 'Disponible')
        map.set(b.productId, (map.get(b.productId) || 0) + 1);
    });
    return products
      .filter((p) => map.has(p.productId))
      .map((p) => ({ ...p, quantity: map.get(p.productId) || 0 }));
  };

  const handleOpenShareModal = () => { if (getSelectedProductsList().length) setOpenShareModal(true); };
  const handleCloseShareModal = () => { if (isSharing) return; setOpenShareModal(false); setShareEmail(''); setEmailError(''); };
  const handleOpenResendModal = (b: ExpandedBundle) => {
    if (!b.sharedId || !b.sharedEmail || !currentItemId) return;
    setSelectedBundleForResend({ inventoryId: currentItemId, sharedId: b.sharedId, previousEmail: b.sharedEmail });
    setResendEmail(''); setResendEmailError(''); setOpenResendModal(true);
  };
  const handleCloseResendModal = () => { if (isResending) return; setOpenResendModal(false); setResendEmail(''); setResendEmailError(''); setSelectedBundleForResend(null); };

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => { setShareEmail(e.target.value); setEmailError(e.target.value && !validateEmail(e.target.value) ? 'Email inválido' : ''); };
  const handleResendEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => { setResendEmail(e.target.value); setResendEmailError(e.target.value && !validateEmail(e.target.value) ? 'Email inválido' : ''); };

  const handleConfirmShare = async () => {
    if (!shareEmail) { setEmailError('El email es requerido'); return; }
    if (!validateEmail(shareEmail)) { setEmailError('Email inválido'); return; }
    const sel = getSelectedProductsList();
    if (!sel.length) return;
    setIsSharing(true);
    try { await onShare(sel, shareEmail, currentItemId); handleCloseShareModal(); handleCloseModal(); }
    catch { /* parent handles */ } finally { setIsSharing(false); }
  };

  const handleConfirmResend = async () => {
    if (!resendEmail) { setResendEmailError('El email es requerido'); return; }
    if (!validateEmail(resendEmail)) { setResendEmailError('Email inválido'); return; }
    if (!selectedBundleForResend) return;
    setIsResending(true);
    try { await onResend(selectedBundleForResend.inventoryId, selectedBundleForResend.sharedId, resendEmail); handleCloseResendModal(); handleCloseShareModal(); handleCloseModal(); }
    catch { /* parent handles */ } finally { setIsResending(false); }
  };

  const hasAvail = (item: IEsimInventoryItem) => getBundleStats(item).available > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Fade in timeout={350}>
      <Box>

        {/* ── Summary bar ──────────────────────────────────────────── */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <SummaryTile
            label="eSIMs totales"
            value={summaryStats.count}
            icon={<Inventory2 sx={{ fontSize: 18 }} />}
            color={NAVY}
          />
          <SummaryTile
            label="Bundles disponibles"
            value={summaryStats.totalAvail}
            icon={<CheckCircle sx={{ fontSize: 18 }} />}
            color="#10b981"
          />
          <SummaryTile
            label="Bundles compartidos"
            value={summaryStats.totalShared}
            icon={<Share sx={{ fontSize: 18 }} />}
            color="#f59e0b"
          />
        </Box>

        {/* ── Card container ────────────────────────────────────────── */}
        <Box
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              px: 3,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ letterSpacing: '-0.01em' }}>
              Inventario
              <Typography component="span" variant="body2" color="text.disabled" sx={{ ml: 1, fontWeight: 400 }}>
                {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}
              </Typography>
            </Typography>

            <TextField
              size="small"
              placeholder="Buscar..."
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
              sx={{
                width: 220,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.85rem',
                  backgroundColor: (t) => alpha(t.palette.background.default, 1),
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Grid */}
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Grid container spacing={2.5}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Grid item xs={12} sm={6} md={4} key={n}>
                    <SkeletonCard />
                  </Grid>
                ))}
              </Grid>
            ) : paginatedData.length === 0 ? (
              <Box py={8} textAlign="center">
                <SimCard sx={{ fontSize: 52, color: (t) => alpha(t.palette.text.disabled, 0.4), mb: 2 }} />
                <Typography fontWeight={600} color="text.secondary">
                  {searchText ? 'Sin resultados' : 'Sin eSIMs en inventario'}
                </Typography>
                <Typography variant="body2" color="text.disabled" mt={0.5}>
                  {searchText ? 'Probá con otro término' : 'Las eSIMs compradas aparecerán aquí'}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {paginatedData.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <EsimInventoryCard
                      item={item}
                      onClick={() =>
                        handleOpenModal(
                          item.order?.products || [],
                          item.id,
                          item,
                          hasAvail(item) ? 'Disponible' : 'Compartido',
                        )
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  color="primary"
                  shape="rounded"
                  size="small"
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Modal: detalle de bundles ─────────────────────────────── */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: '85vh', display: 'flex', flexDirection: 'column' } }}>

          {/* Header */}
          <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Paquetes eSIM
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Seleccioná los bundles disponibles para compartir con otra persona.
                </Typography>
              </Box>
              <IconButton onClick={handleCloseModal} size="small" sx={{ mt: -0.5, color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Filter tabs */}
            <Box display="flex" gap={0.75} mt={2}>
              {(['Disponible', 'Compartido', 'Todos'] as StatusFilter[]).map((f) => {
                const active = statusFilter === f;
                const labels: Record<StatusFilter, string> = { Disponible: 'Disponibles', Compartido: 'Compartidos', Todos: 'Todos' };
                return (
                  <Box
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    sx={{
                      px: 1.5, py: 0.6,
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: active ? 700 : 500,
                      color: active ? NAVY : 'text.secondary',
                      backgroundColor: active ? alpha(NAVY, 0.08) : 'transparent',
                      border: '1px solid',
                      borderColor: active ? alpha(NAVY, 0.2) : 'divider',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                      '&:hover': { backgroundColor: active ? alpha(NAVY, 0.1) : alpha(NAVY, 0.04) },
                    }}
                  >
                    {labels[f]}
                  </Box>
                );
              })}

              {getSelectedProductsList().length > 0 && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5, color: NAVY, fontSize: '0.8rem', fontWeight: 600 }}>
                  <TaskAltOutlined sx={{ fontSize: 15 }} />
                  {getSelectedProductsList().reduce((s, p) => s + p.quantity, 0)} seleccionado{getSelectedProductsList().reduce((s, p) => s + p.quantity, 0) !== 1 ? 's' : ''}
                </Box>
              )}
            </Box>
          </Box>

          {/* Scrollable list */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 1.5 }}>
            {!products.length ? (
              <Box py={5} textAlign="center">
                <Typography variant="body2" color="text.secondary">No hay productos disponibles.</Typography>
              </Box>
            ) : filteredBundles.length === 0 ? (
              <Box py={5} textAlign="center">
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {statusFilter === 'Compartido' ? 'No hay eSIMs compartidas.' : 'No hay eSIMs disponibles.'}
                </Typography>
                {statusFilter !== 'Compartido' && (
                  <Typography component={Link} href="/store" sx={{ fontSize: '0.85rem', color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}>
                    Ir a la tienda
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {filteredBundles.map((bundle, index) => {
                  const isSelected = selectedBundles.has(bundle.index);
                  const isAvailable = bundle.status === 'Disponible';
                  const showShared = (statusFilter === 'Compartido' || statusFilter === 'Todos') && bundle.status === 'Compartido';

                  return (
                    <Box
                      key={bundle.index}
                      onClick={() => isAvailable && handleToggleBundle(index)}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        px: 2,
                        py: 1.75,
                        borderRadius: 2,
                        cursor: isAvailable ? 'pointer' : 'default',
                        backgroundColor: isSelected ? alpha(NAVY, 0.05) : 'transparent',
                        border: '1px solid',
                        borderColor: isSelected ? alpha(NAVY, 0.2) : 'transparent',
                        mb: 0.75,
                        transition: 'all 0.15s ease',
                        '&:hover': isAvailable ? {
                          backgroundColor: isSelected ? alpha(NAVY, 0.07) : alpha(NAVY, 0.03),
                          borderColor: alpha(NAVY, 0.12),
                        } : {},
                      }}
                    >
                      {/* Flag */}
                      <Avatar
                        src={bundle.flag}
                        alt={bundle.name}
                        sx={{ width: 36, height: 36, mt: 0.25, flexShrink: 0 }}
                      />

                      {/* Content */}
                      <Box flex={1} minWidth={0}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.3}>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                            {bundle.name}
                          </Typography>
                          {/* Status pill */}
                          <Box
                            sx={{
                              display: 'inline-flex', alignItems: 'center', gap: 0.4,
                              px: 1, py: 0.2, borderRadius: 10,
                              backgroundColor: isAvailable ? alpha('#10b981', 0.1) : alpha('#94a3b8', 0.12),
                              border: `1px solid ${isAvailable ? alpha('#10b981', 0.25) : alpha('#94a3b8', 0.25)}`,
                            }}
                          >
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isAvailable ? '#10b981' : '#94a3b8' }} />
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: isAvailable ? '#10b981' : '#94a3b8', lineHeight: 1 }}>
                              {bundle.status}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.78rem' }}>
                          {bundle.description || bundle.productId}
                        </Typography>

                        {/* Shared info */}
                        {showShared && (
                          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5} mt={1}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <EmailOutlined sx={{ fontSize: 13, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                                {bundle.sharedEmail || '---'}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarToday sx={{ fontSize: 12, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                                {bundle.sharedDate ? formatterDateDDMMYYYY(bundle.sharedDate) : '---'}
                              </Typography>
                            </Box>
                            {bundle.isFirstInGroup && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ReplayOutlined sx={{ fontSize: 13 }} />}
                                onClick={(e) => { e.stopPropagation(); handleOpenResendModal(bundle); }}
                                sx={{ ...btnSx, px: 1.25, py: 0.25, fontSize: '0.75rem', minHeight: 0, height: 26 }}
                              >
                                Reenviar
                              </Button>
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Checkbox (only for available) */}
                      {isAvailable && (
                        <Tooltip title={isSelected ? 'Quitar selección' : 'Seleccionar para compartir'}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggleBundle(index)}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                            sx={{ p: 0.5, mt: 0.1, flexShrink: 0, color: isSelected ? NAVY : 'text.disabled' }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexShrink: 0 }}>
            <Button variant="outlined" color="inherit" onClick={handleCloseModal} sx={btnSx}>
              Cerrar
            </Button>
            {filteredBundles.some((b) => b.status === 'Disponible') && (
              <Button
                variant="contained"
                onClick={handleOpenShareModal}
                disabled={!getSelectedProductsList().length}
                sx={{ ...btnSx, px: 2.5 }}
              >
                Compartir {getSelectedProductsList().length > 0 && `(${getSelectedProductsList().reduce((s, p) => s + p.quantity, 0)})`}
              </Button>
            )}
          </Box>
        </Dialog>

        {/* ── Modal: compartir ──────────────────────────────────────── */}
        <Dialog open={openShareModal} onClose={handleCloseShareModal} maxWidth="sm" fullWidth disableEscapeKeyDown={isSharing} PaperProps={{ sx: { borderRadius: 3 } }}>
          <Box sx={{ position: 'relative' }}>
            <IconButton onClick={handleCloseShareModal} disabled={isSharing} sx={(t) => ({ position: 'absolute', right: 8, top: 8, zIndex: 1, color: t.palette.grey[500], '&:hover': { backgroundColor: alpha(t.palette.grey[500], 0.1) } })}><CloseIcon /></IconButton>
            <Card elevation={0}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ pr: 4, letterSpacing: '-0.02em' }}>Compartir eSIM</Typography>
                <Box mt={3}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>Bundles seleccionados:</Typography>
                  {!getSelectedProductsList().length ? (
                    <Typography variant="body2" color="text.secondary" mt={1}>No hay bundles seleccionados</Typography>
                  ) : (
                    <Box mt={1} mb={3}>
                      {getSelectedProductsList().map((product, i) => (
                        <Box key={i} mb={2}>
                          <Grid container spacing={2} sx={{ py: 1 }}>
                            <Grid item xs={12} sm={3}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar src={product.flag} alt={product.name} sx={{ width: 32, height: 32 }} />
                                <Typography variant="body2" fontWeight={500}>{product.name}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                              <Typography variant="body2" color="text.secondary"><strong>Producto ID:</strong> {product.productId}</Typography>
                              <Typography variant="body2" color="text.secondary" mt={0.5}><strong>Descripción:</strong> {product.description}</Typography>
                              <Typography variant="body2" mt={0.5}><strong>Cantidad a compartir:</strong> {product.quantity}</Typography>
                            </Grid>
                          </Grid>
                          {i < getSelectedProductsList().length - 1 && <Divider />}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
                <TextField fullWidth label="Email" type="email" value={shareEmail} onChange={handleEmailChange} error={!!emailError} helperText={emailError} placeholder="Email destino" variant="outlined" required disabled={isSharing} sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={handleCloseShareModal} disabled={isSharing} sx={btnSx}>Cancelar</Button>
                  <Button variant="contained" onClick={handleConfirmShare} disabled={isSharing || !shareEmail || !!emailError || !getSelectedProductsList().length} sx={{ ...btnSx, minWidth: 120 }} startIcon={isSharing ? <CircularProgress size={16} color="inherit" /> : null}>
                    {isSharing ? 'Compartiendo...' : 'Confirmar'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Dialog>

        {/* ── Modal: reenviar ───────────────────────────────────────── */}
        <Dialog open={openResendModal} onClose={handleCloseResendModal} maxWidth="sm" fullWidth disableEscapeKeyDown={isResending} PaperProps={{ sx: { borderRadius: 3 } }}>
          <Box sx={{ position: 'relative' }}>
            <IconButton onClick={handleCloseResendModal} disabled={isResending} sx={(t) => ({ position: 'absolute', right: 8, top: 8, zIndex: 1, color: t.palette.grey[500], '&:hover': { backgroundColor: alpha(t.palette.grey[500], 0.1) } })}><CloseIcon /></IconButton>
            <Card elevation={0}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ pr: 4, letterSpacing: '-0.02em' }}>Reenviar eSIM</Typography>
                {selectedBundleForResend && (
                  <Box mt={3}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Email compartido previamente:</Typography>
                    <Typography variant="body1" fontWeight={600} mb={3}>{selectedBundleForResend.previousEmail}</Typography>
                  </Box>
                )}
                <TextField fullWidth label="Nuevo email" type="email" value={resendEmail} onChange={handleResendEmailChange} error={!!resendEmailError} helperText={resendEmailError} placeholder="Email destino" variant="outlined" required disabled={isResending} sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={handleCloseResendModal} disabled={isResending} sx={btnSx}>Cancelar</Button>
                  <Button variant="contained" onClick={handleConfirmResend} disabled={isResending || !resendEmail || !!resendEmailError} sx={{ ...btnSx, minWidth: 120 }} startIcon={isResending ? <CircularProgress size={16} color="inherit" /> : null}>
                    {isResending ? 'Reenviando...' : 'Reenviar'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Dialog>
      </Box>
    </Fade>
  );
};
