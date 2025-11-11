import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Exporta productos a formato CSV
 */
export async function exportToCSV(products) {
    try {
        if (!products || products.length === 0) {
            Alert.alert("Error", "No hay productos para exportar");
            return;
        }

        // Crear encabezados
        const headers = "Nombre,Código,Cantidad,Stock Mínimo,Estado\n";

        // Crear filas de datos
        const rows = products.map(product => {
            const status = getProductStatus(product);
            return `"${product.name}","${product.code}",${product.quantity},${product.minStock || 0},"${status}"`;
        }).join("\n");

        const csvContent = headers + rows;

        // Generar nombre de archivo con fecha
        const fileName = `inventario_${getFormattedDate()}.csv`;
        const fileUri = FileSystem.documentDirectory + fileName;

        // Escribir archivo
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Compartir archivo
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
            return true;
        } else {
            Alert.alert("Error", "La función de compartir no está disponible en este dispositivo");
            return false;
        }
    } catch (error) {
        console.error("Error exportando CSV:", error);
        Alert.alert("Error", "No se pudo exportar el archivo CSV");
        return false;
    }
}

/**
 * Exporta productos a formato PDF (texto plano formateado)
 */
export async function exportToPDF(products) {
    try {
        if (!products || products.length === 0) {
            Alert.alert("Error", "No hay productos para exportar");
            return;
        }

        // Crear contenido del "PDF" (realmente un TXT formateado)
        let content = "═══════════════════════════════════════\n";
        content += "     REPORTE DE INVENTARIO\n";
        content += `     ${getFormattedDateTime()}\n`;
        content += "═══════════════════════════════════════\n\n";

        // Resumen
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p =>
            p.minStock && p.quantity <= p.minStock
        ).length;
        const outOfStockProducts = products.filter(p => p.quantity === 0).length;
        const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

        content += "RESUMEN GENERAL\n";
        content += "───────────────────────────────────────\n";
        content += `Total de productos:      ${totalProducts}\n`;
        content += `Cantidad total en stock: ${totalQuantity}\n`;
        content += `Productos sin stock:     ${outOfStockProducts}\n`;
        content += `Productos con stock bajo: ${lowStockProducts}\n\n`;

        // Alertas si hay productos con problemas
        if (outOfStockProducts > 0 || lowStockProducts > 0) {
            content += "⚠️  ALERTAS\n";
            content += "───────────────────────────────────────\n";
            if (outOfStockProducts > 0) {
                content += `🚫 ${outOfStockProducts} producto(s) SIN STOCK\n`;
            }
            if (lowStockProducts > 0) {
                content += `⚠️  ${lowStockProducts} producto(s) con STOCK BAJO\n`;
            }
            content += "\n";
        }

        // Detalle de productos
        content += "DETALLE DE PRODUCTOS\n";
        content += "═══════════════════════════════════════\n\n";

        products.forEach((product, index) => {
            const status = getProductStatus(product);
            const statusEmoji = getStatusEmoji(product);

            content += `${index + 1}. ${statusEmoji} ${product.name}\n`;
            content += `   Código:        ${product.code}\n`;
            content += `   Stock actual:  ${product.quantity}\n`;
            if (product.minStock) {
                content += `   Stock mínimo:  ${product.minStock}\n`;
            }
            content += `   Estado:        ${status}\n`;
            content += "───────────────────────────────────────\n";
        });

        content += "\n═══════════════════════════════════════\n";
        content += "Fin del reporte\n";
        content += "═══════════════════════════════════════\n";

        // Generar nombre de archivo con fecha
        const fileName = `inventario_${getFormattedDate()}.txt`;
        const fileUri = FileSystem.documentDirectory + fileName;

        // Escribir archivo
        await FileSystem.writeAsStringAsync(fileUri, content, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Compartir archivo
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
            return true;
        } else {
            Alert.alert("Error", "La función de compartir no está disponible en este dispositivo");
            return false;
        }
    } catch (error) {
        console.error("Error exportando PDF:", error);
        Alert.alert("Error", "No se pudo exportar el archivo");
        return false;
    }
}

/**
 * Exporta movimientos a CSV
 */
export async function exportMovementsToCSV(movements) {
    try {
        if (!movements || movements.length === 0) {
            Alert.alert("Error", "No hay movimientos para exportar");
            return;
        }

        // Crear encabezados
        const headers = "Fecha,Producto,Tipo,Cantidad,Estado Sincronización\n";

        // Crear filas de datos
        const rows = movements.map(movement => {
            const date = new Date(movement.date).toLocaleString();
            const type = movement.type === "entrada" ? "Entrada" : "Salida";
            const synced = movement.synced ? "Sincronizado" : "Pendiente";
            return `"${date}","${movement.productName}","${type}",${movement.quantity},"${synced}"`;
        }).join("\n");

        const csvContent = headers + rows;

        // Generar nombre de archivo con fecha
        const fileName = `movimientos_${getFormattedDate()}.csv`;
        const fileUri = FileSystem.documentDirectory + fileName;

        // Escribir archivo
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Compartir archivo
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
            return true;
        } else {
            Alert.alert("Error", "La función de compartir no está disponible en este dispositivo");
            return false;
        }
    } catch (error) {
        console.error("Error exportando movimientos CSV:", error);
        Alert.alert("Error", "No se pudo exportar el archivo CSV");
        return false;
    }
}

// Funciones auxiliares
function getProductStatus(product) {
    if (product.quantity === 0) return "SIN STOCK";
    if (product.minStock && product.quantity <= product.minStock) return "STOCK BAJO";
    return "STOCK NORMAL";
}

function getStatusEmoji(product) {
    if (product.quantity === 0) return "🚫";
    if (product.minStock && product.quantity <= product.minStock) return "⚠️";
    return "✅";
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getFormattedDateTime() {
    const now = new Date();
    return now.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}