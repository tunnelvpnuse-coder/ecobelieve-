import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@omni-life/ui";

export function SafetyParentDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety · Parent Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.md },
  title: { fontSize: 18, fontWeight: "600", color: colors.navy },
});
