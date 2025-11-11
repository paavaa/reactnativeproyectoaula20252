import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TextInput, Button, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getPendingMovements } from "../services/offline";
import { exportMovementsToCSV } from "../services/export";

export default function ReportsScreen() {
    const [movements, setMovements] = useState([]);
    const [dateFilter, setDateFilter] = useState("");
    const [filtered, setFiltered] = useState([]);
    const [exporting, setExporting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchMovements = async () => {
                const stored = await getPendingMovements();
                const sorted = (stored || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                setMovements(sorted);
                setFiltered(sorted);
            };

            fetchMovements();
            setDateFilter("");

            return () => { };
        }, [])
    );

    const filterByDate = () => {
        if (!dateFilter) {
            setFiltered(movements);
            return;
        }

        const filteredList = movements.filter((m) => {
            const moveDate = new Date(m.date).toISOString().split("T")[0];
            return moveDate === dateFilter;
        });

        setFiltered(filteredList);
    };

    const handleExportMovements = async () => {
        setExporting(true);
        await exportMovementsToCSV(filtered.length > 0 ? filtered : movements);
        setExporting(false);
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>📊 Reporte de Movimientos</Text>

            {/* Botón de exportación */}
            <TouchableOpacity
                style={styles.exportButton}
                onPress={handleExportMovements}
                disabled={exporting || movements.length === 0}
            >
                <Text style={styles.exportButtonText}>
                    {exporting ? "⏳ Exportando..." : "📊 Exportar Movimientos a CSV"}
                </Text>
            </TouchableOpacity>

            {exporting && (
                <View style={styles.exportingIndicator}>
                    <ActivityIndicator size="small" color="#4caf50" />
                    <Text style={styles.exportingText}>Generando archivo CSV...</Text>
                </View>
            )}

            <Text style={{ marginBottom: 5, marginTop: 15 }}>Filtrar por fecha (YYYY-MM-DD):</Text>
            <TextInput
                placeholder="Ej: 2025-11-10"
                value={dateFilter}
                onChangeText={setDateFilter}
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 8,
                    marginBottom: 10,
                }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 }}>
                <Button title="Filtrar" onPress={filterByDate} />
                <Button title="Limpiar Filtro" onPress={() => {
                    setDateFilter("");
                    setFiltered(movements);
                }} color="#888" />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 10,
                            borderBottomWidth: 1,
                            borderColor: "#ddd",
                        }}
                    >
                        <Text style={{ fontWeight: "bold" }}>{item.productName}</Text>
                        <Text>
                            Tipo: {item.type === "entrada" ? "Entrada ➕" : "Salida ➖"}
                        </Text>
                        <Text>Cantidad: {item.quantity}</Text>
                        <Text>Fecha: {new Date(item.date).toLocaleString()}</Text>
                        <Text>
                            Estado: {item.synced ? "Sincronizado ✅" : "Pendiente ⏳"}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={{ marginTop: 20, textAlign: "center" }}>
                        No hay movimientos para mostrar o que coincidan con el filtro.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    exportButton: {
        backgroundColor: "#4caf50",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    exportButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    exportingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#e8f5e9",
        borderRadius: 5,
        marginBottom: 10,
    },
    exportingText: {
        marginLeft: 10,
        color: "#4caf50",
        fontWeight: "bold",
    },
});