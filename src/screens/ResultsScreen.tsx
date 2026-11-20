import React, { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Badge, Card, Empty, Loading, Muted } from "../components/ui";
import { api } from "../lib/api";
import { colors } from "../theme";

export function ResultsScreen() {
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.quizzes.studentCompleted();
      setRows((res.data as any[]) || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !rows.length) return <Loading />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {rows.length === 0 ? (
        <Empty text="No results yet. Complete a quiz to see scores here." />
      ) : (
        rows.map((r) => {
          const id = r.quizId || r.id;
          return (
            <Pressable key={r.submissionId || id} onPress={() => nav.navigate("ResultDetail", { quizId: id })}>
              <Card>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{r.title}</Text>
                    <Muted>
                      {r.subject || "General"}
                      {r.date ? ` · ${r.date}` : ""}
                    </Muted>
                  </View>
                  <Badge label={`${r.score ?? 0}%`} tone="success" />
                </View>
                {r.recommendation ? (
                  <Text style={styles.rec} numberOfLines={2}>
                    {r.recommendation}
                  </Text>
                ) : null}
              </Card>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  rec: { marginTop: 10, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
