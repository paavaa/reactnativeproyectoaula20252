import React, { useState } from "react";
import { View, Text, FlatList, TextInput, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useProducts } from "../contexts/ProductsContext";
import { exportToCSV, exportToPDF } from "../services/export";

export default function InventoryScreen() {
    const [search, setSearch] = useState("");
    const [exporting, setExporting] = useState(false);
    const { products } = useProducts();

    if (!products) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text>Cargando inventario...</Text>
            </View>
        );
    }

    const filteredProducts = products.filter((product) => {
        const nameMatch = product.name ? product.name.toLowerCase().includes(search.toLowerCase()) : false;
        const codeMatch = product.code ? product.code.toLowerCase().includes(search.toLowerCase()) : false;
        return nameMatch || codeMatch;
    });

    const getStockStatus = (product) => {
        if (!product.minStock) return "normal";
        if (product.quantity === 0) return "empty";
        if (product.quantity <= product.minStock) return "low";
        return "normal";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "empty": return "#d32f2f";
            case "low": return "#ff9800";
            default: return "#4caf50";
        }
    };

    const getStatusEmoji = (status) => {
        switch (status) {
            case "empty": return "🚫";
            case "low": return "⚠️";
            default: return "✅";
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        await exportToCSV(filteredProducts.length > 0 ? filteredProducts : products);
        setExporting(false);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        await exportToPDF(filteredProducts.length > 0 ? filteredProducts : products);
        setExporting(false);
    };

    const lowStockCount = products.filter(p => getStockStatus(p) === "low").length;
    const emptyStockCount = products.filter(p => getStockStatus(p) === "empty").length;

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                📦 Inventario
            </Text>

            {/* Botones de exportación */}
            <View style={styles.exportContainer}>
                <TouchableOpacity
                    style={[styles.exportButton, styles.csvButton]}
                    onPress={handleExportCSV}
                    disabled={exporting}
                >
                    <Text style={styles.exportButtonText}>
                        {exporting ? "⏳" : "📊"} Exportar CSV
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.exportButton, styles.pdfButton]}
                    onPress={handleExportPDF}
                    disabled={exporting}
                >
                    <Text style={styles.exportButtonText}>
                        {exporting ? "⏳" : "📄"} Exportar Reporte
                    </Text>
                </TouchableOpacity>
            </View>

            {exporting && (
                <View style={styles.exportingIndicator}>
                    <ActivityIndicator size="small" color="#2196F3" />
                    <Text style={styles.exportingText}>Generando archivo...</Text>
                </View>
            )}

            {/* Resumen de alertas */}
            {(lowStockCount > 0 || emptyStockCount > 0) && (
                <View style={{
                    backgroundColor: "#fff3cd",
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 15,
                    borderLeftWidth: 4,
                    borderLeftColor: "#ff9800"
                }}>
                    {emptyStockCount > 0 && (
                        <Text style={{ color: "#d32f2f", fontWeight: "bold" }}>
                            🚫 {emptyStockCount} producto(s) sin stock
                        </Text>
                    )}
                    {lowStockCount > 0 && (
                        <Text style={{ color: "#ff6f00" }}>
                            ⚠️ {lowStockCount} producto(s) con stock bajo
                        </Text>
                    )}
                </View>
            )}

            <TextInput
                placeholder="Buscar producto..."
                value={search}
                onChangeText={setSearch}
                style={{ marginBottom: 15, padding: 8, borderWidth: 1 }}
            />

            {filteredProducts.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                    No hay productos para mostrar
                </Text>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const status = getStockStatus(item);
                        const statusColor = getStatusColor(status);
                        const statusEmoji = getStatusEmoji(status);

                        return (
                            <View style={{
                                marginBottom: 15,
                                padding: 15,
                                backgroundColor: "#fff",
                                borderRadius: 8,
                                borderLeftWidth: 5,
                                borderLeftColor: statusColor,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    {item.imageUrl && (
                                        <Image
                                            source={{ uri: item.imageUrl }}
                                            style={{
                                                width: 60,
                                                height: 60,
                                                marginRight: 15,
                                                borderRadius: 5
                                            }}
                                        />
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={{ fontSize: 20, marginRight: 5 }}>
                                                {statusEmoji}
                                            </Text>
                                            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                                                {item.name}
                                            </Text>
                                        </View>
                                        <Text style={{ color: "#666" }}>
                                            Código: {item.code}
                                        </Text>
                                        <Text style={{
                                            fontWeight: "bold",
                                            color: statusColor,
                                            fontSize: 16,
                                            marginTop: 5
                                        }}>
                                            Stock: {item.quantity}
                                        </Text>
                                        {item.minStock > 0 && (
                                            <Text style={{ fontSize: 12, color: "#666" }}>
                                                Stock mínimo: {item.minStock}
                                            </Text>
                                        )}
                                        {status === "low" && (
                                            <Text style={{
                                                fontSize: 12,
                                                color: "#ff6f00",
                                                marginTop: 5,
                                                fontWeight: "bold"
                                            }}>
                                                ⚠️ Reabastecer pronto
                                            </Text>
                                        )}
                                        {status === "empty" && (
                                            <Text style={{
                                                fontSize: 12,
                                                color: "#d32f2f",
                                                marginTop: 5,
                                                fontWeight: "bold"
                                            }}>
                                                🚫 SIN STOCK - Reabastecer urgente
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    exportContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        gap: 10,
    },
    exportButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    csvButton: {
        backgroundColor: "#4caf50",
    },
    pdfButton: {
        backgroundColor: "#2196F3",
    },
    exportButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    exportingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#e3f2fd",
        borderRadius: 5,
        marginBottom: 10,
    },
    exportingText: {
        marginLeft: 10,
        color: "#2196F3",
        fontWeight: "bold",
    },
});