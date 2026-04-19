import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Formik } from "formik";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { CloudUpload, Save } from "@mui/icons-material";
import { LayerCardForm } from "../LayerCardForm";
import { useFetch } from "@/shared/hooks";
import { useNotiAlert } from "@/shared/hooks";
import { fetchApiHelper } from "@/shared/helpers";
import { IDeviceBrand, IFormDeviceModel } from "@/admin/utils/interfaces/esim-devices.interface";
import { FormDeviceModelSchema, FormDeviceModelSchemaEdit } from "@/admin/utils/shemas/FormDeviceModelSchema";

interface Props {
  dataForm?: Partial<IFormDeviceModel>;
  title?: string;
  onBack: () => void;
  onSubmit: (values: IFormDeviceModel) => void;
  loading?: boolean;
}

interface BulkRow {
  marca: string;
  modelo: string;
}

const REQUIRED_HEADERS = ["marca", "modelo"];

function parseFileToRows(file: File): Promise<BulkRow[] | string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        if (!rows.length) {
          resolve("El archivo está vacío.");
          return;
        }

        const rawHeaders = (rows[0] as string[]).map((h) =>
          String(h ?? "").trim().toLowerCase()
        );
        const filteredHeaders = rawHeaders.filter((h) => h !== "");

        if (
          filteredHeaders.length !== 2 ||
          !filteredHeaders.includes("marca") ||
          !filteredHeaders.includes("modelo")
        ) {
          resolve(
            `El archivo debe tener exactamente 2 columnas: "marca" y "modelo". Se encontraron: ${filteredHeaders.join(", ") || "(vacío)"}`
          );
          return;
        }

        const marcaIdx = rawHeaders.indexOf("marca");
        const modeloIdx = rawHeaders.indexOf("modelo");

        const result: BulkRow[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as string[];
          const marca = String(row[marcaIdx] ?? "").trim();
          const modelo = String(row[modeloIdx] ?? "").trim();
          if (!marca && !modelo) continue;
          result.push({ marca, modelo });
        }

        if (!result.length) {
          resolve("El archivo no contiene filas con datos.");
          return;
        }

        resolve(result);
      } catch {
        resolve("No se pudo leer el archivo. Verificá que sea un .xlsx, .xls o .csv válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export const DeviceModelFormNewAndEdit = ({
  dataForm,
  title = "Agregar dispositivo",
  loading = false,
  onBack,
  onSubmit,
}: Props) => {
  const { snackBarAlert } = useNotiAlert();
  const isEditMode = Boolean(dataForm);

  const [tab, setTab] = useState(0);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkRows, setBulkRows] = useState<BulkRow[] | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: brands, loading: loadingBrands } = useFetch<IDeviceBrand[]>(
    "admin/esim-devices/brands",
    "GET",
    { init: true, cache: { enabled: false } }
  );

  const formInit: IFormDeviceModel = {
    brandId: dataForm?.brandId ?? "",
    name: (dataForm?.name as string) ?? "",
    maxEsims: (dataForm?.maxEsims as any) ?? 1,
    isActive: (dataForm?.isActive as boolean) ?? true,
    sortOrder: (dataForm?.sortOrder as any) ?? 0,
  };

  const onHandleSubmit = (values: IFormDeviceModel) => {
    onSubmit({
      ...values,
      maxEsims: Number(values.maxEsims),
      sortOrder: Number(values.sortOrder),
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkRows(null);
    setBulkError(null);

    const result = await parseFileToRows(file);
    if (typeof result === "string") {
      setBulkError(result);
    } else {
      setBulkRows(result);
    }

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const onBulkSubmit = async () => {
    if (!bulkFile || !bulkRows) return;

    setBulkLoading(true);
    const formData = new FormData();
    formData.append("file", bulkFile);

    const resp = await fetchApiHelper<{ created: number; skipped: number; errors: string[] }>(
      "admin/esim-devices/models/bulk-upload",
      "POST",
      { data: formData, headers: { "Content-Type": "multipart/form-data" } }
    );

    setBulkLoading(false);

    if (!resp.ok) {
      snackBarAlert(resp.message || "Error al cargar el archivo", { variant: "error" });
      return;
    }

    const { created, skipped, errors } = resp.data!;
    const parts: string[] = [];
    if (created > 0) parts.push(`${created} creados`);
    if (skipped > 0) parts.push(`${skipped} duplicados omitidos`);
    if (errors.length > 0) parts.push(`${errors.length} con errores`);

    snackBarAlert(
      `Carga completada: ${parts.join(", ")}`,
      { variant: created > 0 ? "success" : "warning" }
    );

    onBack();
  };

  const onClearFile = () => {
    setBulkFile(null);
    setBulkRows(null);
    setBulkError(null);
  };

  return (
    <LayerCardForm title={title} loading={loading || bulkLoading} onBack={onBack}>
      {!isEditMode && (
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); onClearFile(); }}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}
        >
          <Tab label="Individual" />
          <Tab label="Carga masiva" />
        </Tabs>
      )}

      {/* ── INDIVIDUAL FORM ── */}
      {tab === 0 && (
        <Formik
          initialValues={formInit}
          validationSchema={dataForm ? FormDeviceModelSchemaEdit : FormDeviceModelSchema}
          enableReinitialize
          onSubmit={onHandleSubmit}
        >
          {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
            <Box component="form" width="100%" onSubmit={handleSubmit} pt={isEditMode ? 2.5 : 0}>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={Boolean(errors.brandId)} size="small">
                    <InputLabel id="brand-label">Marca</InputLabel>
                    <Select
                      labelId="brand-label"
                      value={values.brandId}
                      label="Marca"
                      onChange={(e) => setFieldValue("brandId", e.target.value)}
                      disabled={loadingBrands}
                    >
                      {(brands ?? []).map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.brandId && <FormHelperText>{errors.brandId as any}</FormHelperText>}
                  </FormControl>

                  <Box width="100%" mt={2.5}>
                    <TextField
                      variant="outlined"
                      value={values.name}
                      onChange={handleChange("name")}
                      label="Modelo"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.name)}
                      helperText={errors.name as any}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box width="100%" mb={3}>
                    <TextField
                      variant="outlined"
                      value={values.maxEsims}
                      onChange={handleChange("maxEsims")}
                      label="Máx eSIMs"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      type="number"
                      inputProps={{ min: 1, step: 1 }}
                      error={Boolean(errors.maxEsims)}
                      helperText={errors.maxEsims as any}
                    />
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Switch
                      checked={Boolean(values.isActive)}
                      onChange={(e) => setFieldValue("isActive", e.target.checked)}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {values.isActive ? "Activo" : "Inactivo"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" color="inherit" size="medium" onClick={onBack}>
                  Cancelar
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  disableElevation
                  type="submit"
                  size="medium"
                  style={{ padding: "9px 12px" }}
                  startIcon={<Save />}
                >
                  Guardar
                </Button>
              </Box>
            </Box>
          )}
        </Formik>
      )}

      {/* ── BULK UPLOAD ── */}
      {tab === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 2.5 }}>
            El archivo debe tener <strong>exactamente 2 columnas</strong>:{" "}
            <strong>"marca"</strong> y <strong>"modelo"</strong>.{" "}
            Ej: Samsung, Galaxy S26. Se aceptan archivos <strong>.xlsx</strong>,{" "}
            <strong>.xls</strong> y <strong>.csv</strong>.
          </Alert>

          <Box display="flex" alignItems="center" gap={2} mb={2.5}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar archivo
            </Button>
            {bulkFile && (
              <Chip
                label={bulkFile.name}
                onDelete={onClearFile}
                color={bulkError ? "error" : "default"}
                variant="outlined"
              />
            )}
          </Box>

          {bulkError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bulkError}
            </Alert>
          )}

          {bulkRows && bulkRows.length > 0 && (
            <Box mb={2.5}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Vista previa — {bulkRows.length} dispositivo{bulkRows.length !== 1 ? "s" : ""}
              </Typography>
              <TableContainer
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {REQUIRED_HEADERS.map((h) => (
                        <TableCell
                          key={h}
                          sx={{ fontWeight: 700, textTransform: "capitalize" }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkRows.map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{row.marca}</TableCell>
                        <TableCell>{row.modelo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="outlined" color="inherit" size="medium" onClick={onBack}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="info"
              disableElevation
              size="medium"
              style={{ padding: "9px 12px" }}
              startIcon={<Save />}
              disabled={!bulkRows || bulkRows.length === 0 || bulkLoading}
              onClick={onBulkSubmit}
            >
              Cargar {bulkRows ? bulkRows.length : 0} dispositivo{bulkRows?.length !== 1 ? "s" : ""}
            </Button>
          </Box>
        </Box>
      )}
    </LayerCardForm>
  );
};
